"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MonitorPlay, Lock, Smartphone, Mail, Phone, Bell, ArrowLeft, Key, Target, Network, Clock, Server } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

const sliderSteps = [
    { value: 60, label: "1m" },
    { value: 300, label: "5m" },
    { value: 900, label: "15m" },
    { value: 1800, label: "30m" },
    { value: 3600, label: "1h" },
    { value: 21600, label: "6h" },
    { value: 43200, label: "12h" },
    { value: 86400, label: "24h" },
]

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Invalid URL"),
    type: z.string(),
    interval: z.string(),
})

export default function EditMonitorPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isLoading, setIsLoading] = React.useState(false)
    const [isFetching, setIsFetching] = React.useState(true)
    const [interval, setInterval] = React.useState(300)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            url: "",
            type: "http",
            interval: "300",
        },
    })

    React.useEffect(() => {
        async function fetchMonitor() {
            if (!id) return
            try {
                // Fetch existing monitor data
                // In a real optimized app, we'd have a specific endpoint for single monitor or use SWR cache
                const res = await fetch("/api/monitors")
                const data = await res.json()
                const monitor = data.find((m: any) => m.id === id)

                if (monitor) {
                    form.reset({
                        name: monitor.name,
                        url: monitor.url,
                        type: monitor.type,
                        interval: monitor.interval.toString(),
                    })
                    setInterval(monitor.interval)
                }
            } catch (error) {
                console.error("Failed to fetch monitor")
                toast.error("Could not load monitor details")
            } finally {
                setIsFetching(false)
            }
        }
        fetchMonitor()
    }, [id, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/monitors/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name, // Use the name from form, user might have edited it
                    url: values.url,
                    type: values.type,
                    interval: parseInt(values.interval),
                }),
            })

            if (!res.ok) throw new Error("Failed to update monitor")

            toast.success("Monitor updated successfully")
            router.push("/") // Redirect back to dashboard
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return <div className="p-8 text-center">Loading monitor details...</div>
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 max-w-[1600px] mx-auto w-full">
            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit monitor<span className="text-green-500">.</span></h1>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Monitor Type */}
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6">
                            <Label className="text-sm font-semibold mb-3 block">Monitor type</Label>
                            <Select defaultValue={form.getValues('type')} onValueChange={(val) => form.setValue("type", val)}>
                                <SelectTrigger className="h-auto py-3 items-center">
                                    <SelectValue placeholder="Select monitor type" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[500px]">
                                    <SelectItem value="http" className="py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                <MonitorPlay className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold">HTTP / website monitoring</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1 max-w-[300px] md:max-w-[500px]">
                                                    Use HTTP(S) monitor to monitor your website, API endpoint, or anything running on HTTP.
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="keyword" className="py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                <Key className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold">Keyword monitoring</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1 max-w-[300px] md:max-w-[500px]">
                                                    Check the presence or absence of specific text in the request&apos;s response body.
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    {/* Other types omitted / locked for simplicity/consistency with Add Page */}
                                    <SelectItem value="ping" className="py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                <Target className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold">Ping monitoring</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1 max-w-[300px] md:max-w-[500px]">
                                                    Make sure your server or any device in the network is always available.
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="port" className="py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                <Network className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold">Port monitoring</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1 max-w-[300px] md:max-w-[500px]">
                                                    Monitor any service on your server (SMTP, POP3, FTP, etc).
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* URL Card */}
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="font-semibold">URL to monitor</Label>
                                <div className="flex items-center">
                                    <Input
                                        {...form.register("url")}
                                        placeholder="https://"
                                        className="bg-background border-border/50 h-10"
                                        onChange={(e) => {
                                            form.setValue("url", e.target.value)
                                            // Only auto-update name if it was previously empty or matching old URL?
                                            // Currently user can manually edit name below if needed, but we don't expose a name field explicitly in Add Page?
                                            // Wait, Add Page derived name from URL. Edit page should probably allow editing name explicitly or sync it.
                                            // Let's add an explicit Name field for editing clarity, or keep hidden to match Add Page behavior.
                                            // Add Page logic: `let name = values.url;` then hostname. 
                                            // If I expose Name field here, user can rename monitor.
                                        }}
                                    />
                                </div>
                                {form.formState.errors.url && <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>}
                            </div>

                            {/* Explicit Name Field for Editing */}
                            <div className="space-y-2">
                                <Label className="font-semibold">Friendly Name</Label>
                                <Input
                                    {...form.register("name")}
                                    placeholder="My Monitor"
                                    className="bg-background border-border/50 h-10"
                                />
                                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="font-semibold">Group</Label>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Lock className="h-3 w-3" /> Groups are available only on <span className="text-green-500 underline cursor-pointer">Paid plans</span>
                                        </span>
                                    </div>
                                    <Select disabled>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Monitors (default)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Monitors (default)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="text-xs text-muted-foreground">Your monitor will be automatically added to the chosen group</div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-semibold">Add tags</Label>
                                    <Input placeholder="Click to add tag..." className="bg-background border-border/50" />
                                    <div className="text-xs text-muted-foreground">Tags will enable you to organise your monitors in a better way</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications (Simplified/Mocked for now as per Add Page) */}
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6">
                            <Label className="font-semibold mb-4 block">How will we notify you?</Label>
                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox defaultChecked />
                                        <span className="text-sm font-medium">E-mail</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-6">mayankdoholiya@gmail.com</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interval */}
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between">
                                <Label className="font-semibold">Monitor interval</Label>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Your monitor will be checked every <span className="font-bold text-white">
                                    {sliderSteps.find(s => s.value === interval)?.label || (interval < 60 ? `${interval}s` : `${Math.floor(interval / 60)}m`)}
                                </span>.
                            </div>

                            <div className="pt-6 pb-2 px-2">
                                <Slider
                                    min={0}
                                    max={sliderSteps.length - 1}
                                    step={1}
                                    defaultValue={sliderSteps.findIndex(s => s.value === 300)} // This is just initial default
                                    value={sliderSteps.findIndex(s => s.value === interval)}
                                    onChange={(e) => {
                                        const index = parseInt(e.target.value)
                                        const step = sliderSteps[index]
                                        if (step) {
                                            setInterval(step.value)
                                            form.setValue("interval", step.value.toString())
                                        }
                                    }}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    {sliderSteps.map((step, i) => (
                                        <span key={i} className={`${interval === step.value ? 'text-green-500 font-bold' : ''}`}>{step.label}</span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-[200px] bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                </form>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-[300px] space-y-6 pt-12">
                <div className="flex flex-col gap-6 text-sm">
                    <div className="text-green-500 font-medium">Monitor details</div>
                    <div className="text-muted-foreground">Integrations & Team</div>
                    <div className="text-muted-foreground">Maintenance info</div>
                </div>
            </div>
        </div>
    )
}
