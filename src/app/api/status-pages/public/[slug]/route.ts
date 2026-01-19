
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const body = await request.json().catch(() => ({}))
    const providedPassword = body.password

    // 1. Fetch Page Config
    const { data: page, error } = await supabase
        .from('status_pages')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error || !page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // 2. Check Password
    if (page.password_enabled) {
        if (page.password && page.password !== providedPassword) {
            return NextResponse.json({
                error: 'Unauthorized',
                protected: true,
                requiresPassword: true
            }, { status: 401 })
        }
    }

    // 3. Fetch Associated Monitors
    // We need to join through the junction table
    const { data: relations } = await supabase
        .from('status_page_monitors')
        .select('monitor_id')
        .eq('status_page_id', page.id)

    let monitors: any[] = []

    if (relations && relations.length > 0) {
        const monitorIds = relations.map(r => r.monitor_id)
        const { data: monitorsData } = await supabase
            .from('monitors')
            .select('*')
            .in('id', monitorIds)
            .order('name')

        if (monitorsData) monitors = monitorsData
    }

    return NextResponse.json({
        page: {
            ...page,
            password: null // Don't leak the password
        },
        monitors
    })
}
