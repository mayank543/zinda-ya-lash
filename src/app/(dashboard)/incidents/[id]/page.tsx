"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, MessageSquare, User, Send, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function IncidentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)
    const [incident, setIncident] = React.useState<any>(null)
    const [comments, setComments] = React.useState<any[]>([])
    const [newComment, setNewComment] = React.useState("")
    const [loading, setLoading] = React.useState(true)

    const fetchIncident = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/incidents/${id}`)
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setIncident(data)
        } catch (error) {
            console.error("Failed to fetch incident", error)
            toast.error("Failed to load incident details")
        }
    }, [id])

    const fetchComments = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/incidents/${id}/comments`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setComments(data)
            }
        } catch (error) {
            console.error("Failed to fetch comments", error)
        }
    }, [id])

    React.useEffect(() => {
        setLoading(true)
        Promise.all([fetchIncident(), fetchComments()]).finally(() => setLoading(false))

        // Real-time subscription for comments
        const channel = supabase
            .channel(`incident-${id}-comments`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'incident_comments',
                    filter: `incident_id=eq.${id}`, // Note: filter usually requires string/int casting properly in supabase-js, but let's try
                },
                (payload) => {
                    setComments((prev) => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, fetchIncident, fetchComments])

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/incidents/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
                headers: { "Content-Type": "application/json" }
            })
            const data = await res.json()
            if (res.ok) {
                setIncident(data)
                toast.success(`Incident marked as ${newStatus}`)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handlePostComment = async () => {
        if (!newComment.trim()) return

        try {
            const res = await fetch(`/api/incidents/${id}/comments`, {
                method: "POST",
                body: JSON.stringify({ content: newComment, user_email: 'Admin' }),
                headers: { "Content-Type": "application/json" }
            })

            if (res.ok) {
                setNewComment("")
                // Comment will be added via realtime or we can Optimistically add it
                // fetchComments() // Realtime should handle it
            } else {
                throw new Error("Failed to post comment")
            }
        } catch (error) {
            toast.error("Failed to post comment")
        }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading details...</div>
    if (!incident) return <div className="p-8 text-center">Incident not found</div>

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Incidents
                    </Button>
                </div>
                <div className="flex gap-2">
                    {incident.status !== "resolved" && (
                        <>
                            {incident.status !== "acknowledged" && (
                                <Button variant="outline" size="sm" onClick={() => handleStatusUpdate("acknowledged")}>
                                    Acknowledge
                                </Button>
                            )}
                            <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleStatusUpdate("resolved")}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve Incident
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className={`p-3 rounded-full ${incident.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    Incident #{incident.id}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Monitor: <span className="font-semibold text-foreground">{incident.monitors?.name}</span> ({incident.monitors?.url})
                                </p>
                            </div>
                            <div className="ml-auto">
                                <Badge variant={incident.status === 'resolved' ? 'secondary' : 'destructive'} className="text-sm capitalize px-3 py-1">
                                    {incident.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <h4 className="text-sm text-muted-foreground mb-1">Root Cause</h4>
                                    <p className="font-medium text-red-500">{incident.root_cause}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm text-muted-foreground mb-1">Started At</h4>
                                    <p className="font-medium">{new Date(incident.started_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm text-muted-foreground mb-1">Duration</h4>
                                    <p className="font-medium">{incident.duration || (
                                        incident.status === 'resolved'
                                            ? '-'
                                            : 'Ongoing'
                                    )}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm text-muted-foreground mb-1">Resolved At</h4>
                                    <p className="font-medium">
                                        {incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline / Comments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" /> Activity & Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Auto-generated start event */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 z-10">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        <div className="w-[2px] h-full bg-border/50 -my-2" />
                                    </div>
                                    <div className="pb-8">
                                        <p className="font-semibold">Incident Started</p>
                                        <p className="text-xs text-muted-foreground">{new Date(incident.started_at).toLocaleString()}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            The monitor <strong>{incident.monitors?.name}</strong> went down ({incident.root_cause}).
                                        </p>
                                    </div>
                                </div>

                                {/* Comments Loop */}
                                {comments.map((comment, i) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground z-10">
                                                <User className="h-4 w-4" />
                                            </div>
                                            {(i < comments.length - 1 || incident.resolved_at) && (
                                                <div className="w-[2px] h-full bg-border/50 -my-2" />
                                            )}
                                        </div>
                                        <div className="pb-8 w-full">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-sm">{comment.user_email || 'User'}</p>
                                                <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="bg-muted/30 p-3 rounded-md mt-1 text-sm border border-border/50">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Resolved Event */}
                                {incident.resolved_at && (
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 z-10">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Incident Resolved</p>
                                            <p className="text-xs text-muted-foreground">{new Date(incident.resolved_at).toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Monitor returned to healthy status.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Add Comment Input */}
                            <Separator className="my-6" />
                            <div className="flex gap-4 items-start">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Textarea
                                        placeholder="Add a comment or note..."
                                        value={newComment}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    <div className="flex justify-end">
                                        <Button size="sm" onClick={handlePostComment} disabled={!newComment.trim()}>
                                            <Send className="h-3 w-3 mr-2" /> Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Alerts were sent to <strong>All Team Members</strong> via Email.
                            </p>
                            <Button variant="link" className="p-0 h-auto text-xs mt-2">View delivery logs</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
