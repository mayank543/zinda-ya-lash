import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const channelSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['email', 'webhook', 'slack']),
    config: z.object({
        email_address: z.string().email().optional(),
        webhook_url: z.string().url().optional(),
    }).refine((data) => data.email_address || data.webhook_url, {
        message: "Config must contain email_address or webhook_url"
    })
})

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { data: channels, error } = await supabase
            .from('notification_channels')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(channels)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await request.json()
        const { name, type, config } = channelSchema.parse(body)

        // Validate type-specific config
        if (type === 'email' && !config.email_address) {
            return NextResponse.json({ error: "Email address is required for email channels" }, { status: 400 })
        }
        if (type === 'webhook' && !config.webhook_url) {
            return NextResponse.json({ error: "Webhook URL is required for webhook channels" }, { status: 400 })
        }

        const { data: channel, error } = await supabase
            .from('notification_channels')
            .insert({
                user_id: user.id,
                name,
                type,
                config
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(channel)
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
