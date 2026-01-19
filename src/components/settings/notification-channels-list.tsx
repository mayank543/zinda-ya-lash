"use client"

import { Button } from "@/components/ui/button"
import { Plus, Trash2, Mail, Webhook, Slack } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NotificationChannelsList() {
    const [channels, setChannels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [type, setType] = useState("email")
    const [config, setConfig] = useState({ email_address: "", webhook_url: "" })

    const fetchChannels = async () => {
        try {
            const res = await fetch("/api/notifications/channels")
            if (res.ok) {
                setChannels(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch channels")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchChannels()
    }, [])

    const handleCreate = async () => {
        try {
            const payload: any = { name, type, config: {} }
            if (type === 'email') payload.config.email_address = config.email_address
            if (type === 'webhook') payload.config.webhook_url = config.webhook_url

            const res = await fetch("/api/notifications/channels", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" }
            })

            if (!res.ok) {
                const err = await res.json()
                toast.error(err.error || "Failed to create channel")
                return
            }

            toast.success("Channel created")
            setOpen(false)
            setName("")
            setConfig({ email_address: "", webhook_url: "" })
            fetchChannels()
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handleDelete = async (id: string) => {
        // Implement delete API if needed, for now just UI
        toast.info("Delete not implemented yet (add API route)")
        // const res = await fetch(`/api/notifications/channels/${id}`, { method: 'DELETE' })
        // ...
    }

    if (loading) return <Skeleton className="h-[200px] w-full" />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium">Notification Channels</h2>
                    <p className="text-sm text-muted-foreground">Manage where you receive alerts.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Channel</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Notification Channel</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="My Email Alert" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="webhook">Webhook</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {type === 'email' && (
                                <div className="grid gap-2">
                                    <Label>Email Address</Label>
                                    <Input value={config.email_address} onChange={e => setConfig({ ...config, email_address: e.target.value })} placeholder="alert@example.com" />
                                </div>
                            )}
                            {type === 'webhook' && (
                                <div className="grid gap-2">
                                    <Label>Webhook URL</Label>
                                    <Input value={config.webhook_url} onChange={e => setConfig({ ...config, webhook_url: e.target.value })} placeholder="https://api.mysite.com/hook" />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Channel</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {channels.map(channel => (
                    <Card key={channel.id} className="bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full">
                                    {channel.type === 'email' ? <Mail className="h-5 w-5" /> :
                                        channel.type === 'webhook' ? <Webhook className="h-5 w-5" /> : <Slack className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="font-medium">{channel.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {channel.type === 'email' ? channel.config.email_address : channel.config.webhook_url}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(channel.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {channels.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                        No channels configured. Add one to receive alerts.
                    </div>
                )}
            </div>
        </div>
    )
}
