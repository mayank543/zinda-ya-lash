import NotificationChannelsList from "@/components/settings/notification-channels-list"

export default function NotificationsPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">Configure global alert channels.</p>
            </div>

            <NotificationChannelsList />
        </div>
    )
}
