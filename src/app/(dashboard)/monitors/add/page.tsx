"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
    name: z.string().min(1, "URL is required"),
    url: z.string().url("Invalid URL"),
    type: z.string(),
    interval: z.string(),
})

export default function AddMonitorPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            // Auto-generate a friendly name from URL if not provided explicitly?
            // The API requires 'name'. Let's use the hostname from URL as name.
            let name = values.url;
            try {
                name = new URL(values.url).hostname;
            } catch (e) { }

            const res = await fetch("/api/monitors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    url: values.url,
                    type: values.type,
                    interval: parseInt(values.interval),
                }),
            })

            if (!res.ok) throw new Error("Failed to create monitor")

            toast.success("Monitor created successfully")
            router.push("/")
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 max-w-[1600px] mx-auto w-full">
            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold">Add single monitor<span className="text-green-500">.</span></h1>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Monitor Type */}
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6">
                            <Label className="text-sm font-semibold mb-3 block">Monitor type</Label>
                            <Select defaultValue="http" onValueChange={(val) => form.setValue("type", val)}>
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
                                    {/* Locked Items */}
                                    <div className="py-3 px-2 opacity-50 cursor-not-allowed">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                <Clock className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">Cron job monitoring</div>
                                                    <Lock className="h-3 w-3 text-orange-500" />
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Available in paid plans.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-3 px-2 opacity-50 cursor-not-allowed">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                <Server className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">DNS monitoring</div>
                                                    <Lock className="h-3 w-3 text-orange-500" />
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Available in paid plans.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                            form.setValue("name", e.target.value) // Trigger validation
                                        }}
                                    />
                                </div>
                                {form.formState.errors.url && <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>}
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

                    {/* Notifications */}
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
                                    <div className="flex items-center gap-1 ml-6 text-xs text-muted-foreground">
                                        <span>No delay, no repeat</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox defaultChecked className="opacity-50" disabled />
                                        <span className="text-sm font-medium text-orange-500">SMS message</span>
                                    </div>
                                    <div className="text-xs text-orange-500/80 ml-6 flex items-center gap-1">916307859420 <Lock className="h-3 w-3" /></div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox defaultChecked className="opacity-50" disabled />
                                        <span className="text-sm font-medium text-orange-500">Voice call</span>
                                    </div>
                                    <div className="text-xs text-orange-500/80 ml-6 flex items-center gap-1">916307859420 <Lock className="h-3 w-3" /></div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox disabled />
                                        <span className="text-sm font-medium text-muted-foreground">Push</span>
                                    </div>
                                    <div className="text-xs text-green-500 underline ml-6 cursor-pointer">Download app for iOS</div>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-muted-foreground">
                                You can set up notifications for <span className="text-green-500 underline cursor-pointer">Integrations & Team</span> in the specific tab and edit it later.
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
                                </span>. We recommend to use at least 1-minute checks <span className="text-green-500 underline cursor-pointer">available in paid plans</span>
                            </div>

                            <div className="pt-6 pb-2 px-2">
                                <Slider
                                    min={0}
                                    max={sliderSteps.length - 1}
                                    step={1}
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

                    {/* Region */}
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <Label className="font-semibold">Region to monitor from</Label>
                                <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500 bg-orange-500/10">
                                    <Lock className="h-3 w-3 mr-1" /> Available only in Solo, Team and Enterprise. <span className="underline ml-1 cursor-pointer">Upgrade now</span>
                                </Badge>
                            </div>
                            <Select disabled defaultValue="default">
                                <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-3 bg-blue-900 rounded-[1px] relative overflow-hidden">
                                            {/* US Flag hint */}
                                            <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500"></div>
                                            <div className="absolute top-0 right-0 w-2 h-0.5 bg-red-500"></div>
                                            <div className="absolute top-1 right-0 w-2 h-0.5 bg-white"></div>
                                        </div>
                                        <SelectValue placeholder="Default (auto-select by UptimeRobot)" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default (auto-select by UptimeRobot)</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-[200px] bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create monitor"}
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
