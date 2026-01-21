import { supabase } from '@/lib/supabase'

export interface MonitorResult {
    id: string
    url: string
    status: string
    latency: number
    code: number
}

export async function checkMonitor(monitor: any): Promise<MonitorResult> {
    const start = performance.now()
    let status = 'down'
    let latency = 0
    let responseStatus = 0

    try {
        // Only supporting HTTP/HTTPS for now
        if (monitor.type === 'http' || monitor.type === 'keyword') {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), (monitor.timeout || 30) * 1000)

            const res = await fetch(monitor.url, {
                method: 'GET',
                signal: controller.signal,
                // Add a user agent so we don't get blocked by some firewalls
                headers: { 'User-Agent': 'UptimeRobot-Clone/1.0' }
            })

            clearTimeout(timeoutId)
            responseStatus = res.status

            if (res.ok) { // 200-299 standard success
                status = 'up'
            }

            // Specific keyword check
            if (monitor.type === 'keyword' && monitor.keyword && status === 'up') {
                const text = await res.text()
                if (!text.includes(monitor.keyword)) {
                    status = 'down' // Keyword missing
                }
            }
        }
    } catch (err) {
        console.error(`Check failed for ${monitor.url}:`, err)
        status = 'down'
    }

    const end = performance.now()
    latency = Math.round(end - start)

    // 3. Update Database

    // A. Insert Heartbeat
    await supabase.from('heartbeats').insert({
        monitor_id: monitor.id,
        status: status,
        latency: latency,
    })


    // B. Detect Status Change & Manage Incidents
    if (monitor.status !== status) {
        // Status has changed

        // --- 1. SEND NOTIFICATIONS ---
        const { data: notifications } = await supabase
            .from('monitor_notifications')
            .select('channel_id, notification_channels(type, config)')
            .eq('monitor_id', monitor.id)

        if (notifications && notifications.length > 0) {
            const eventType = status === 'down' ? 'DOWN' : 'UP'
            // const message = `Monitor ${monitor.name} (${monitor.url}) is ${eventType}. Code: ${responseStatus}`

            await Promise.all(notifications.map(async (n: any) => {
                const channel = n.notification_channels
                if (!channel) return

                try {
                    if (channel.type === 'webhook' && channel.config.webhook_url) {
                        await fetch(channel.config.webhook_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                event: eventType,
                                monitor: { id: monitor.id, name: monitor.name, url: monitor.url },
                                timestamp: new Date().toISOString()
                            })
                        })
                    } else if (channel.type === 'email' && channel.config.email_address) {
                        // Send Real Email via Resend
                        const { Resend } = require('resend')
                        if (process.env.RESEND_API_KEY) {
                            const resend = new Resend(process.env.RESEND_API_KEY)

                            await resend.emails.send({
                                from: 'UptimeRobot Clone <onboarding@resend.dev>',
                                to: channel.config.email_address,
                                subject: `Monitor Alert: ${monitor.name} is ${eventType}`,
                                html: `
                                    <div style="font-family: sans-serif; padding: 20px;">
                                        <h2 style="color: ${eventType === 'DOWN' ? 'red' : 'green'}">
                                            Monitor is ${eventType}
                                        </h2>
                                        <p><strong>Monitor:</strong> ${monitor.name}</p>
                                        <p><strong>URL:</strong> ${monitor.url}</p>
                                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                                        <p><strong>Status Code:</strong> ${responseStatus}</p>
                                        <br/>
                                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/monitors/${monitor.id}">View Details</a>
                                    </div>
                                `
                            })
                            console.log(`[EMAIL SENT] To: ${channel.config.email_address}`)
                        } else {
                            console.warn("RESEND_API_KEY not set")
                        }
                    }
                } catch (alertErr) {
                    console.error(`Failed to send alert to channel ${channel.type}`, alertErr)
                }
            }))
        }

        // --- 2. MANAGE INCIDENTS ---
        if (status === 'down') {
            // Monitor went DOWN -> Create Incident
            await supabase.from('incidents').insert({
                monitor_id: monitor.id,
                status: 'ongoing',
                root_cause: responseStatus > 0 ? `${responseStatus} Error` : 'Connection Failed',
                started_at: new Date().toISOString()
            })
        } else if (status === 'up' && monitor.status === 'down') {
            // Monitor came UP -> Resolve open incident
            // Find the latest ongoing incident
            const { data: ongoingIncidents } = await supabase
                .from('incidents')
                .select('id, started_at')
                .eq('monitor_id', monitor.id)
                .eq('status', 'ongoing')
                .order('started_at', { ascending: false })
                .limit(1)

            if (ongoingIncidents && ongoingIncidents.length > 0) {
                const incident = ongoingIncidents[0]
                const resolvedAt = new Date()
                const startedAt = new Date(incident.started_at)

                // Calculate simple duration string
                const diffMs = resolvedAt.getTime() - startedAt.getTime()
                const diffMins = Math.round(diffMs / 60000)
                const hrs = Math.floor(diffMins / 60)
                const mins = diffMins % 60
                const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`

                await supabase
                    .from('incidents')
                    .update({
                        status: 'Resolved',
                        resolved_at: resolvedAt.toISOString(),
                        duration: durationStr
                    })
                    .eq('id', incident.id)
            }
        }
    }

    // C. Update Monitor Status
    await supabase
        .from('monitors')
        .update({
            status: status,
            last_checked: new Date().toISOString(),
        })
        .eq('id', monitor.id)

    return {
        id: monitor.id,
        url: monitor.url,
        status,
        latency,
        code: responseStatus
    }
}
