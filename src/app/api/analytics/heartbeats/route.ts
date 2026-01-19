import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    try {
        // Fetch heartbeats from the last 24 hours
        // Note: In production you'd use a more efficient query or a materialized view
        // For now, we fetch recent raw heartbeats and aggregate in JS
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: heartbeats, error } = await supabase
            .from('heartbeats')
            .select('timestamp, latency, status')
            .gte('timestamp', twentyFourHoursAgo)
            .order('timestamp', { ascending: true })

        if (error) throw error

        // If no data, return empty structure that frontend can handle (or show empty state)
        if (!heartbeats || heartbeats.length === 0) {
            return NextResponse.json({ chart: [] })
        }

        // Aggregate by hour
        const hourlyData: Record<string, { count: number, totalLatency: number }> = {}

        heartbeats.forEach(hb => {
            const date = new Date(hb.timestamp)
            const key = date.getHours().toString().padStart(2, '0') + ":00"

            if (!hourlyData[key]) {
                hourlyData[key] = { count: 0, totalLatency: 0 }
            }
            if (hb.latency) {
                hourlyData[key].count++
                hourlyData[key].totalLatency += hb.latency
            }
        })

        const chartData = Object.keys(hourlyData).map(time => ({
            time,
            ms: Math.round(hourlyData[time].totalLatency / hourlyData[time].count)
        })).sort((a, b) => parseInt(a.time) - parseInt(b.time))

        // Calculate stats
        const totalHeartbeats = heartbeats.length
        const totalSuccessful = heartbeats.filter(h => h.status === 'up' || (h.status as any) === 200).length // Adapting to possible status types
        const uptime = totalHeartbeats > 0 ? (totalSuccessful / totalHeartbeats) * 100 : 100

        return NextResponse.json({
            chart: chartData,
            stats: {
                uptime: Math.round(uptime * 100) / 100 // Round to 2 decimals
            }
        })

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }
}
