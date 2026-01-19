"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, ArrowUpCircle, CheckCircle2, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

import * as React from "react"

import { formatDistanceToNow } from "date-fns"

export function Overview() {
    const [stats, setStats] = React.useState({
        total: 0,
        up: 0,
        down: 0,
        paused: 0
    })
    const [uptime, setUptime] = React.useState<number | null>(null)
    const [latestIncident, setLatestIncident] = React.useState<any>(null)
    const [incidentCount, setIncidentCount] = React.useState(0)
    const [daysWithoutIncident, setDaysWithoutIncident] = React.useState<string>("0d")

    React.useEffect(() => {
        async function fetchStats() {
            try {
                // Monitor Stats
                const resMonitors = await fetch("/api/monitors")
                const dataMonitors = await resMonitors.json()
                const up = dataMonitors.filter((m: any) => m.status === 'up').length
                const down = dataMonitors.filter((m: any) => m.status === 'down').length
                const paused = dataMonitors.filter((m: any) => m.status === 'paused').length
                setStats({
                    total: dataMonitors.length,
                    up,
                    down,
                    paused
                })

                // Uptime Stats
                const resHeartbeats = await fetch("/api/analytics/heartbeats")
                const dataHeartbeats = await resHeartbeats.json()
                if (dataHeartbeats.stats?.uptime !== undefined) {
                    setUptime(dataHeartbeats.stats.uptime)
                }

                // Incident Stats
                const resIncidents = await fetch("/api/incidents")
                const dataIncidents = await resIncidents.json()
                if (Array.isArray(dataIncidents)) {
                    setLatestIncident(dataIncidents[0] || null)

                    // Filter incidents from last 24h
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                    const recentIncidents = dataIncidents.filter((i: any) => new Date(i.started_at) > oneDayAgo)
                    setIncidentCount(recentIncidents.length)

                    // Days without incident
                    if (dataIncidents.length > 0) {
                        const lastIncidentDate = new Date(dataIncidents[0].started_at)
                        setDaysWithoutIncident(formatDistanceToNow(lastIncidentDate))
                    } else {
                        setDaysWithoutIncident("Forever")
                    }
                }

            } catch (error) {
                console.error("Failed to fetch stats")
            }
        }
        fetchStats()

        // Real-time subscription to refresh stats (simplified for now, mostly monitors)
        const channel = supabase
            .channel('overview-stats-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'monitors',
                },
                () => {
                    fetchStats()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Last 24 Hours Card - REAL DATA */}
            <Card className="col-span-1 bg-card relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">Last 24 hours</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <div className="text-2xl font-bold text-green-500">
                                {uptime !== null ? `${uptime}%` : '-'}
                            </div>
                            <p className="text-xs text-muted-foreground">Overall uptime</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{incidentCount}</div>
                            <p className="text-xs text-muted-foreground">Incidents</p>
                        </div>
                        <div>
                            <div className="text-xl font-bold truncate">{daysWithoutIncident.replace('about ', '')}</div>
                            <p className="text-xs text-muted-foreground">Since last incident</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.down}</div>
                            <p className="text-xs text-muted-foreground">Current down</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats - REAL DATA */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Monitors</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> {stats.up} Up</span>
                        <span className="flex items-center text-red-500"><AlertCircle className="h-3 w-3 mr-1" /> {stats.down} Down</span>
                        <span className="flex items-center text-gray-400"><ArrowUpCircle className="h-3 w-3 mr-1" /> {stats.paused} Paused</span>
                    </div>
                </CardContent>
            </Card>

            {/* Latest Incident - REAL DATA */}
            <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Incident</CardTitle>
                    <AlertCircle className={`h-4 w-4 ${latestIncident ? 'text-red-500' : 'text-green-500'}`} />
                </CardHeader>
                <CardContent>
                    {latestIncident ? (
                        <>
                            <div className="text-lg font-bold truncate">{latestIncident.monitors?.name || 'Unknown Monitor'}</div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(latestIncident.started_at).toLocaleString()}
                            </p>
                            <div className="mt-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block">
                                {latestIncident.cause || 'Connection Timeout'}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold text-muted-foreground">None</div>
                            <p className="text-xs text-muted-foreground">
                                All systems operational
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
