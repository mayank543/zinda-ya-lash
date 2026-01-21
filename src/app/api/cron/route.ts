
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkMonitor } from '@/lib/monitor-utils'

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
        // 2. Fetch Active Maintenance Windows
        const now = new Date().toISOString()
        const { data: activeWindows } = await supabase
            .from('maintenance_windows')
            .select('id, maintenance_monitors(monitor_id)')
            .or(`status.eq.active,and(status.eq.scheduled,start_time.lte.${now},end_time.gte.${now})`)

        const maintenanceMonitorIds = new Set<string>()
        if (activeWindows) {
            activeWindows.forEach((w: any) => {
                if (w.maintenance_monitors) {
                    w.maintenance_monitors.forEach((m: any) => maintenanceMonitorIds.add(m.monitor_id))
                }
            })
        }

        // 3. Filter out monitors currently in maintenance
        const monitorsToCheck = monitors.filter(m => !maintenanceMonitorIds.has(m.id))

        if (monitorsToCheck.length === 0) {
            return NextResponse.json({ message: 'All monitors are in maintenance or paused' })
        }

        // 4. Check each monitor (in parallel)
        const results = await Promise.all(
            monitorsToCheck.map(async (monitor) => {
                return await checkMonitor(monitor)
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
