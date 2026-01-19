
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const { data, error } = await supabase
        .from('incident_comments')
        .select('*')
        .eq('incident_id', id)
        .order('created_at', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()

    if (!body.content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // 1. Insert Comment
    const { data, error } = await supabase
        .from('incident_comments')
        .insert({
            incident_id: id,
            content: body.content,
            user_email: body.user_email || 'System'
        })
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 2. Increment comment count on incident
    await supabase.rpc('increment_incident_comments', { row_id: id })
    // ^ Note: Need to create this RPC or just do a raw update. 
    // Let's do a raw update for simplicity if we don't have RPC.

    // Check if we can increment easily
    const { data: incident } = await supabase
        .from('incidents')
        .select('comments_count')
        .eq('id', id)
        .single()

    if (incident) {
        await supabase
            .from('incidents')
            .update({ comments_count: (incident.comments_count || 0) + 1 })
            .eq('id', id)
    }

    return NextResponse.json(data[0])
}
