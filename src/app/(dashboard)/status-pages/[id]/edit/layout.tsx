"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, LayoutDashboard, Palette, Settings, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StatusPageEditorLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = React.use(params)
    const pathname = usePathname()

    // Helper to check if link is active
    // We check if the pathname *ends with* the segment for simpler logic, or exact match
    const isActive = (path: string) => {
        if (path.endsWith('/edit') && pathname.endsWith('/edit')) return true
        if (pathname === path) return true
        return false
    }

    return (
        <div className="flex flex-col-reverse lg:flex-row min-h-[calc(100vh-4rem)]">
            {/* Main Content Area */}
            <div className="flex-1 bg-background relative">
                {children}
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-border/40 p-4 space-y-2">
                <Link href="/status-pages" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="h-4 w-4" /> Back to Status Pages
                </Link>

                <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground opacity-50 cursor-not-allowed">
                        <LayoutDashboard className="h-4 w-4" /> Monitors
                    </Button>

                    <Link href={`/status-pages/${id}/edit/appearance`}>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 ${isActive(`/status-pages/${id}/edit/appearance`)
                                ? "bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium"
                                : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Palette className="h-4 w-4" /> Appearance
                        </Button>
                    </Link>

                    <Link href={`/status-pages/${id}/edit`}>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 ${isActive(`/status-pages/${id}/edit`)
                                ? "bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium"
                                : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Settings className="h-4 w-4" /> Global Settings
                        </Button>
                    </Link>

                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground opacity-50 cursor-not-allowed">
                        <Megaphone className="h-4 w-4" /> Announcements
                    </Button>
                </div>
            </div>
        </div>
    )
}
