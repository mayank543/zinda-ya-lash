
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
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Share2, Plus, Webhook, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)

    // Form
    const [type, setType] = React.useState("webhook")
    const [name, setName] = React.useState("")
    const [url, setUrl] = React.useState("")

    const fetchIntegrations = React.useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('integrations')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setIntegrations(data)
        setLoading(false)
    }, [])

    React.useEffect(() => {
        fetchIntegrations()
    }, [fetchIntegrations])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { error } = await supabase
                .from('integrations')
                .insert({
                    type,
                    name,
                    config: { url },
                    events: ['down', 'up', 'incident'] // subscribe to all by default for now
                })

            if (error) throw error

            toast.success("Integration added")
            setOpen(false)
            resetForm()
            fetchIntegrations()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this integration?")) return
        const { error } = await supabase.from('integrations').delete().eq('id', id)
        if (!error) {
            toast.success("Deleted")
            fetchIntegrations()
        }
    }

    const resetForm = () => {
        setName("")
        setUrl("")
        setType("webhook")
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    Integrations
                </h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Add Integration
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Integration</DialogTitle>
                            <DialogDescription>
                                Connect UptimeRobot to your favorite tools.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Integration Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="webhook">Webhook</SelectItem>
                                        <SelectItem value="slack">Slack (Incoming Webhook)</SelectItem>
                                        <SelectItem value="discord">Discord (Webhook)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Friends Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Production Slack" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Webhook URL</Label>
                                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://..." />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Integration</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
                        ) : integrations.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No integrations configured.</TableCell></TableRow>
                        ) : (
                            integrations.map(int => (
                                <TableRow key={int.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="uppercase">
                                            {int.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{int.name}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs max-w-[200px] truncate">
                                        {int.config?.url}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(int.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Separator className="my-8" />

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">API Settings</h2>
                <p className="text-sm text-muted-foreground">API Keys and documentation will be available here.</p>
                <div className="flex gap-2">
                    <Input readOnly value="API Key generation coming soon..." className="max-w-md bg-muted" />
                    <Button variant="outline">Generate Key</Button>
                </div>
            </div>
        </div>
    )
}
