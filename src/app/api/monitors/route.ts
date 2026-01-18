
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    const { data, error } = await supabase
        .from('monitors')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const body = await request.json()

    // Basic validation could be improved
    if (!body.name || !body.type) {
        return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('monitors')
        .insert([
            {
                name: body.name,
                url: body.url,
                type: body.type,
                interval: parseInt(body.interval) || 60,
                status: 'up', // Default status
                last_checked: null,
            },
        ])
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
}
