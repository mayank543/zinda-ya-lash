import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        // Fetch heartbeats from the last 24 hours for this monitor
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: heartbeats, error } = await supabase
            .from('heartbeats')
            .select('timestamp, latency, status')
            .eq('monitor_id', id)
            .gte('timestamp', twentyFourHoursAgo)
            .order('timestamp', { ascending: true })

        if (error) throw error

        if (!heartbeats || heartbeats.length === 0) {
            return NextResponse.json({
                uptime24h: 0,
                bars: [],
                avgLatency: 0
            })
        }

        // Calculate 24h Uptime Percentage
        const totalChecks = heartbeats.length
        const upChecks = heartbeats.filter(hb => hb.status === 'up').length
        const uptime24h = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0

        // Calculate Average Latency
        const totalLatency = heartbeats.reduce((acc, hb) => acc + (hb.latency || 0), 0)
        const avgLatency = totalChecks > 0 ? Math.round(totalLatency / totalChecks) : 0

        // Generate 30 bars (representing roughly ~48 mins each if 24h, or just last 30 checks if frequent)
        // For accurate bars we'd need to bucket time. For now, let's map the last 30 checks directly if available,
        // or bucket them. Let's simple-bucket into 30 slices of time.

        // Simpler approach for visual bars: take the last 30 heartbeats if we have enough, or pad with empty.
        // Actually, user expects time distribution. 
        // Let's just pass the raw heartbeat statuses and let frontend render/decide, 
        // BUT for the "Last 24h" bars usually we show chunks.
        // Let's return raw data for frontend flexibility for now.

        return NextResponse.json({
            uptime24h,
            heartbeats,
            avgLatency
        })

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch monitor analytics" }, { status: 500 })
    }
}
