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
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive>
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Monitors Group */}
                <SidebarGroup>
                    <div className="px-2 mb-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search monitors..." className="pl-8 h-9 bg-background/50" />
                        </div>
                    </div>
                    <SidebarGroupLabel>Monitors</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {monitors.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url} className="flex justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <item.icon className={`h-4 w-4 ${item.color || ""}`} />
                                                <span>{item.title}</span>
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                                                {item.count}
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Other Sections */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Globe className="h-4 w-4" />
                                    <span>Status Pages</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Calendar className="h-4 w-4" />
                                    <span>Maintenance Windows</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
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
