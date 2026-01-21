
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params
    const supabase = await createClient()

    const { data: incident, error } = await supabase
        .from('incidents')
        .select(`
            *,
            monitors (
                name,
                url
            )
        `)
        .eq('id', id)
        .single()

    if (error || !incident) {
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    return NextResponse.json(incident)
}
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const body = await request.json()
    const { id } = params
    const supabase = await createClient()

    // 1. Fetch current incident to calculate duration
    const { data: incident, error: fetchError } = await supabase
        .from('incidents')
        .select('started_at')
        .eq('id', id)
        .single()

    if (fetchError || !incident) {
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    // 2. Prepare updates
    const updates: any = {}
    const newStatus = body.status

    if (newStatus && newStatus.toLowerCase() === 'resolved') {
        const resolvedAt = new Date()
        // Ensure started_at is valid
        const startedAt = incident.started_at ? new Date(incident.started_at) : new Date()

        // Calculate duration
        const diffMs = resolvedAt.getTime() - startedAt.getTime()
        const diffMins = Math.round(diffMs / 60000)
        const hrs = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`

        updates.status = 'Resolved' // Standardize to Capitalized for UI consistency
        updates.resolved_at = resolvedAt.toISOString()
        updates.duration = durationStr
    } else if (newStatus) {
        updates.status = newStatus
    }

    // 3. Update DB
    const { data: updated, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error("Error updating incident:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params
    const supabase = await createClient()

    const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
