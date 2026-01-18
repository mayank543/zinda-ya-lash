"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, Lock, LayoutDashboard, Settings, Megaphone, Palette } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useParams } from "next/navigation"

export default function EditStatusPage() {
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState<any>(null)
    const [name, setName] = React.useState("")
    const [homepageUrl, setHomepageUrl] = React.useState("")

    React.useEffect(() => {
        async function fetchPage() {
            if (!id) return
            try {
                const { data, error } = await supabase
                    .from('status_pages')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (data) {
                    setPage(data)
                    setName(data.name)
                    setHomepageUrl(data.domain || "")
                }
            } catch (error) {
                console.error("Failed to fetch status page")
            } finally {
                setLoading(false)
            }
        }
        fetchPage()
    }, [id])

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar Settings Menu */}
            <div className="w-64 border-r border-border/40 bg-card hidden lg:block p-4 space-y-2">
                <Link href="/status-pages" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="h-4 w-4" /> Back to Status Pages
                </Link>

                <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-muted/50">
                        <Settings className="h-4 w-4" /> Global Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                        <Palette className="h-4 w-4" /> Appearance
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                        <LayoutDashboard className="h-4 w-4" /> Monitors
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                        <Megaphone className="h-4 w-4" /> Announcements
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-background">
                <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">

                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Link href="/status-pages" className="lg:hidden text-muted-foreground">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">Edit <span className="text-green-500">{page?.name || 'Status page'}</span> status page.</h1>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Public status page, hosted on <a href="#" className="text-green-500 hover:underline">stats.uptimerobot.com/{page?.slug || '...'}</a>
                        </div>
                    </div>

                    {/* Name & Homepage */}
                    <Card className="bg-card border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-1">Name & homepage <span className="text-green-500">.</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Name of the status page</Label>
                                    <div className="text-xs text-muted-foreground mb-2">E.g. your brand. It is used in status page heading, title, etc.</div>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-muted/50 border-0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Homepage URL</Label>
                                    <div className="text-xs text-muted-foreground mb-2">The link target for the logo (or main title) on status page. Usually leads to your homepage.</div>
                                    <Input
                                        placeholder="E.g. https://yourdomain.com"
                                        value={homepageUrl}
                                        onChange={(e) => setHomepageUrl(e.target.value)}
                                        className="bg-muted/50 border-0"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* White-label */}
                    <Card className="bg-card border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-1">White-label <span className="text-green-500">.</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Custom domain</Label>
                                        <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500 bg-orange-500/10 gap-1">
                                            <Lock className="h-3 w-3" /> Available only in Pro
                                        </Badge>
                                    </div>
                                    <Input
                                        placeholder="E.g. status.yourdomain.com"
                                        disabled
                                        className="bg-muted/50 border-0 opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Google Analytics</Label>
                                        <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500 bg-orange-500/10 gap-1">
                                            <Lock className="h-3 w-3" /> Available only in Team+
                                        </Badge>
                                    </div>
                                    <Input
                                        placeholder="G-xxxxxxxxx"
                                        disabled
                                        className="bg-muted/50 border-0 opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pt-2">
                                <div className="flex items-center justify-between p-3 rounded bg-muted/20">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Remove UptimeRobot logo</Label>
                                        <div className="text-xs text-muted-foreground">This will hide "Powered by UptimeRobot" link in footer.</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500 bg-orange-500/10 gap-1">
                                            <Lock className="h-3 w-3" />
                                        </Badge>
                                        <Switch disabled />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded bg-muted/20">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Remove cookie consent</Label>
                                        <div className="text-xs text-muted-foreground">Available only for a Custom Domain status page.</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500 bg-orange-500/10 gap-1">
                                            <Lock className="h-3 w-3" />
                                        </Badge>
                                        <Switch disabled />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Access */}
                    <Card className="bg-card border-none shadow-sm pb-10">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-1">Access <span className="text-green-500">.</span></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-3 rounded bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Password</Label>
                                    <div className="text-xs text-muted-foreground">Restrict access to people with password only.</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500 bg-orange-500/10 gap-1">
                                        <Lock className="h-3 w-3" />
                                    </Badge>
                                    <Switch disabled />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
