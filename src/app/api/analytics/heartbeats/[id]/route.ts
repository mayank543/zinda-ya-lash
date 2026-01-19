import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const range = searchParams.get('range') || '24h'
        const fromParam = searchParams.get('from')
        const toParam = searchParams.get('to')

        // 1. Determine Start and End Time for the MAIN Chart/List Data
        const now = new Date()
        let startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Default 24h
        let endTime = now

        if (range === '7d') {
            startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (range === '30d') {
            startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        } else if (range === 'custom' && fromParam && toParam) {
            const parsedFrom = new Date(fromParam)
            const parsedTo = new Date(toParam)
            if (!isNaN(parsedFrom.getTime()) && !isNaN(parsedTo.getTime())) {
                startTime = parsedFrom
                endTime = parsedTo
            }
        }

        // 2. Fetch Heartbeats (Main Data)
        const { data: heartbeats, error } = await supabase
            .from('heartbeats')
            .select('timestamp, latency, status')
            .eq('monitor_id', id)
            .gte('timestamp', startTime.toISOString())
            .lte('timestamp', endTime.toISOString())
            .order('timestamp', { ascending: true })

        if (error) throw error

        // 3. Parallel Uptime Calculation (24h, 7d, 30d) regardless of selected range
        const nowMs = new Date().getTime()
        const time24h = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString()
        const time7d = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString()
        const time30d = new Date(nowMs - 30 * 24 * 60 * 60 * 1000).toISOString()

        const [
            { count: total24h },
            { count: up24h },
            { count: total7d },
            { count: up7d },
            { count: total30d },
            { count: up30d }
        ] = await Promise.all([
            supabase.from('heartbeats').select('*', { count: 'exact', head: true }).eq('monitor_id', id).gte('timestamp', time24h),
            supabase.from('heartbeats').select('*', { count: 'exact', head: true }).eq('monitor_id', id).gte('timestamp', time24h).eq('status', 'up'),
            supabase.from('heartbeats').select('*', { count: 'exact', head: true }).eq('monitor_id', id).gte('timestamp', time7d),
            supabase.from('heartbeats').select('*', { count: 'exact', head: true }).eq('monitor_id', id).gte('timestamp', time7d).eq('status', 'up'),
            supabase.from('heartbeats').select('*', { count: 'exact', head: true }).eq('monitor_id', id).gte('timestamp', time30d),
            supabase.from('heartbeats').select('*', { count: 'exact', head: true }).eq('monitor_id', id).gte('timestamp', time30d).eq('status', 'up'),
        ])

        const uptime24h = (total24h || 0) > 0 ? ((up24h || 0) / (total24h || 0)) * 100 : 0
        const uptime7d = (total7d || 0) > 0 ? ((up7d || 0) / (total7d || 0)) * 100 : 0
        const uptime30d = (total30d || 0) > 0 ? ((up30d || 0) / (total30d || 0)) * 100 : 0

        // 4. Determine Display Uptime based on Range
        let uptime = 0
        if (range === '24h') uptime = uptime24h
        else if (range === '7d') uptime = uptime7d
        else if (range === '30d') uptime = uptime30d
        else {
            // For custom, calculate from fetched heartbeats
            if (heartbeats && heartbeats.length > 0) {
                const totalChecks = heartbeats.length
                const upChecks = heartbeats.filter(hb => hb.status === 'up').length
                uptime = (upChecks / totalChecks) * 100
            }
        }

        // 5. Calculate Avg Latency & Chart Data
        const validHeartbeats = heartbeats || []
        const totalChecks = validHeartbeats.length
        const totalLatency = validHeartbeats.reduce((acc, hb) => acc + (hb.latency || 0), 0)
        const avgLatency = totalChecks > 0 ? Math.round(totalLatency / totalChecks) : 0

        // Downsampling for Chart
        const chartData = []
        if (validHeartbeats.length > 200) {
            const bucketSize = Math.ceil(validHeartbeats.length / 100)
            for (let i = 0; i < validHeartbeats.length; i += bucketSize) {
                const slice = validHeartbeats.slice(i, i + bucketSize)
                if (slice.length === 0) continue
                const sliceLatency = slice.reduce((a, b) => a + (b.latency || 0), 0) / slice.length
                const anyDown = slice.some(h => h.status === 'down')
                chartData.push({
                    timestamp: slice[0].timestamp,
                    latency: Math.round(sliceLatency),
                    status: anyDown ? 'down' : 'up'
                })
            }
        } else {
            chartData.push(...validHeartbeats)
        }

        return NextResponse.json({
            uptime,
            uptime24h,
            uptime7d,
            uptime30d,
            chart: chartData,
            avgLatency,
            range
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
