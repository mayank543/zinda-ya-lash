
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic' // Ensure this runs dynamically

export async function GET() {
    try {
        // 1. Fetch all active monitors
        const { data: monitors, error } = await supabase
            .from('monitors')
            .select('*')
            .neq('status', 'paused')

        if (error) throw error
        if (!monitors || monitors.length === 0) {
            return NextResponse.json({ message: 'No monitors to check' })
        }

        // 2. Check each monitor (in parallel)
        const results = await Promise.all(
            monitors.map(async (monitor) => {
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

                // B. Update Monitor Status
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
            })
        )

        return NextResponse.json({
            success: true,
            checked_count: results.length,
            results
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
