
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Simple query to keep the database active
        // We use a lightweight query that hits the database but doesn't transfer much data
        const { count, error } = await supabase
            .from('monitors')
            .select('*', { count: 'exact', head: true })

        if (error) {
            console.error('Database keep-alive ping failed:', error)
            throw error
        }

        return NextResponse.json({
            success: true,
            message: 'Database pinged successfully',
            timestamp: new Date().toISOString(),
            monitor_count: count
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Keep-alive ping failed', details: error.message },
            { status: 500 }
        )
    }
}
