"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Pause, Play, Edit, Trash2, Globe, ShieldCheck, Clock, CheckCircle2, AlertCircle, Activity, ArrowUpCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useMonitorModal } from "@/hooks/use-monitor-modal"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { supabase } from "@/lib/supabase"

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

    const [analytics, setAnalytics] = React.useState<any>(null)

    const fetchMonitor = async () => {
        try {
            // Fetch Monitor Details
            const res = await fetch("/api/monitors")
            const data = await res.json()
            const found = data.find((m: Monitor) => m.id === id)
            if (found) {
                setMonitor(found)
            }

            // Fetch Analytics
            const analyticsRes = await fetch(`/api/analytics/heartbeats/${id}`)
            const analyticsData = await analyticsRes.json()
            setAnalytics(analyticsData)

        } catch (error) {
            console.error("Failed to fetch monitor data", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchMonitor()

        // Real-time for this specific monitor
        const channel = supabase
            .channel(`monitor-${id}-changes`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'monitors',
                    filter: `id=eq.${id}`,
                },
                (payload) => {
                    console.log('Real-time update for details:', payload)
                    setMonitor((prev) => (prev ? { ...prev, ...payload.new } : prev))
                    toast.info(`Monitor status updated to ${payload.new.status}`)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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
            {/* ... (Keep Header Buttons same as before) ... */}
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
                    <Button variant="outline" size="sm" onClick={() => router.push(`/monitors/${monitor.id}/edit`)}>
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
                                    {monitor.status === 'up' ? 'Operational' : 'Service Disruption'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-1">Last check</div>
                                <div className="text-xl font-bold">
                                    {monitor.last_checked ? new Date(monitor.last_checked).toLocaleTimeString() : 'Never'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                                    Checked every {monitor.interval < 60 ? `${monitor.interval}s` : `${Math.floor(monitor.interval / 60)}m`}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm text-muted-foreground">Last 24 hours</div>
                                    <div className="text-sm font-bold">
                                        {analytics?.uptime24h ? `${analytics.uptime24h.toFixed(2)}%` : '0.00%'}
                                    </div>
                                </div>
                                <div className="flex gap-[3px] mt-2 h-8 items-end">
                                    {/* Fixed count of bars to maintain visual structure (e.g., 40 bars) */}
                                    {(() => {
                                        const totalBars = 40;
                                        const heartbeats = analytics?.heartbeats || [];
                                        // Make sure we have 40 slots. If fewer heartbeats, pad with empty. If more, slice.
                                        // Actually, better to just map the last N heartbeats or show gray for missing data in a timeline?
                                        // For simplicity and matching the "uptime bar" look, let's just show the last N status checks as bars.
                                        // If we have fewer than totalBars, we pad the START with gray (no data).

                                        const padded = [...Array(Math.max(0, totalBars - heartbeats.length)).fill(null), ...heartbeats.slice(-totalBars)];

                                        return padded.map((hb: any, i: number) => (
                                            <div
                                                key={i}
                                                className={`flex-1 h-full rounded-[2px] opacity-90 transition-all ${!hb ? 'bg-muted/20' :
                                                    hb.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                                                    }`}
                                                title={hb ? `${new Date(hb.timestamp).toLocaleTimeString()}: ${hb.status}` : 'No data'}
                                            />
                                        ));
                                    })()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    {analytics?.heartbeats?.filter((h: any) => h.status === 'down').length || 0} incidents
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Uptime Percentage Row */}
                    <Card className="bg-card border-none">
                        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Last 7 days</div>
                                <div className={`text-xl font-bold ${analytics?.uptime24h === 100 ? 'text-green-500' : analytics?.uptime24h > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                    {analytics?.uptime24h ? `${analytics.uptime24h.toFixed(2)}%` : '0.00%'}
                                </div>
                                <div className="text-xs text-muted-foreground">0 incidents</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Last 30 days</div>
                                <div className="text-xl font-bold text-red-500">85.681%</div>
                                <div className="text-xs text-muted-foreground">1 incident</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Last 365 days</div>
                                <div className="text-xl font-bold text-muted-foreground">--.---%</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                    Pick a date range
                                </div>
                                <div className="text-xl font-bold text-muted-foreground">--.---%</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Response Time Chart */}
                    <Card className="bg-card border-none">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium flex items-center gap-1">
                                    Response time <span className="text-green-500">.</span>
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-card text-xs font-normal border-border/50 text-muted-foreground gap-1"><Lock className="h-3 w-3 text-green-500" /> Setup alerts</Badge>
                                    <Badge variant="outline" className="bg-card text-xs font-normal border-border/50 text-muted-foreground">Last 24 hours</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[250px] w-full mt-4">
                                {analytics?.heartbeats && analytics.heartbeats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics.heartbeats}>
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                minTickGap={30}
                                            />
                                            <YAxis
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `${value}ms`}
                                            />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                            Latency
                                                                        </span>
                                                                        <span className="font-bold text-muted-foreground">
                                                                            {payload[0].value} ms
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="latency"
                                                stroke="#22c55e"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                        No response time data yet.
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-12 mt-4 px-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-2xl font-bold">{analytics?.avgLatency || 0} ms</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground block">Average</span>
                                </div>
                                <div className="space-y-1 pl-4 border-l border-border/50">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-2xl font-bold">110 ms</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground block">Minimum</span>
                                </div>
                                <div className="space-y-1 pl-4 border-l border-border/50">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-2xl font-bold">346 ms</span>
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
