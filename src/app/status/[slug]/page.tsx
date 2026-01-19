"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, AlertTriangle, Activity, Globe, ArrowUpCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useParams, notFound } from "next/navigation"

export default function PublicStatusPage() {
    const params = useParams()
    const slug = params.slug as string

    const [page, setPage] = React.useState<any>(null)
    const [monitors, setMonitors] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [overallStatus, setOverallStatus] = React.useState<'up' | 'down' | 'degraded'>('up')

    // Helper to generate fake history bars if real data is missing for now
    // In production, this would come from the `heartbeats` table
    const generateHistory = (status: string) => {
        return Array.from({ length: 90 }).map((_, i) => {
            // Simulate some downtime for 'down' monitors
            if (status === 'down' && i > 70) return 'down'
            if (status === 'paused') return 'paused'
            return 'up'
        })
    }

    React.useEffect(() => {
        async function fetchData() {
            if (!slug) return
            try {
                // 1. Fetch Status Page Config
                const { data: pageData, error: pageError } = await supabase
                    .from('status_pages')
                    .select('*')
                    .eq('slug', slug)
                    .single()

                if (pageError || !pageData) {
                    console.error("Page not found")
                    setLoading(false)
                    return
                }
                setPage(pageData)

                // 2. Fetch Monitors
                // Fetch all monitors that are NOT in draft/paused (unless you want to show paused as "Not monitored")
                const { data: monitorsData } = await supabase
                    .from('monitors')
                    .select('*')
                    .order('name')

                if (monitorsData) {
                    setMonitors(monitorsData)

                    // Calculate Overall Status
                    // Only count 'active' monitors for overall status
                    const activeMonitors = monitorsData.filter(m => m.status !== 'paused')
                    const hasDown = activeMonitors.some(m => m.status === 'down')
                    setOverallStatus(hasDown ? 'down' : 'up')
                }

            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [slug])

    if (!loading && !page) {
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

    // Appearance Settings
    const isWide = page.layout_density === 'wide'
    const isCenter = page.layout_alignment === 'center'
    const containerClass = isWide ? "max-w-6xl" : "max-w-4xl"

    // Colors
    const overallColor = overallStatus === 'up' ? 'bg-[#27ae60]' : 'bg-[#e67e22]' // Green or Orange
    const overallIcon = overallStatus === 'up' ? CheckCircle2 : AlertCircle

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20">
            {/* Header Background */}
            <div className="bg-[#0b1120] text-white pt-12 pb-24">
                <div className={`${containerClass} mx-auto px-6`}>
                    {/* Logo / Branding */}
                    <div className={`flex ${isCenter ? 'justify-center' : 'justify-start'} mb-8`}>
                        {page.logo_url ? (
                            <img src={page.logo_url} alt={page.name} className="h-12 object-contain" />
                        ) : (
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {/* <Activity className="h-6 w-6 text-green-400" /> */}
                                {page.name || "Use settings to add logo"}
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
                        {/* <p className="text-gray-500 mt-1">Last updated 1 min ago</p> */}
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className={`${containerClass} mx-auto px-6 mt-12`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Services</h3>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {monitors.map((monitor) => {
                        const history = generateHistory(monitor.status)

                        return (
                            <div key={monitor.id} className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                                        {monitor.name}
                                        {/* Mock Uptime % for now (randomized slightly to look real or 100 if up) */}
                                        <span className="text-gray-400 font-normal text-sm ml-2">
                                            <a href={monitor.url} target="_blank" className="hover:underline opacity-50 mr-2">
                                                {monitor.url ? new URL(monitor.url).hostname : ""}
                                            </a>
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
                                                        'bg-[#7f8c8d]' // Paused/Gray
                                                }`}
                                            style={{
                                                height: '100%',
                                                opacity: hStatus === 'paused' ? 0.3 : 1
                                            }}
                                            title={hStatus}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
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
