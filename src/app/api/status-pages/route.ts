
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    const { data, error } = await supabase
        .from('status_pages')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const body = await request.json()

    if (!body.name || !body.slug) {
        return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 })
    }

    // Insert Page
    const { data, error } = await supabase
        .from('status_pages')
        .insert({
            name: body.name,
            slug: body.slug,
            password: body.password || null,
            password_enabled: !!body.password
        })
        .select()
        .single()

    if (error) {
        // Handle unique slug error specifically if possible
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const newPage = data

    // If monitors are provided, insert them into junction
    if (body.monitors && Array.isArray(body.monitors) && body.monitors.length > 0) {
        const junctionData = body.monitors.map((monitorId: string) => ({
            status_page_id: newPage.id,
            monitor_id: monitorId
        }))

        const { error: junctionError } = await supabase
            .from('status_page_monitors')
            .insert(junctionData)

        if (junctionError) {
            console.error("Failed to associate monitors", junctionError)
            // We return success for the page creation but maybe log a warning
        }
    }

    return NextResponse.json(newPage)
}
