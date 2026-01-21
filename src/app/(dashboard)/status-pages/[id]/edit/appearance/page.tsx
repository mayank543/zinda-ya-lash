"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Lock, LayoutDashboard, Settings, Megaphone, Palette, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"

export default function StatusPageAppearance() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()

    // State
    const [page, setPage] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)

    // Form fields
    const [font, setFont] = React.useState("Roboto")
    const [showGroups, setShowGroups] = React.useState(false)
    const [density, setDensity] = React.useState("wide")
    const [alignment, setAlignment] = React.useState("left")
    const [logoUrl, setLogoUrl] = React.useState("")
    const [faviconUrl, setFaviconUrl] = React.useState("")

    // Refs for file inputs
    const logoInputRef = React.useRef<HTMLInputElement>(null)
    const faviconInputRef = React.useRef<HTMLInputElement>(null)

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
                    setLogoUrl(data.logo_url || "")
                    setFaviconUrl(data.favicon_url || "")
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchPage()
    }, [id])

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('status_pages')
                .update({
                    font,
                    show_groups: showGroups,
                    layout_density: density,
                    layout_alignment: alignment,
                    logo_url: logoUrl,
                    favicon_url: faviconUrl
                })
                .eq('id', id)

            if (error) throw error
            toast.success("Appearance settings saved successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0]
        if (!file) return

        // For this demo, since we might not have storage permissions fully configured in the user's Supabase instance
        // specifically for public uploads without auth, we will try to upload, but fallback to object URL for immediate feedback.

        // 1. Immediate Preview
        const objectUrl = URL.createObjectURL(file)
        if (type === 'logo') setLogoUrl(objectUrl)
        else setFaviconUrl(objectUrl)

        // 2. Real Upload (Try/Catch)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${id}-${type}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Try 'public' bucket first, simpler
            const { error: uploadError } = await supabase.storage
                .from('public')
                .upload(filePath, file)

            if (uploadError) {
                // Try creating bucket if possible? No, can't from client usually.
                // Fallback: If upload fails (likely 403 or bucket missing), we stick with the ObjectURL 
                // BUT warn user it won't persist.
                console.warn("Storage upload failed, using local preview.", uploadError)
                toast.warning("Could not upload to cloud storage. Changes may not persist after reload.")
            } else {
                const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(filePath)
                if (type === 'logo') setLogoUrl(publicUrl)
                else setFaviconUrl(publicUrl)
            }
        } catch (e) {
            console.error("Upload logic error", e)
        }
    }

    return (
        <>
            {/* Main Content Area */}
            <div className="flex-1 bg-background pb-20">
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
                            Public status page, hosted on <Link href={`/status/${page?.slug}`} target="_blank" className="text-green-500 hover:underline">stats.uptimerobot.com/{page?.slug || '...'}</Link>
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
                                    <div
                                        className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/10 cursor-pointer transition-colors relative overflow-hidden group"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, 'logo')}
                                        />
                                        {logoUrl ? (
                                            <div className="relative w-full h-full flex flex-col items-center">
                                                <img src={logoUrl} alt="Logo" className="h-16 object-contain mb-2" />
                                                <div className="text-xs text-muted-foreground group-hover:block hidden absolute inset-0 bg-background/80 flex items-center justify-center">Click to change</div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-[-20px] right-[-20px] h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => { e.stopPropagation(); setLogoUrl(""); }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                                <div className="text-sm text-muted-foreground">Drag & drop your logo here or choose by click</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {/* Favicon Upload */}
                                <div className="space-y-2">
                                    <Label>Favicon</Label>
                                    <div className="text-xs text-muted-foreground">Accepted formats: .png, .gif, .ico. Max 96x96px, 150kb.</div>
                                    <div
                                        className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/10 cursor-pointer transition-colors relative group"
                                        onClick={() => faviconInputRef.current?.click()}
                                    >
                                        <input
                                            ref={faviconInputRef}
                                            type="file"
                                            accept=".png,.gif,.ico"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, 'favicon')}
                                        />
                                        {faviconUrl ? (
                                            <div className="relative w-full h-full flex flex-col items-center">
                                                <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain mb-2" />
                                                <div className="text-xs text-muted-foreground group-hover:block hidden absolute inset-0 bg-background/80 flex items-center justify-center">Click to change</div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-[-20px] right-[-20px] h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => { e.stopPropagation(); setFaviconUrl(""); }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                                <div className="text-sm text-muted-foreground">Drag & drop your favicon here or choose by click</div>
                                            </>
                                        )}
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
            </div >

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 lg:right-64 right-0 lg:left-0 p-4 bg-card border-t border-border flex justify-end z-10 w-full lg:w-[calc(100%-16rem)]">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                </Button>
            </div>
        </>
    )
}
