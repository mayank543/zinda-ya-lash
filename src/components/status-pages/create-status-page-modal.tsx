
"use client"

import * as React from "react"
import { useStatusPageModal } from "@/hooks/use-status-page-modal"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

export function CreateStatusPageModal({ onSuccess }: { onSuccess?: () => void }) {
    const { isOpen, onClose, pageToEdit } = useStatusPageModal()
    const [isLoading, setIsLoading] = React.useState(false)
    const [name, setName] = React.useState("")
    const [slug, setSlug] = React.useState("")
    const [password, setPassword] = React.useState("")

    React.useEffect(() => {
        if (pageToEdit) {
            setName(pageToEdit.name)
            setSlug(pageToEdit.slug)
            setPassword(pageToEdit.password_enabled ? "********" : "") // Placeholder
        } else {
            setName("")
            setSlug("")
            setPassword("")
        }
    }, [pageToEdit, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const url = pageToEdit ? `/api/status-pages/${pageToEdit.id}` : "/api/status-pages"
            const method = pageToEdit ? "PATCH" : "POST"

            const payload: any = { name, slug }
            if (password && password !== "********") payload.password = password
            if (password === "") payload.password = "" // clear it if empty strings

            const res = await fetch(url, {
                method,
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Something went wrong")

            toast.success(pageToEdit ? "Status page updated" : "Status page created")
            onClose()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-generate slug from name if creating
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)
        if (!pageToEdit) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{pageToEdit ? "Edit Status Page" : "Create Status Page"}</DialogTitle>
                    <DialogDescription>
                        Create a public status page to showcase your monitors.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={handleNameChange} placeholder="My Company Status" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-1">/status/</span>
                            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-company" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password (Optional)</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave empty for public access"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            If set, visitors will need to enter this password to view the page.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : (pageToEdit ? "Save Changes" : "Create Page")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
