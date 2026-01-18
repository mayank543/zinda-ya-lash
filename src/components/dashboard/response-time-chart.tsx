"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function ResponseTimeChart() {
    const [data, setData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/analytics/heartbeats")
                const json = await res.json()
                if (json.chart && json.chart.length > 0) {
                    setData(json.chart)
                } else {
                    // Keep mock data or empty state if no real data yet? 
                    // Let's show empty if no data to prove it's "real"
                    setData([])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Avg. Response Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading real data...</p>
            </CardContent>
        </Card>
    )

    if (data.length === 0) return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Avg. Response Time</CardTitle>
                <CardDescription>
                    Real-time data from your monitors.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-t">
                <div className="text-center">
                    <p className="text-muted-foreground mb-2">No heartbeat data recorded yet.</p>
                    <p className="text-xs text-muted-foreground">Make sure your cron job is running or wait for the next check.</p>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Avg. Response Time</CardTitle>
                <CardDescription>
                    Average response time (ms) over the last 24 hours (Real Data).
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="time"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}ms`}
                            />
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                formatter={(value: number | undefined) => [`${value}ms`, "Response Time"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="ms"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMs)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
