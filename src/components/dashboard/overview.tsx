"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, ArrowUpCircle, CheckCircle2, Clock } from "lucide-react"

export function Overview() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Last 24 Hours Card */}
            <Card className="col-span-1 bg-card">
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

            {/* Quick Stats */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Monitors</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">35</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> 33 Up</span>
                        <span className="flex items-center text-red-500"><AlertCircle className="h-3 w-3 mr-1" /> 1 Down</span>
                        <span className="flex items-center text-gray-400"><ArrowUpCircle className="h-3 w-3 mr-1" /> 1 Paused</span>
                    </div>
                </CardContent>
            </Card>

            {/* Placeholder for Latest Incident */}
            <Card>
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
