
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Define public paths that don't require authentication
    const PUBLIC_PATHS = [
        '/login',
        '/auth',
        '/status', // Covers /status/[slug] and other status subpaths
        '/api/status-pages/public',
        '/api/cron'
    ]

    const path = request.nextUrl.pathname
    const isPublicPath = PUBLIC_PATHS.some(publicPath =>
        path.startsWith(publicPath)
    )

    console.log(`[Middleware] Path: ${path}, User: ${!!user}, IsPublic: ${isPublicPath}`)

    if (!user && !isPublicPath) {
        console.log(`[Middleware] Redirecting to /login`)
        // Return to login if no user and trying to access protected route
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return response
}
