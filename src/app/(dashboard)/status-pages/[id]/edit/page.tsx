
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink, Save } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function EditStatusPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)

    // Form State
    const [name, setName] = React.useState("")
    const [slug, setSlug] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [passwordEnabled, setPasswordEnabled] = React.useState(false)
    const [allMonitors, setAllMonitors] = React.useState<any[]>([])
    const [selectedMonitorIds, setSelectedMonitorIds] = React.useState<string[]>([])

    React.useEffect(() => {
        async function loadData() {
            try {
                // 1. Fetch available monitors
                const monitorsRes = await fetch('/api/monitors')
                const monitorsData = await monitorsRes.json()
                setAllMonitors(monitorsData)

                // 2. Fetch Status Page Details
                const pageRes = await fetch(`/api/status-pages/${id}`)
                const pageData = await pageRes.json()

                if (pageData.error) throw new Error(pageData.error)

                setName(pageData.name)
                setSlug(pageData.slug)
                setPasswordEnabled(pageData.password_enabled)
                // If password enabled, we don't get the actual password back usually for security, 
                // but here we just leave it blank to indicate "Unchanged".
                // If the user types something, we update it.

                // Pre-select monitors
                if (pageData.monitorIds) {
                    setSelectedMonitorIds(pageData.monitorIds)
                }

            } catch (error) {
                console.error("Failed to load data", error)
                toast.error("Failed to load status page details")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    const handleSave = async () => {
        setSaving(true)
        try {
            const payload: any = {
                name,
                slug,
                monitors: selectedMonitorIds,
                password_enabled: passwordEnabled
            }
            // Only send password if user typed one, or if they disabled it (send empty string/null logic handled by backend mostly via enabled flag, but our API expects specific logic)
            if (password) {
                payload.password = password
            } else if (!passwordEnabled) {
                // If disabled, we might want to plain clear it or just rely on the flag?
                // The API implementation sets password to null if provided as such, let's be explicit
                payload.password = ""
            }

            const res = await fetch(`/api/status-pages/${id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" }
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success("Status page updated successfully")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    const toggleMonitor = (monitorId: string) => {
        setSelectedMonitorIds(prev =>
            prev.includes(monitorId)
                ? prev.filter(id => id !== monitorId)
                : [...prev, monitorId]
        )
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Status Page</h1>
                <div className="ml-auto flex gap-2">
                    <Link href={`/status/${slug}`} target="_blank">
                        <Button variant="outline">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Page
                        </Button>
                    </Link>
                    <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Basic configuration for your status page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Page Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <div className="flex items-center">
                                <span className="text-sm text-muted-foreground mr-1">/status/</span>
                                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Protection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Password Protection</Label>
                                <p className="text-sm text-muted-foreground">
                                    Restrict access to this status page with a password.
                                </p>
                            </div>
                            <Switch checked={passwordEnabled} onCheckedChange={setPasswordEnabled} />
                        </div>
                        {passwordEnabled && (
                            <div className="grid gap-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="password">Set New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password to change..."
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monitor Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monitors</CardTitle>
                        <CardDescription>Select which monitors to display on this status page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {allMonitors.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No monitors available. Create some monitors first.</p>
                            ) : (
                                allMonitors.map((monitor) => (
                                    <div key={monitor.id} className="flex items-center space-x-2 border p-3 rounded-md">
                                        <Checkbox
                                            id={`monitor-${monitor.id}`}
                                            checked={selectedMonitorIds.includes(monitor.id)}
                                            onChange={() => toggleMonitor(monitor.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={`monitor-${monitor.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {monitor.name}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {monitor.url}
                                            </p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className={`text-xs px-2 py-1 rounded-full ${monitor.status === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {monitor.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
