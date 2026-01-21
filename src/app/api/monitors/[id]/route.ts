
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkMonitor } from '@/lib/monitor-utils'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    // Check access by trying to fetch
    const { data, error } = await supabase
        .from('monitors')
        .select('*, monitor_notifications(channel_id)')
        .eq('id', id)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    return NextResponse.json(data)
}

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const params = await props.params;
    const body = await request.json()
    const { id } = params

    // Separate notifications from monitor fields
    const { notifications, ...monitorUpdates } = body

    // 1. Update Monitor Fields
    const { data, error } = await supabase
        .from('monitors')
        .update(monitorUpdates)
        .eq('id', id)
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 2. Update Notifications Associations if provided
    if (notifications && Array.isArray(notifications)) {
        // Delete existing
        await supabase.from('monitor_notifications').delete().eq('monitor_id', id)

        // Insert new (if any)
        if (notifications.length > 0) {
            const rows = notifications.map((channelId: string) => ({
                monitor_id: id,
                channel_id: channelId
            }))
            const { error: linkError } = await supabase.from('monitor_notifications').insert(rows)
            if (linkError) console.error("Failed to link notifications", linkError)
        }
    }

    // SPECIAL: If Resuming (status -> 'up'), run an immediate check!
    // We don't want to show "up" if it's actually down.
    if (monitorUpdates.status === 'up') {
        const monitorToCheck = data[0]
        // Run check asynchronously (or await if we want to return real status)
        // Let's await it so UI gets real status immediately
        const result = await checkMonitor(monitorToCheck)

        // Return the updated updated monitor (checkMonitor updates DB)
        return NextResponse.json({ ...monitorToCheck, status: result.status, last_checked: new Date().toISOString() })
    }

    return NextResponse.json(data[0])
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const params = await props.params;
    const { id } = params

    const { error } = await supabase
        .from('monitors')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
