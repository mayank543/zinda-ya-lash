"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, ArrowUpCircle, CheckCircle2, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

import * as React from "react"

export function Overview() {
    const [stats, setStats] = React.useState({
        total: 0,
        up: 0,
        down: 0,
        paused: 0
    })

    React.useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/monitors")
                const data = await res.json()
                const up = data.filter((m: any) => m.status === 'up').length
                const down = data.filter((m: any) => m.status === 'down').length
                const paused = data.filter((m: any) => m.status === 'paused').length
                setStats({
                    total: data.length,
                    up,
                    down,
                    paused
                })
            } catch (error) {
                console.error("Failed to fetch stats")
            }
        }
        fetchStats()

        // Real-time subscription to refresh stats
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
                    fetchStats() // Re-fetch on any change
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Last 24 Hours Card - STILL STALE (Needs Heartbeat Data) */}
            <Card className="col-span-1 bg-card relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-50">
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/30">MOCK DATA</span>
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">Last 24 hours</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <div className="text-2xl font-bold text-green-500">100%</div>
                            <p className="text-xs text-muted-foreground">Overall uptime</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Incidents</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">1d</div>
                            <p className="text-xs text-muted-foreground">Without incid.</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Affected mon.</p>
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

            {/* Placeholder for Latest Incident - STILL STALE */}
            <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-50">
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/30">MOCK DATA</span>
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Incident</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">None</div>
                    <p className="text-xs text-muted-foreground">
                        All systems operational
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
