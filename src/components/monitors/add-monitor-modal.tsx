"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useMonitorModal } from "@/hooks/use-monitor-modal"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
    monitorType: z.string().min(1, "Monitor type is required"),
    friendlyName: z.string().min(1, "Friendly name is required"),
    url: z.string().optional(),
    keyword: z.string().optional(),
    interval: z.string().min(1),
    timeout: z.string().min(1),
})

export function AddMonitorModal() {
    const { isOpen, onClose, monitorToEdit } = useMonitorModal()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            monitorType: "http",
            friendlyName: "",
            url: "",
            keyword: "",
            interval: "5",
            timeout: "30",
        },
    })

    // Reset form when modal opens/closes or monitorToEdit changes
    React.useEffect(() => {
        if (isOpen) {
            if (monitorToEdit) {
                form.reset({
                    monitorType: monitorToEdit.type || "http",
                    friendlyName: monitorToEdit.name || "",
                    url: monitorToEdit.url || "",
                    keyword: monitorToEdit.keyword || "",
                    interval: String(monitorToEdit.interval || "5"),
                    timeout: String(monitorToEdit.timeout || "30"),
                })
            } else {
                form.reset({
                    monitorType: "http",
                    friendlyName: "",
                    url: "",
                    keyword: "",
                    interval: "5",
                    timeout: "30",
                })
            }
        }
    }, [isOpen, monitorToEdit, form])

    const monitorType = form.watch("monitorType")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const url = monitorToEdit ? `/api/monitors/${monitorToEdit.id}` : "/api/monitors"
            const method = monitorToEdit ? "PATCH" : "POST"

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.friendlyName,
                    type: values.monitorType,
                    url: values.url,
                    keyword: values.keyword,
                    interval: values.interval,
                    timeout: values.timeout,
                }),
            })

            if (!res.ok) throw new Error(`Failed to ${monitorToEdit ? 'update' : 'create'} monitor`)

            toast(monitorToEdit ? "Monitor Updated" : "Monitor Added", {
                description: `${values.friendlyName} has been ${monitorToEdit ? 'updated' : 'added'}.`,
            })

            onClose()
            form.reset()
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast("Error", {
                description: `Failed to ${monitorToEdit ? 'update' : 'create'} monitor. Please try again.`,
            })
        }
    }

    function onChange(open: boolean) {
        if (!open) {
            onClose()
            form.reset()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Monitor</DialogTitle>
                    <DialogDescription>
                        Configure your monitor settings below.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="monitorType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monitor Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select monitor type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="http">HTTP(s)</SelectItem>
                                            <SelectItem value="keyword">Keyword</SelectItem>
                                            <SelectItem value="ping">Ping</SelectItem>
                                            <SelectItem value="port">Port</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose the protocol you want to monitor.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="friendlyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Friendly Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Awesome Website" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {(monitorType === "http" || monitorType === "keyword") && (
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL (or IP)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {monitorType === "keyword" && (
                            <FormField
                                control={form.control}
                                name="keyword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keyword</FormLabel>
                                        <FormControl>
                                            <Input placeholder="text to not exist" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Alert if this keyword exists (or doesn't exist) on the page.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="interval"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monitoring Interval</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select interval" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Every 1 min</SelectItem>
                                                <SelectItem value="5">Every 5 mins</SelectItem>
                                                <SelectItem value="10">Every 10 mins</SelectItem>
                                                <SelectItem value="30">Every 30 mins</SelectItem>
                                                <SelectItem value="60">Every 60 mins</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="timeout"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monitor Timeout</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select timeout" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="15">15 seconds</SelectItem>
                                                <SelectItem value="30">30 seconds</SelectItem>
                                                <SelectItem value="45">45 seconds</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Create Monitor</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
