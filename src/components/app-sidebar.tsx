"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Activity,
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Globe,
    LayoutDashboard,
    MonitorPlay,
    PauseCircle,
    Plus,
    Search,
    Settings,
    ShieldAlert,
    Radio,
    Wrench,
    Users,
    Share2,
    PanelTop
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarSeparator,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AppSidebarUser } from "@/components/app-sidebar-user"

// Sample data for monitors
const monitors = [
    {
        title: "All Monitors",
        url: "#",
        icon: Activity,
        count: 35,
        active: true,
    },
    {
        title: "Up Monitors",
        url: "#",
        icon: CheckCircle2,
        count: 33,
        color: "text-green-500",
    },
    {
        title: "Down Monitors",
        url: "#",
        icon: AlertCircle,
        count: 1,
        color: "text-red-500",
    },
    {
        title: "Paused Monitors",
        url: "#",
        icon: PauseCircle,
        count: 1,
        color: "text-gray-400",
    },
]

// ... imports remain same ...

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-border/50 px-4 flex items-center justify-center">
                <div className="flex items-center gap-2 font-bold text-lg w-full">
                    <Activity className="h-6 w-6 text-green-500" />
                    <span>UptimeRobot</span>
                </div>
            </SidebarHeader>

            <div className="p-4 pb-0">
                <Button asChild className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white font-medium" size="lg">
                    <Link href="/monitors/add">
                        <Plus className="h-4 w-4" />
                        Add New Monitor
                    </Link>
                </Button>
            </div>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/" || pathname.startsWith("/monitors") || pathname.startsWith("/dashboard")}>
                                    <Link href="/">
                                        <Activity className="h-4 w-4" />
                                        <span>Monitoring</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/incidents")}>
                                    <Link href="/incidents">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span>Incidents</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/status-pages")}>
                                    <Link href="/status-pages">
                                        <PanelTop className="h-4 w-4" />
                                        <span>Status pages</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/maintenance")}>
                                    <Link href="/maintenance">
                                        <Wrench className="h-4 w-4" />
                                        <span>Maintenance</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/team-members")}>
                                    <Link href="/team-members">
                                        <Users className="h-4 w-4" />
                                        <span>Team members</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith("/settings/notifications")}>
                                    <Link href="/settings/notifications">
                                        <Share2 className="h-4 w-4" />
                                        <span>Notifications</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <AppSidebarUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
