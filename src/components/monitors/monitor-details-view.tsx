"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Pause, Play, Edit, Trash2, Globe, ShieldCheck, Clock, CheckCircle2, AlertCircle, Activity, ArrowUpCircle, Lock, Download, CloudRain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useMonitorModal } from "@/hooks/use-monitor-modal"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { supabase } from "@/lib/supabase"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    const [range, setRange] = React.useState("24h")
    const [customFrom, setCustomFrom] = React.useState("")
    const [customTo, setCustomTo] = React.useState("")

    const [analytics, setAnalytics] = React.useState<any>(null)
    const [chartData, setChartData] = React.useState<any[]>([])

    // Ensure we fetch BOTH monitor and analytics when dependencies change
    const fetchData = React.useCallback(async () => {
        try {
            // 1. Fetch Monitor (One-time or if ID changes)
            if (!monitor) {
                const res = await fetch(`/api/monitors/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setMonitor(data)
                }
            }

            // 2. Fetch Analytics (Depends on Range)
            const params = new URLSearchParams({ range })
            if (range === 'custom') {
                if (!customFrom || !customTo) return
                params.append('from', new Date(customFrom).toISOString())
                params.append('to', new Date(customTo).toISOString())
            }

            const anaRes = await fetch(`/api/analytics/heartbeats/${id}?${params.toString()}`)
            const anaData = await anaRes.json()
            setAnalytics(anaData)
            if (anaData.chart) {
                setChartData(anaData.chart)
            } else {
                setChartData([])
            }

        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }, [id, range, monitor, customFrom, customTo]) // monitor in dependency to avoid re-fetching it if already set, but logic inside protects it

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    // Real-time Update
    React.useEffect(() => {
        const channel = supabase
            .channel(`monitor-${id}-changes`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'monitors', filter: `id=eq.${id}` },
                (payload) => {
                    setMonitor((prev) => (prev ? { ...prev, ...payload.new } : prev))
                    toast.info(`Monitor status updated: ${payload.new.status}`)
                }
            )
            .subscribe()
        return () => { supabase.removeChannel(channel) }
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

    const handleExport = () => {
        if (!analytics?.chart || analytics.chart.length === 0) {
            toast.error("No data to export")
            return
        }

        // Convert to CSV
        const headers = ["Timestamp", "Latency (ms)", "Status"]
        const rows = analytics.chart.map((row: any) => [
            new Date(row.timestamp).toISOString(),
            row.latency,
            row.status
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map((r: any[]) => r.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `monitor_export_${id}_${range}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Export downloaded")
    }

    if (loading && !monitor) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>
    if (!monitor && !loading) return <div className="p-8">Monitor not found</div>

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(monitor?.status === 'paused' ? 'up' : 'paused')}>
                        {monitor?.status === 'paused' ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                        {monitor?.status === 'paused' ? 'Resume' : 'Pause'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/monitors/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <Card className="bg-card/50 border-none shadow-none">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${monitor?.status === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                {monitor?.status === 'up' ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <AlertCircle className="h-8 w-8 text-red-500" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{monitor?.name}</h1>
                                <a href={monitor?.url} target="_blank" className="text-sm text-green-500 hover:underline flex items-center mt-1">
                                    {monitor?.url} <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-1">Current status</div>
                                <div className={`text-xl font-bold ${monitor?.status === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {monitor?.status === 'up' ? 'Up' : 'Down'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    {monitor?.status === 'up' ? 'Operational' : 'Service Disruption'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-1">Last check</div>
                                <div className="text-xl font-bold">
                                    {monitor?.last_checked ? new Date(monitor.last_checked).toLocaleTimeString() : 'Never'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                                    Checked every {monitor?.interval && monitor.interval < 60 ? `${monitor.interval}s` : `${Math.floor((monitor?.interval || 0) / 60)}m`}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-none">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm text-muted-foreground">Last {range}</div>
                                    <div className="text-sm font-bold">
                                        {analytics?.uptime24h ? `${analytics.uptime24h.toFixed(3)}%` : '0.000%'}
                                    </div>
                                </div>
                                {/* Pill Bar Chart */}
                                <div className="flex gap-[3px] mt-3 h-10 items-end">
                                    {(() => {
                                        const totalBars = 30; // Fewer bars for cleaner "pill" look
                                        // Use 'chart' data which is already aggregated time-series
                                        const dataPoints = analytics?.chart || [];

                                        // We want to show the LAST 30 data points from the 24h/7d/30d series.
                                        // If we have more than 30, take the last 30.
                                        // If we have fewer, they will be right-aligned (latest at right).

                                        // Create array of 30 items
                                        const filled = [...Array(totalBars)].map((_, i) => {
                                            // Map index to data position
                                            // i=29 (rightmost) -> last item in dataPoints
                                            const dataIndex = dataPoints.length - (totalBars - i);
                                            if (dataIndex >= 0 && dataIndex < dataPoints.length) {
                                                return dataPoints[dataIndex];
                                            }
                                            return null;
                                        });

                                        return filled.map((point: any, i: number) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-[1px] transition-all duration-300 ${!point ? 'bg-zinc-800/50 h-full opacity-30' : // Dark for no data
                                                    point.status === 'up' ? 'bg-emerald-500 h-full hover:bg-emerald-400' : 'bg-red-500 h-full hover:bg-red-400'
                                                    }`}
                                                title={point ? `${new Date(point.timestamp).toLocaleString()}: ${point.status} (${point.latency}ms)` : 'No data'}
                                            />
                                        ));
                                    })()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
                                    <span>{analytics?.chart?.filter((h: any) => h.status === 'down').length || 0} incidents</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Uptime Range Stats */}
                    {/* Uptime Range Stats */}
                    <Card className="bg-card border-none">
                        <CardContent className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Last 7 days</div>
                                <div className={`text-2xl font-bold ${!analytics?.uptime7d || analytics.uptime7d >= 99 ? 'text-green-500' : 'text-red-500'}`}>
                                    {analytics?.uptime7d !== undefined ? `${analytics.uptime7d.toFixed(3)}%` : '---%'}
                                </div>
                                <div className="text-xs text-muted-foreground opacity-70">
                                    Last 7 days
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Last 30 days</div>
                                <div className={`text-2xl font-bold ${!analytics?.uptime30d || analytics.uptime30d >= 99 ? 'text-green-500' : 'text-red-500'}`}>
                                    {analytics?.uptime30d !== undefined ? `${analytics.uptime30d.toFixed(3)}%` : '---%'}
                                </div>
                                <div className="text-xs text-muted-foreground opacity-70">
                                    Last 30 days
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Last 365 days</div>
                                <div className="text-2xl font-bold text-muted-foreground">--.---%</div>
                                <div className="text-xs text-green-500 cursor-pointer hover:underline">Unlock with paid plans</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground flex flex-col gap-1">
                                    <span
                                        className={`cursor-pointer transition-colors flex items-center gap-1 ${range === 'custom' ? 'text-foreground font-medium' : 'hover:text-foreground text-muted-foreground'}`}
                                        onClick={() => setRange('custom')}
                                    >
                                        Custom Range <Edit className="h-3 w-3 opacity-50" />
                                    </span>
                                    {range === 'custom' && (
                                        <div className="flex flex-col gap-1 mt-1 animate-in fade-in zoom-in-95 duration-200">
                                            <input
                                                type="datetime-local"
                                                className="h-6 w-full rounded-md border border-input bg-background px-2 py-1 text-[10px] shadow-sm focus-visible:outline-none focus:border-ring cursor-pointer"
                                                value={customFrom}
                                                onChange={(e) => setCustomFrom(e.target.value)}
                                            />
                                            <input
                                                type="datetime-local"
                                                className="h-6 w-full rounded-md border border-input bg-background px-2 py-1 text-[10px] shadow-sm focus-visible:outline-none focus:border-ring cursor-pointer"
                                                value={customTo}
                                                onChange={(e) => setCustomTo(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={`text-2xl font-bold ${range === 'custom' && analytics?.uptime !== undefined ? (analytics.uptime >= 99 ? 'text-green-500' : 'text-red-500') : 'text-muted-foreground'}`}>
                                    {range === 'custom' && analytics?.uptime !== undefined ? `${analytics.uptime.toFixed(3)}%` : '--.---%'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart Section */}
                    <Card className="bg-card border-none overflow-hidden">
                        <CardHeader className="pb-0 border-b border-border/40 bg-muted/10">
                            <div className="flex items-center justify-between py-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-1">
                                    Response time <span className="text-green-500 text-xl leading-none">.</span>
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-background hover:bg-accent cursor-pointer text-xs font-normal border-border/50 text-muted-foreground gap-1">
                                        <Lock className="h-3 w-3 text-green-500" /> Setup alerts
                                    </Badge>

                                    <Tabs value={range} onValueChange={setRange} className="h-8">
                                        <TabsList className="h-8 bg-background border border-border/50">
                                            <TabsTrigger value="24h" className="text-xs h-6">24h</TabsTrigger>
                                            <TabsTrigger value="7d" className="text-xs h-6">7d</TabsTrigger>
                                            <TabsTrigger value="30d" className="text-xs h-6">30d</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[300px] w-full" style={{ height: 300, minWidth: 0 }}>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(val) => {
                                                    const d = new Date(val);
                                                    return range === '24h'
                                                        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                                }}
                                                minTickGap={50}
                                                fontSize={11}
                                                stroke="#888"
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                fontSize={11}
                                                stroke="#888"
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(val) => `${val}ms`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                                                itemStyle={{ color: '#e2e8f0' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                                labelFormatter={(val) => new Date(val).toLocaleString()}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="latency"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                dot={{ r: 3, fill: '#10b981' }}
                                                activeDot={{ r: 6 }}
                                                fill="url(#colorLatency)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No data available for this range
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-12 mt-8 px-4">
                                {(() => {
                                    // Calculate Stats
                                    const lats = chartData.map(d => d.latency).filter(l => l !== undefined);
                                    const avg = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;
                                    const min = lats.length ? Math.min(...lats) : 0;
                                    const max = lats.length ? Math.max(...lats) : 0;

                                    return (
                                        <>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-2xl font-bold text-foreground">{avg} ms</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground block font-medium">Average</span>
                                            </div>
                                            <div className="space-y-1 pl-6 border-l border-border/20">
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                                    <span className="text-2xl font-bold text-foreground">{min} ms</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground block font-medium">Minimum</span>
                                            </div>
                                            <div className="space-y-1 pl-6 border-l border-border/20">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-2xl font-bold text-foreground">{max} ms</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground block font-medium">Maximum</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Incidents Preview (Static for now, could fetch latest) */}
                    {/* ... (Existing Incidents Card logic optional or simplified) ... */}
                </div>

                <div className="space-y-6">
                    {/* Sidebar widgets */}
                    <Card className="bg-card border-none">
                        <CardHeader><CardTitle className="text-sm">Regions</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">North America</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
