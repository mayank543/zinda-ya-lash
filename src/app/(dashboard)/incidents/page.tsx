"use client"

import { useRouter } from "next/navigation"

import * as React from "react"
import { Search, Filter, Download, Info, CheckCircle2, AlertCircle, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Mock Data matching the screenshot
const incidents = [
    {
        id: 1,
        status: "Resolved",
        monitor: "my-portfolio-to0o.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Jan 5, 2026, 20:01:17 GMT+5:30",
        resolved: "Jan 6, 2026, 22:45:10 GMT+5:30",
        duration: "1d 2h 43m",
        visibility: "Included"
    },
    {
        id: 2,
        status: "Resolved",
        monitor: "cinematch-kx6i.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Dec 28, 2025, 01:49:39 GMT+5:30",
        resolved: "Jan 18, 2026, 12:20:05 GMT+5:30",
        duration: "21d 10h 30m",
        visibility: "Included"
    },
    {
        id: 3,
        status: "Resolved",
        monitor: "hangout-hub-p4mn.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Dec 28, 2025, 01:49:09 GMT+5:30",
        resolved: "Jan 1, 2026, 12:21:22 GMT+5:30",
        duration: "4d 10h 32m",
        visibility: "Included"
    },
    {
        id: 4,
        status: "Resolved",
        monitor: "my-portfolio-to0o.onrender.com",
        rootCause: "500 Internal Server Error",
        code: 500,
        comments: 0,
        started: "Dec 5, 2025, 14:31:14 GMT+5:30",
        resolved: "Dec 6, 2025, 01:01:37 GMT+5:30",
        duration: "10h 30m 23s",
        visibility: "Included"
    },
    {
        id: 5,
        status: "Resolved",
        monitor: "cinematch-kx6i.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Dec 4, 2025, 22:06:49 GMT+5:30",
        resolved: "Dec 15, 2025, 14:15:57 GMT+5:30",
        duration: "10d 16h 9m",
        visibility: "Included"
    },
    {
        id: 6,
        status: "Resolved",
        monitor: "my-portfolio-to0o.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Dec 1, 2025, 11:31:54 GMT+5:30",
        resolved: "Dec 1, 2025, 12:33:15 GMT+5:30",
        duration: "1h 1m 21s",
        visibility: "Included"
    },
    {
        id: 7,
        status: "Resolved",
        monitor: "hangout-hub-p4mn.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Nov 30, 2025, 22:50:50 GMT+5:30",
        resolved: "Dec 13, 2025, 00:16:45 GMT+5:30",
        duration: "12d 1h 25m",
        visibility: "Included"
    },
    {
        id: 8,
        status: "Ongoing",
        monitor: "codegenerator-srdk.onrender.com",
        rootCause: "502 Bad Gateway",
        code: 502,
        comments: 0,
        started: "Nov 23, 2025, 02:12:05 GMT+5:30",
        resolved: "Not yet resolved",
        duration: "1mo 26d 13h",
        visibility: "Included"
    },
    {
        id: 9,
        status: "Resolved",
        monitor: "hangout-hub-p4mn.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Nov 14, 2025, 14:11:37 GMT+5:30",
        resolved: "Nov 27, 2025, 19:19:21 GMT+5:30",
        duration: "13d 5h 7m",
        visibility: "Included"
    },
    {
        id: 10,
        status: "Resolved",
        monitor: "my-portfolio-to0o.onrender.com",
        rootCause: "503 Service Unavailable",
        code: 503,
        comments: 0,
        started: "Nov 6, 2025, 23:13:20 GMT+5:30",
        resolved: "Nov 11, 2025, 01:23:58 GMT+5:30",
        duration: "4d 2h 10m",
        visibility: "Included"
    }
]

export default function IncidentsPage() {
    const router = useRouter()
    const [incidents, setIncidents] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchIncidents() {
            try {
                const res = await fetch("/api/incidents")
                const data = await res.json()
                if (Array.isArray(data)) {
                    setIncidents(data)
                }
            } catch (error) {
                console.error("Failed to fetch incidents")
            } finally {
                setLoading(false)
            }
        }
        fetchIncidents()
    }, [])

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold tracking-tight">Incidents<span className="text-green-500">.</span></h1>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name or url"
                            className="pl-8 bg-background"
                        />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="All tags" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All tags</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="started-new">
                        <SelectTrigger className="w-[180px]">
                            <span className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">⇅</span> Started - Newest...
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="started-new">Started - Newest First</SelectItem>
                            <SelectItem value="started-old">Started - Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-900/30 border border-blue-900/50 rounded-md p-4 flex items-start gap-4 relative">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <h4 className="font-semibold text-blue-100">Possible IP Allowlist Issue</h4>
                    <p className="text-sm text-blue-200/80">
                        If you're using a firewall, please ensure our new IPs are allowlisted to avoid potential monitoring issues. <a href="#" className="underline hover:text-white">Check IP list</a>
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-blue-200 hover:text-white hover:bg-blue-900/50">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Incidents Table */}
            <div className="border rounded-md bg-card min-h-[400px]">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading incidents...</div>
                ) : incidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No incidents reported</h3>
                        <p className="text-muted-foreground max-w-md">
                            Everything is running smoothly. We haven't detected any downtime for your monitors.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border/50">
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="min-w-[200px]">Monitor</TableHead>
                                <TableHead className="min-w-[200px]">Root Cause</TableHead>
                                <TableHead className="w-[100px]">Comments</TableHead>
                                <TableHead className="min-w-[180px]">Started</TableHead>
                                <TableHead className="min-w-[180px]">Resolved</TableHead>
                                <TableHead className="min-w-[120px]">Duration</TableHead>
                                <TableHead className="w-[100px]">Visibility</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incidents.map((incident) => (
                                <TableRow
                                    key={incident.id}
                                    className="hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                                    onClick={() => router.push(`/incidents/${incident.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {incident.status === "Resolved" ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span className="text-green-500 font-medium text-xs">{incident.status}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-red-500 font-medium text-xs">{incident.status}</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-xs text-muted-foreground">
                                        {incident.monitors?.name || "Unknown Monitor"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="rounded-sm text-[10px] px-1.5 py-0.5 font-normal border-0 text-white bg-red-500/80"
                                        >
                                            <span className="font-bold mr-1">Error</span> {incident.root_cause}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{incident.comments_count || 0}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs whitespace-pre-line">
                                        {new Date(incident.started_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs whitespace-pre-line">
                                        {incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{incident.duration || '-'}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">Included</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
            {incidents.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                    Showing {incidents.length} incidents
                </div>
            )}
        </div>
    )
}
