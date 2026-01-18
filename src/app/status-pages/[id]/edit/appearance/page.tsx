"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Lock, LayoutDashboard, Settings, Megaphone, Palette, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function StatusPageAppearance() {
    const params = useParams()
    const id = params.id as string

    // State
    const [page, setPage] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [font, setFont] = React.useState("Roboto")
    const [showGroups, setShowGroups] = React.useState(false)
    const [density, setDensity] = React.useState("wide")
    const [alignment, setAlignment] = React.useState("left")

    React.useEffect(() => {
        async function fetchPage() {
            if (!id) return
            try {
                const { data } = await supabase.from('status_pages').select('*').eq('id', id).single()
                if (data) {
                    setPage(data)
                    setFont(data.font || "Roboto")
                    setShowGroups(data.show_groups || false)
                    setDensity(data.layout_density || "wide")
                    setAlignment(data.layout_alignment || "left")
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchPage()
    }, [id])

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar (Shared Navigation - duplicating for now, ideally moved to layout) */}
            <div className="w-64 border-r border-border/40 bg-card hidden lg:block p-4 space-y-2">
                <Link href="/status-pages" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="h-4 w-4" /> Back to Status Pages
                </Link>

                <div className="space-y-1">
                    <Link href={`/status-pages/${id}/edit`}>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                            <Settings className="h-4 w-4" /> Global Settings
                        </Button>
                    </Link>
                    <Link href={`/status-pages/${id}/edit/appearance`}>
                        <Button variant="ghost" className="w-full justify-start gap-3 bg-muted/50 text-foreground">
                            <Palette className="h-4 w-4" /> Appearance
                        </Button>
                    </Link>
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
                <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full pb-20">

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

                    {/* Branding */}
                    <Card className="bg-card border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-1">Branding <span className="text-green-500">.</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label>Logo</Label>
                                    <div className="text-xs text-muted-foreground">Accepted formats: .jpg, .jpeg, .png. Max 400x200px, 150kb.</div>
                                    <div className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/10 cursor-pointer transition-colors">
                                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                        <div className="text-sm text-muted-foreground">Drag & drop your logo here or choose by click</div>
                                    </div>
                                </div>
                                {/* Favicon Upload */}
                                <div className="space-y-2">
                                    <Label>Favicon</Label>
                                    <div className="text-xs text-muted-foreground">Accepted formats: .png, .gif, .ico. Max 96x96px, 150kb.</div>
                                    <div className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/10 cursor-pointer transition-colors">
                                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                        <div className="text-sm text-muted-foreground">Drag & drop your favicon here or choose by click</div>
                                    </div>
                                </div>
                            </div>

                            {/* Font */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Font</Label>
                                    <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500 bg-orange-500/10 gap-1">
                                        <Lock className="h-3 w-3" /> Available only in Solo, Team+
                                    </Badge>
                                </div>
                                <Select disabled defaultValue="roboto">
                                    <SelectTrigger className="bg-muted/50 border-0 opacity-70">
                                        <SelectValue placeholder="Roboto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="roboto">Roboto</SelectItem>
                                        <SelectItem value="inter">Inter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Layout Section */}
                    <Card className="bg-card border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-1">Layout <span className="text-green-500">.</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Toggle Groups */}
                            <div className="flex items-center gap-3">
                                <Switch checked={showGroups} onCheckedChange={setShowGroups} />
                                <Label>Show monitors under their groups</Label>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Density */}
                                <div className="space-y-3">
                                    <Label className="text-base">Layout density</Label>
                                    <div className="text-xs text-muted-foreground">Wide for better readability, compact to display as much info at once.</div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-all ${density === 'wide' ? 'border-green-500 bg-green-500/5' : 'border-border opacity-50 hover:opacity-100'}`}
                                            onClick={() => setDensity('wide')}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${density === 'wide' ? 'border-green-500' : 'border-muted-foreground'}`}>
                                                    {density === 'wide' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                                </div>
                                                <span className="font-medium text-sm">Wide</span>
                                            </div>
                                            {/* Preview Mockup Wide */}
                                            <div className="bg-background rounded border p-2 space-y-2">
                                                <div className="h-2 w-1/3 bg-muted rounded"></div>
                                                <div className="h-8 w-full bg-green-500/20 rounded border border-green-500/30"></div>
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-all ${density === 'compact' ? 'border-green-500 bg-green-500/5' : 'border-border opacity-50 hover:opacity-100'}`}
                                            onClick={() => setDensity('compact')}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${density === 'compact' ? 'border-green-500' : 'border-muted-foreground'}`}>
                                                    {density === 'compact' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                                </div>
                                                <span className="font-medium text-sm">Compact</span>
                                            </div>
                                            {/* Preview Mockup Compact */}
                                            <div className="bg-background rounded border p-2 space-y-1">
                                                <div className="h-2 w-1/3 bg-muted rounded"></div>
                                                <div className="h-4 w-full bg-green-500/20 rounded border border-green-500/30"></div>
                                                <div className="h-4 w-full bg-green-500/20 rounded border border-green-500/30"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alignment */}
                                <div className="space-y-3">
                                    <Label className="text-base">Alignment</Label>
                                    <div className="text-xs text-muted-foreground">Save maximum space with logo on left or push your brand first.</div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-all ${alignment === 'left' ? 'border-green-500 bg-green-500/5' : 'border-border opacity-50 hover:opacity-100'}`}
                                            onClick={() => setAlignment('left')}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${alignment === 'left' ? 'border-green-500' : 'border-muted-foreground'}`}>
                                                    {alignment === 'left' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                                </div>
                                                <span className="font-medium text-sm">Logo on left</span>
                                            </div>
                                            {/* Preview Left */}
                                            <div className="bg-background rounded border p-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="h-2 w-8 bg-muted rounded"></div>
                                                    <div className="h-2 w-16 bg-muted rounded"></div>
                                                </div>
                                                <div className="h-6 w-full bg-green-500/20 rounded border border-green-500/30"></div>
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-all ${alignment === 'center' ? 'border-green-500 bg-green-500/5' : 'border-border opacity-50 hover:opacity-100'}`}
                                            onClick={() => setAlignment('center')}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${alignment === 'center' ? 'border-green-500' : 'border-muted-foreground'}`}>
                                                    {alignment === 'center' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                                </div>
                                                <span className="font-medium text-sm">Logo on center</span>
                                            </div>
                                            {/* Preview Center */}
                                            <div className="bg-background rounded border p-2 flex flex-col items-center">
                                                <div className="h-2 w-8 bg-muted rounded mb-2"></div>
                                                <div className="h-6 w-full bg-green-500/20 rounded border border-green-500/30"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-card border-t border-border flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">
                    Save changes
                </Button>
            </div>
        </div>
    )
}
