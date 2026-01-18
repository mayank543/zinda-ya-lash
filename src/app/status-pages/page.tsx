"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Globe } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"

export default function StatusPagesList() {
    const [pages, setPages] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchPages() {
            try {
                const { data, error } = await supabase
                    .from('status_pages')
                    .select('*')

                if (data) setPages(data)
            } catch (error) {
                console.error("Failed to fetch status pages")
            } finally {
                setLoading(false)
            }
        }
        fetchPages()
    }, [])

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Status pages<span className="text-green-500">.</span></h1>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Create Status page
                </Button>
            </div>

            <div className="border rounded-md bg-card min-h-[400px]">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                            <TableHead className="w-[300px]">Name</TableHead>
                            <TableHead>Access level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : pages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No status pages found.</TableCell>
                            </TableRow>
                        ) : (
                            pages.map((page) => (
                                <TableRow key={page.id} className="hover:bg-muted/50 border-b border-border/50 group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-900/20 flex items-center justify-center text-green-500">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <Link href={`/status-pages/${page.id}/edit`} className="font-semibold hover:underline">
                                                {page.name}
                                                <div className="text-xs text-muted-foreground font-normal">All monitors</div>
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Globe className="h-3 w-3" />
                                            {page.password_enabled ? 'Password Protected' : 'Public'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0">
                                            {page.status || 'Published'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/status/${page.slug}`} target="_blank">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
