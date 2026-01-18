
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'


export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const body = await request.json()
    const { id } = params

    const { data, error } = await supabase
        .from('monitors')
        .update(body)
        .eq('id', id)
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
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
