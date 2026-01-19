
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    const { data, error } = await supabase
        .from('incidents')
        .select(`
            *,
            monitors (
                id,
                name,
                url,
                type
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // Validate status
    if (body.status && !['ongoing', 'resolved', 'acknowledged'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updates: any = {}
    if (body.status) updates.status = body.status
    if (body.root_cause) updates.root_cause = body.root_cause
    if (body.status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
}
