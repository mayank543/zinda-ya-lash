
"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, AlertTriangle, Activity, Globe, ArrowUpCircle, XCircle, Lock } from "lucide-react"
import { useParams, notFound } from "next/navigation"

export default function PublicStatusPage() {
    const params = useParams()
    const slug = params.slug as string

    const [page, setPage] = React.useState<any>(null)
    const [monitors, setMonitors] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [overallStatus, setOverallStatus] = React.useState<'up' | 'down' | 'degraded'>('up')

    // Auth State
    const [isProtected, setIsProtected] = React.useState(false)
    const [passwordInput, setPasswordInput] = React.useState("")
    const [authError, setAuthError] = React.useState(false)

    // Helper to generate fake history bars
    const generateHistory = (status: string) => {
        return Array.from({ length: 90 }).map((_, i) => {
            if (status === 'down' && i > 70) return 'down'
            if (status === 'paused') return 'paused'
            return 'up'
        })
    }

    const fetchData = React.useCallback(async (pwd?: string) => {
        if (!slug) return
        setLoading(true)
        setAuthError(false)

        try {
            const res = await fetch(`/api/status-pages/public/${slug}`, {
                method: 'POST',
                body: JSON.stringify({ password: pwd }),
                headers: { 'Content-Type': 'application/json' }
            })

            if (res.status === 401) {
                setIsProtected(true)
                setLoading(false)
                setAuthError(!!pwd) // If we tried a password and failed
                return
            }

            if (res.status === 404) {
                // Handle not found
                setPage(null)
                setLoading(false)
                return
            }

            const data = await res.json()
            setPage(data.page)
            setMonitors(data.monitors)
            setIsProtected(false)

            // Calculate Overall Status
            if (data.monitors) {
                const activeMonitors = data.monitors.filter((m: any) => m.status !== 'paused')
                const hasDown = activeMonitors.some((m: any) => m.status === 'down')
                setOverallStatus(hasDown ? 'down' : 'up')
            }

        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [slug])

    React.useEffect(() => {
        // Try fetching without password first (or from localstorage if we wanted execution persistence)
        fetchData()
    }, [fetchData])

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchData(passwordInput)
    }

    if (!loading && !isProtected && !page) {
        return notFound()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    // Password Screen
    if (isProtected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center space-y-6">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Lock className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold tracking-tight">Login Required</h1>
                            <p className="text-sm text-muted-foreground">This status page is password protected.</p>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2 text-left">
                                <Input
                                    type="password"
                                    placeholder="Enter password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className={authError ? "border-red-500" : ""}
                                />
                                {authError && <p className="text-xs text-red-500">Incorrect password</p>}
                            </div>
                            <Button type="submit" className="w-full">View Status</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Appearance
    const isWide = page.layout_density === 'wide'
    const isCenter = page.layout_alignment === 'center'
    const containerClass = isWide ? "max-w-6xl" : "max-w-4xl"

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20">
            {/* Header Background */}
            <div className="bg-[#0b1120] text-white pt-12 pb-24">
                <div className={`${containerClass} mx-auto px-6`}>
                    <div className={`flex ${isCenter ? 'justify-center' : 'justify-start'} mb-8`}>
                        {page.logo_url ? (
                            <img src={page.logo_url} alt={page.name} className="h-12 object-contain" />
                        ) : (
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {page.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Status Card */}
            <div className={`${containerClass} mx-auto px-6 -mt-16 relative z-10`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex items-center justify-center gap-6">
                    {overallStatus === 'up' ? (
                        <div className="h-16 w-16 rounded-full bg-[#27ae60] flex items-center justify-center shadow-md">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-[#e67e22] flex items-center justify-center shadow-md">
                            <AlertTriangle className="h-8 w-8 text-white" />
                        </div>
                    )}

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {overallStatus === 'up' ? 'All systems operational' : 'Some systems down'}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className={`${containerClass} mx-auto px-6 mt-12`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Services</h3>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {monitors.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No monitors associated with this status page.
                        </div>
                    ) : (
                        monitors.map((monitor) => {
                            const history = generateHistory(monitor.status)

                            return (
                                <div key={monitor.id} className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                                            {monitor.name}
                                            <span className="text-gray-400 font-normal text-sm ml-2">
                                                <span className="opacity-50 mr-2">
                                                    {monitor.url ? new URL(monitor.url).hostname : ""}
                                                </span>
                                                <span className="text-[#27ae60]">| {monitor.status === 'up' ? '100.000%' : '98.420%'}</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {monitor.status === 'up' && (
                                                <>
                                                    <div className="h-2.5 w-2.5 rounded-full bg-[#27ae60]"></div>
                                                    <span className="text-[#27ae60] font-medium text-sm">Operational</span>
                                                </>
                                            )}
                                            {monitor.status === 'down' && (
                                                <>
                                                    <div className="h-2.5 w-2.5 rounded-full bg-[#e74c3c]"></div>
                                                    <span className="text-[#e74c3c] font-medium text-sm">Down</span>
                                                </>
                                            )}
                                            {monitor.status === 'paused' && (
                                                <>
                                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-400"></div>
                                                    <span className="text-slate-500 font-medium text-sm">Not monitored</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Uptime Bar Visualization */}
                                    <div className="flex gap-[2px] h-8 items-end w-full">
                                        {history.map((hStatus, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-[1px] ${hStatus === 'up' ? 'bg-[#27ae60]' :
                                                    hStatus === 'down' ? 'bg-[#e74c3c]' :
                                                        'bg-[#7f8c8d]'
                                                    }`}
                                                style={{
                                                    height: '100%',
                                                    opacity: hStatus === 'paused' ? 0.3 : 1
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <span className="opacity-70">Powered by</span>
                    <span className="font-semibold text-gray-800">UptimeRobot</span>
                </div>
            </div>
        </div>
    )
}
