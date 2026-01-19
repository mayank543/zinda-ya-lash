
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Page Details
    const { data: page, error } = await supabase
        .from('status_pages')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 2. Fetch Associated Monitor IDs
    // RLS: User can only select status_pages they own. The junction table 'status_page_monitors' 
    // requires logic to ensure they own the Status Page.
    const { data: monitorRelations } = await supabase
        .from('status_page_monitors')
        .select('monitor_id')
        .eq('status_page_id', id)

    const monitorIds = monitorRelations ? monitorRelations.map(r => r.monitor_id) : []

    return NextResponse.json({ ...page, monitorIds })
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // 1. Update Page Fields
    const updates: any = {}
    if (body.name) updates.name = body.name
    if (body.slug) updates.slug = body.slug
    if (body.domain !== undefined) updates.domain = body.domain
    if (body.status) updates.status = body.status
    if (body.password !== undefined) {
        updates.password = body.password || null
        updates.password_enabled = !!body.password
    }
    // Appearance
    if (body.logo_url !== undefined) updates.logo_url = body.logo_url
    if (body.favicon_url !== undefined) updates.favicon_url = body.favicon_url

    const { data, error } = await supabase
        .from('status_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 2. Update Monitors Association
    if (body.monitors && Array.isArray(body.monitors)) {
        // A. Remove existing
        await supabase
            .from('status_page_monitors')
            .delete()
            .eq('status_page_id', id)

        // B. Insert new
        if (body.monitors.length > 0) {
            const junctionData = body.monitors.map((monitorId: string) => ({
                status_page_id: id,
                monitor_id: monitorId
            }))
            await supabase
                .from('status_page_monitors')
                .insert(junctionData)
        }
    }

    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    const { error } = await supabase
        .from('status_pages')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
