
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wrench, Plus, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function MaintenancePage() {
    const [windows, setWindows] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)

    // Form State
    const [title, setTitle] = React.useState("")
    const [startTime, setStartTime] = React.useState("")
    const [endTime, setEndTime] = React.useState("")
    const [allMonitors, setAllMonitors] = React.useState<any[]>([])
    const [selectedMonitorIds, setSelectedMonitorIds] = React.useState<string[]>([])

    const fetchWindows = React.useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('maintenance_windows')
            .select('*')
            .order('start_time', { ascending: false })

        if (data) setWindows(data)
        setLoading(false)
    }, [])

    const fetchMonitors = React.useCallback(async () => {
        const { data } = await supabase.from('monitors').select('id, name')
        if (data) setAllMonitors(data)
    }, [])

    React.useEffect(() => {
        fetchWindows()
        fetchMonitors()
    }, [fetchWindows, fetchMonitors])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // 1. Create Window
            const { data: windowData, error } = await supabase
                .from('maintenance_windows')
                .insert({
                    title,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    status: 'scheduled'
                })
                .select()
                .single()

            if (error) throw error

            // 2. Associate Monitors
            if (selectedMonitorIds.length > 0) {
                const relations = selectedMonitorIds.map(mid => ({
                    maintenance_id: windowData.id,
                    monitor_id: mid
                }))
                await supabase.from('maintenance_monitors').insert(relations)
            }

            toast.success("Maintenance window created")
            setOpen(false)
            fetchWindows()
            // Reset
            setTitle("")
            setStartTime("")
            setEndTime("")
            setSelectedMonitorIds([])
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const toggleMonitor = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedMonitorIds(prev => [...prev, id])
        } else {
            setSelectedMonitorIds(prev => prev.filter(mid => mid !== id))
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    Maintenance Windows
                </h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="mr-2 h-4 w-4" /> Schedule Maintenance
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Schedule Maintenance</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Database Upgrade" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start">Start Time</Label>
                                    <Input
                                        id="start"
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end">End Time</Label>
                                    <Input
                                        id="end"
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Affected Monitors</Label>
                                <div className="border rounded-md p-4 h-[150px] overflow-y-auto space-y-2">
                                    {allMonitors.map(m => (
                                        <div key={m.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`m-${m.id}`}
                                                className="h-4 w-4"
                                                checked={selectedMonitorIds.includes(m.id)}
                                                onChange={(e) => toggleMonitor(m.id, e.target.checked)}
                                            />
                                            <label htmlFor={`m-${m.id}`} className="text-sm">{m.name}</label>
                                        </div>
                                    ))}
                                    {allMonitors.length === 0 && <p className="text-sm text-muted-foreground">No monitors found.</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Schedule</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell></TableRow>
                        ) : windows.length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No maintenance windows scheduled.</TableCell></TableRow>
                        ) : (
                            windows.map(w => (
                                <TableRow key={w.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Wrench className="h-4 w-4 text-muted-foreground" />
                                            {w.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="text-muted-foreground">Start: {new Date(w.start_time).toLocaleString()}</span>
                                            <span className="text-muted-foreground">End: {new Date(w.end_time).toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{w.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
