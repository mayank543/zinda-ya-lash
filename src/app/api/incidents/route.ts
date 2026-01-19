
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: incidents, error } = await supabase
            .from('incidents')
            .select(`
                *,
                monitors (
                    name,
                    url
                )
            `)
            .order('started_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(incidents)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
