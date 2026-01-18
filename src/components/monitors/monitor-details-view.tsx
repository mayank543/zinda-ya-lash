"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Pause, Play, Edit, Trash2, Globe, ShieldCheck, Clock, CheckCircle2, AlertCircle, Activity, ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useMonitorModal } from "@/hooks/use-monitor-modal"

interface Monitor {
    id: string
    name: string
    url: string
    status: "up" | "down" | "paused"
    type: string
    interval: number
    last_checked: string | null
}

export function MonitorDetailsView({ id }: { id: string }) {
    const router = useRouter()
    const { onOpen } = useMonitorModal()
    const [monitor, setMonitor] = React.useState<Monitor | null>(null)
    const [loading, setLoading] = React.useState(true)

    const fetchMonitor = async () => {
        try {
            // Re-using the list API for single monitor for now, optimized later
            // In a real app we'd have a specific GET /api/monitors/[id] endpoint
            const res = await fetch("/api/monitors")
            const data = await res.json()
            const found = data.find((m: Monitor) => m.id === id)
            if (found) {
                setMonitor(found)
            }
        } catch (error) {
            console.error("Failed to fetch monitor", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchMonitor()
    }, [id])

    const handleStatusChange = async (newStatus: string) => {
        if (!monitor) return
        try {
            const res = await fetch(`/api/monitors/${monitor.id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
                headers: { "Content-Type": "application/json" }
            })
            if (res.ok) {
                setMonitor({ ...monitor, status: newStatus as any })
                toast.success(`Monitor ${newStatus === 'paused' ? 'paused' : 'resumed'}`)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    if (loading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>
    if (!monitor) return <div className="p-8">Monitor not found</div>

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Test notification sent')}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Test Notification
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(monitor.status === 'paused' ? 'up' : 'paused')}>
                        {monitor.status === 'paused' ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                        {monitor.status === 'paused' ? 'Resume' : 'Pause'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onOpen(monitor)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Column (Main Stats) */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Header Info Card */}
                    <Card className="bg-card/50 border-none shadow-none">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${monitor.status === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                {monitor.status === 'up' ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <AlertCircle className="h-8 w-8 text-red-500" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{monitor.name}</h1>
                                <a href={monitor.url} target="_blank" className="text-sm text-green-500 hover:underline flex items-center mt-1">
                                    HTTP(s) monitor for {monitor.url} <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </Card>

                    {/* Status Grid Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-1">Current status</div>
                                <div className={`text-xl font-bold ${monitor.status === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {monitor.status === 'up' ? 'Up' : 'Down'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    Operational
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-1">Last check</div>
                                <div className="text-xl font-bold">
                                    16s ago
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                                    Checked every {monitor.interval}s
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm text-muted-foreground">Last 24 hours</div>
                                    <div className="text-sm font-bold">100.00%</div>
                                </div>
                                <div className="flex gap-[2px] mt-2 h-8 items-end">
                                    {[...Array(30)].map((_, i) => (
                                        <div key={i} className="flex-1 bg-green-500 h-full rounded-sm opacity-80" />
                                    ))}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    0 incidents
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Uptime Percentage Row */}
                    <Card className="bg-card border-none">
                        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Last 7 days</div>
                                <div className="text-xl font-bold text-green-500">100.00%</div>
                                <div className="text-xs text-muted-foreground">0 incidents</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Last 30 days</div>
                                <div className="text-xl font-bold text-green-500">100.00%</div>
                                <div className="text-xs text-muted-foreground">0 incidents</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Last 365 days</div>
                                <div className="text-xl font-bold text-muted-foreground">--.---%</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Date range</div>
                                <div className="text-xl font-bold text-muted-foreground">--.---%</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Response Time Chart */}
                    <Card className="bg-card border-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Response time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-end justify-between gap-1 mt-4 relative">
                                {/* Simple Line Chart Placeholder using CSS */}
                                <div className="absolute inset-x-0 top-1/2 h-[2px] bg-green-500/50"></div>
                                <div className="w-full h-full bg-gradient-to-t from-green-500/5 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xl font-bold">272 ms</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground block">Average</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-xl font-bold">269 ms</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground block">Minimum</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-orange-500" />
                                        <span className="text-xl font-bold">275 ms</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground block">Maximum</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Latest Incidents */}
                    <Card className="bg-card border-none">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-md font-semibold">Latest incidents</CardTitle>
                                <Button variant="outline" size="sm">Export logs</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border/50">
                                    <div>Status</div>
                                    <div>Root Cause</div>
                                    <div>Started</div>
                                    <div>Duration</div>
                                </div>
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No incidents reported.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Sidebar Widgets) */}
                <div className="space-y-6">
                    {/* Domain & SSL */}
                    <Card className="bg-card border-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Domain & SSL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">Domain valid until</div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">Unlock</span>
                                </div>
                            </div>
                            <Separator className="bg-border/50" />
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">SSL certificate valid until</div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">Unlock</span>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                Available only in Solo, Team and Enterprise. <span className="text-green-500 underline cursor-pointer">Upgrade now</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Maintenance */}
                    <Card className="bg-card border-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Next maintenance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-center text-muted-foreground mb-4">
                                No maintenance planned.
                            </div>
                            <Button className="w-full" variant="outline" size="sm">Set up maintenance</Button>
                        </CardContent>
                    </Card>

                    {/* Regions */}
                    <Card className="bg-card border-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Regions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 bg-muted/20 rounded flex items-center justify-center">
                                <Globe className="h-12 w-12 text-muted-foreground/20" />
                            </div>
                            <div className="mt-2 text-sm font-bold">North America</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
