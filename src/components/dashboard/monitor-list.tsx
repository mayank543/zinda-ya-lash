"use client"

import * as React from "react"
import { toast } from "sonner"
import {
    ArrowUpCircle,
    ArrowDownCircle,
    PauseCircle,
    Search,
    MoreHorizontal,
    ExternalLink,
    Play,
    Pause,
    Trash2,
    Edit,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface Monitor {
    id: string
    name: string
    url: string
    status: "up" | "down" | "paused"
    type: string
    interval: number
    last_checked: string | null
    created_at: string
}

import { useMonitorModal } from "@/hooks/use-monitor-modal"
import { supabase } from "@/lib/supabase"

export function MonitorList() {
    const { onOpen } = useMonitorModal()
    const [monitors, setMonitors] = React.useState<Monitor[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const router = useRouter()

    const fetchMonitors = async () => {
        try {
            const res = await fetch("/api/monitors")
            const data = await res.json()
            if (Array.isArray(data)) {
                setMonitors(data)
            }
        } catch (error) {
            console.error("Failed to fetch monitors:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchMonitors()

        // Real-time subscription
        const channel = supabase
            .channel('monitor-list-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'monitors',
                },
                (payload) => {
                    console.log('Real-time update received:', payload)
                    // Optimistic update or refresh
                    if (payload.eventType === 'UPDATE') {
                        setMonitors((prev) =>
                            prev.map((m) =>
                                m.id === payload.new.id ? { ...m, ...payload.new } : m
                            )
                        )
                        toast.info(`Monitor ${payload.new.name || 'updated'} status changed to ${payload.new.status}`)
                    } else if (payload.eventType === 'INSERT') {
                        setMonitors((prev) => [payload.new as Monitor, ...prev])
                        toast.success(`New monitor ${payload.new.name} added`)
                    } else if (payload.eventType === 'DELETE') {
                        setMonitors((prev) => prev.filter((m) => m.id !== payload.old.id))
                        toast.info("Monitor deleted")
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this monitor?")) return

        try {
            const res = await fetch(`/api/monitors/${id}`, { method: "DELETE" })
            if (res.ok) {
                setMonitors(monitors.filter(m => m.id !== id))
                router.refresh()
                toast.success("Monitor deleted successfully")
            } else {
                throw new Error("Failed to delete")
            }
        } catch (error) {
            console.error("Failed to delete monitor:", error)
            toast.error("Failed to delete monitor")
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        // Optimistic update
        const previousMonitors = [...monitors]
        setMonitors(monitors.map(m =>
            m.id === id ? { ...m, status: newStatus as any } : m
        ))

        try {
            const res = await fetch(`/api/monitors/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
                headers: { "Content-Type": "application/json" }
            })

            if (res.ok) {
                toast.success(`Monitor ${newStatus === 'paused' ? 'paused' : 'resumed'}`)
            } else {
                // Revert on failure
                setMonitors(previousMonitors)
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error("Failed to update status:", error)
            setMonitors(previousMonitors)
            toast.error("Failed to update status")
        }
    }

    const filteredMonitors = monitors.filter((monitor) => {
        const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            monitor.url?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || monitor.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "up":
                return <ArrowUpCircle className="h-4 w-4 text-green-500" />
            case "down":
                return <ArrowDownCircle className="h-4 w-4 text-red-500" />
            case "paused":
                return <PauseCircle className="h-4 w-4 text-gray-400" />
            default:
                return <ArrowUpCircle className="h-4 w-4 text-gray-300" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "up":
                return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Up</Badge>
            case "down":
                return <Badge variant="destructive">Down</Badge>
            case "paused":
                return <Badge variant="secondary">Paused</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    if (loading) {
        return (
            <div className="xl:col-span-4 space-y-4">
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        )
    }

    return (
        <div className="xl:col-span-4 rounded-md border bg-card">
            <div className="p-6 pb-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Monitors</h3>
                        <p className="text-sm text-muted-foreground mr-4">Overview of your monitored endpoints.</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="default"
                            size="sm"
                            className="mr-2 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={async () => {
                                const toastId = toast.loading("Running checks...")
                                try {
                                    const res = await fetch("/api/cron")
                                    const data = await res.json()
                                    if (res.ok) {
                                        toast.success(`Checked ${data.checked_count} monitors`, { id: toastId })
                                        fetchMonitors() // Refresh list
                                    } else {
                                        toast.error("Failed to run checks", { id: toastId })
                                    }
                                } catch (e) {
                                    toast.error("Error running checks", { id: toastId })
                                }
                            }}
                        >
                            <Play className="h-3 w-3 mr-1" /> Run Checks
                        </Button>
                        <Button
                            variant={statusFilter === "all" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setStatusFilter("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant={statusFilter === "up" ? "secondary" : "ghost"}
                            size="sm"
                            className="text-green-600"
                            onClick={() => setStatusFilter("up")}
                        >
                            Up
                        </Button>
                        <Button
                            variant={statusFilter === "down" ? "secondary" : "ghost"}
                            size="sm"
                            className="text-red-500"
                            onClick={() => setStatusFilter("down")}
                        >
                            Down
                        </Button>
                    </div>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search monitors..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-muted-foreground">Last Check</TableHead>
                            <TableHead className="text-right text-muted-foreground">Interval</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMonitors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No monitors found. Add one to get started!
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMonitors.map((monitor) => (
                                <TableRow key={monitor.id}>
                                    <TableCell>
                                        {getStatusIcon(monitor.status)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <div
                                                onClick={() => router.push(`/monitors/${monitor.id}`)}
                                                className="font-medium hover:underline cursor-pointer"
                                            >
                                                {monitor.name}
                                            </div>
                                            <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground flex items-center hover:underline truncate max-w-[200px]">
                                                {monitor.url} <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(monitor.status)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {monitor.last_checked ? new Date(monitor.last_checked).toLocaleString() : "Pending"}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {monitor.interval < 60 ? `${monitor.interval}s` : `${Math.floor(monitor.interval / 60)}m`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => window.open(monitor.url, '_blank')}>
                                                    <ExternalLink className="mr-2 h-4 w-4" /> Visit URL
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/monitors/${monitor.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleStatusChange(monitor.id, monitor.status === 'paused' ? 'up' : 'paused')}>
                                                    {monitor.status === "paused" ? (
                                                        <>
                                                            <Play className="mr-2 h-4 w-4" /> Resume
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pause className="mr-2 h-4 w-4" /> Pause
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(monitor.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View - Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredMonitors.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground border rounded-md p-4">
                        No monitors found. Add one to get started!
                    </div>
                ) : (
                    filteredMonitors.map((monitor) => (
                        <div key={monitor.id} className="border rounded-lg p-4 space-y-3 bg-card text-card-foreground shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(monitor.status)}
                                    <div className="font-semibold">{monitor.name}</div>
                                </div>
                                {getStatusBadge(monitor.status)}
                            </div>

                            <div className="text-sm">
                                <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground flex items-center hover:underline truncate">
                                    {monitor.url} <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>
                                    <span className="font-medium">Checked:</span> {monitor.last_checked ? new Date(monitor.last_checked).toLocaleTimeString() : "Pending"}
                                </div>
                                <div>
                                    <span className="font-medium">Interval:</span> {monitor.interval < 60 ? `${monitor.interval}s` : `${Math.floor(monitor.interval / 60)}m`}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => router.push(`/monitors/${monitor.id}`)}
                                >
                                    Details
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleStatusChange(monitor.id, monitor.status === 'paused' ? 'up' : 'paused')}
                                >
                                    {monitor.status === "paused" ? (
                                        <>
                                            <Play className="mr-2 h-4 w-4" /> Resume
                                        </>
                                    ) : (
                                        <>
                                            <Pause className="mr-2 h-4 w-4" /> Pause
                                        </>
                                    )}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/monitors/${monitor.id}/edit`)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(monitor.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
