"use client"

import * as React from "react"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

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
import { useMonitorModal } from "@/hooks/use-monitor-modal"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { onOpen } = useMonitorModal()

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-border/50 px-4 flex items-center justify-center">
                <div className="flex items-center gap-2 font-bold text-lg w-full">
                    <Activity className="h-6 w-6 text-green-500" />
                    <span>UptimeRobot</span>
                </div>
            </SidebarHeader>

            <div className="p-4 pb-0">
                <Button onClick={onOpen} className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white font-medium" size="lg">
                    <Plus className="h-4 w-4" />
                    Add New Monitor
                </Button>
            </div>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive>
                                    <Activity className="h-4 w-4" />
                                    <span>Monitoring</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <ShieldAlert className="h-4 w-4" />
                                    <span>Incidents</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Radio className="h-4 w-4" />
                                    <span>Status pages</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Wrench className="h-4 w-4" />
                                    <span>Maintenance</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Users className="h-4 w-4" />
                                    <span>Team members</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Share2 className="h-4 w-4" />
                                    <span>Integrations & API</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
