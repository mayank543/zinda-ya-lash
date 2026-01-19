
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Plus, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function TeamMembersPage() {
    const [members, setMembers] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)
    const [email, setEmail] = React.useState("")

    const fetchMembers = React.useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setMembers(data)
        setLoading(false)
    }, [])

    React.useEffect(() => {
        fetchMembers()
    }, [fetchMembers])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // In a real app, this would trigger an email.
            // For now, we just insert into the table.
            const { error } = await supabase
                .from('team_members')
                .insert({
                    email,
                    role: 'member',
                    status: 'invited'
                })

            if (error) throw error

            toast.success("Invitation sent to " + email)
            setOpen(false)
            setEmail("")
            fetchMembers()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    Team Members
                </h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                            <DialogDescription>
                                They will receive an email to join your team.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="colleague@company.com"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Send Invitation</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell></TableRow>
                        ) : members.length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No team members found.</TableCell></TableRow>
                        ) : (
                            members.map(m => (
                                <TableRow key={m.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">{m.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                                            {m.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={m.status === 'active' ? 'default' : 'outline'}>
                                            {m.status}
                                        </Badge>
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
