"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
    { time: "00:00", ms: 120 },
    { time: "01:00", ms: 132 },
    { time: "02:00", ms: 101 },
    { time: "03:00", ms: 154 },
    { time: "04:00", ms: 142 },
    { time: "05:00", ms: 128 },
    { time: "06:00", ms: 135 },
    { time: "07:00", ms: 160 },
    { time: "08:00", ms: 210 },
    { time: "09:00", ms: 195 },
    { time: "10:00", ms: 145 },
    { time: "11:00", ms: 130 },
    { time: "12:00", ms: 125 },
    { time: "13:00", ms: 140 },
    { time: "14:00", ms: 142 },
    { time: "15:00", ms: 138 },
    { time: "16:00", ms: 145 },
    { time: "17:00", ms: 155 },
    { time: "18:00", ms: 160 },
    { time: "19:00", ms: 175 },
    { time: "20:00", ms: 165 },
    { time: "21:00", ms: 150 },
    { time: "22:00", ms: 130 },
    { time: "23:00", ms: 125 },
]

export function ResponseTimeChart() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Avg. Response Time</CardTitle>
                <CardDescription>
                    Average response time (ms) over the last 24 hours.
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
