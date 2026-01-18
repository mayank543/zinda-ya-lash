"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Activity, ArrowUpCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useParams, notFound } from "next/navigation"

export default function PublicStatusPage() {
    const params = useParams()
    const slug = params.slug as string

    const [page, setPage] = React.useState<any>(null)
    const [monitors, setMonitors] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [overallStatus, setOverallStatus] = React.useState<'up' | 'down' | 'degraded'>('up')

    React.useEffect(() => {
        async function fetchData() {
            if (!slug) return
            try {
                // 1. Fetch Status Page Config
                const { data: pageData, error: pageError } = await supabase
                    .from('status_pages')
                    .select('*')
                    .eq('slug', slug)
                    .single()

                if (pageError || !pageData) {
                    console.error("Page not found")
                    setLoading(false)
                    return
                }
                setPage(pageData)

                // 2. Fetch Monitors (All active monitors for now)
                // In a real app, this would be filtered by a join table status_page_monitors
                const { data: monitorsData } = await supabase
                    .from('monitors')
                    .select('*')
                    .neq('status', 'paused')
                    .order('name')

                if (monitorsData) {
                    setMonitors(monitorsData)

                    // Calculate Overall Status
                    const hasDown = monitorsData.some(m => m.status === 'down')
                    setOverallStatus(hasDown ? 'down' : 'up')
                }

            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    if (!loading && !page) {
        return notFound()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <Activity className="h-8 w-8 text-muted-foreground mb-4" />
                    <div className="h-4 w-32 bg-muted rounded"></div>
                </div>
            </div>
        )
    }

    // Styles based on configs
    const isWide = page.layout_density === 'wide'
    const isCenter = page.layout_alignment === 'center'
    const containerClass = isWide ? "max-w-5xl" : "max-w-3xl"
    const alignClass = isCenter ? "items-center text-center" : "items-start text-left"

    return (
        <div className={`min-h-screen bg-background text-foreground font-sans`}>
            {/* Top Bar / Branding */}
            <div className="border-b bg-card py-6">
                <div className={`${containerClass} mx-auto px-4 w-full flex flex-col ${alignClass}`}>
                    {page.logo_url ? (
                        <img src={page.logo_url} alt={page.name} className="h-10 mb-4 object-contain" />
                    ) : (
                        <h1 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                            <Activity className="h-6 w-6 text-green-500" />
                            {page.name}
                        </h1>
                    )}

                    {/* Overall Status Banner */}
                    <div className={`w-full rounded-lg p-6 flex items-center ${isCenter ? 'justify-center' : 'justify-start'} gap-4 ${overallStatus === 'up'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                        {overallStatus === 'up' ? (
                            <CheckCircle2 className="h-8 w-8 shrink-0" />
                        ) : (
                            <AlertCircle className="h-8 w-8 shrink-0" />
                        )}
                        <div className="text-left">
                            <h2 className="text-2xl font-bold">
                                {overallStatus === 'up' ? 'All systems operational' : 'Some systems are down'}
                            </h2>
                            <p className="opacity-90">
                                {overallStatus === 'up'
                                    ? 'All monitors are returning a successful status.'
                                    : 'We are currently investigating issues with some of our services.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monitors List */}
            <div className={`${containerClass} mx-auto px-4 py-8 w-full`}>
                <div className="space-y-4">
                    {monitors.map((monitor) => (
                        <Card key={monitor.id} className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${monitor.status === 'up' ? 'bg-green-500' :
                                                monitor.status === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />

                                        <div>
                                            <h3 className="font-semibold text-lg">{monitor.name}</h3>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                {monitor.type.toUpperCase()}
                                                <span className="text-muted-foreground/50">•</span>
                                                Interval: {monitor.interval < 60 ? `${monitor.interval}s` : `${Math.floor(monitor.interval / 60)}m`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Simple Uptime Visualization (90-day bars placeholder) */}
                                        <div className="hidden md:flex items-center gap-[2px] h-8 opacity-50" title="90-day uptime history">
                                            {Array.from({ length: 30 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 h-full rounded-full ${monitor.status === 'down' && i > 25 ? 'bg-red-500' : 'bg-green-500'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        <Badge variant={monitor.status === 'up' ? 'outline' : 'destructive'} className={monitor.status === 'up' ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                                            {monitor.status === 'up' ? 'Operational' : 'Down'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="py-8 text-center text-sm text-muted-foreground border-t mt-12">
                <p className="flex items-center justify-center gap-1">
                    Powered by <a href="#" className="font-semibold hover:underline text-foreground">Figmenta UptimeRobot</a>
                </p>
                <p className="text-xs mt-2 opacity-60">Status updates are not guaranteed to be real-time.</p>
            </div>
        </div>
    )
}
