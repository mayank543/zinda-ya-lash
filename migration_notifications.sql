-- Create Notification Channels table
create table public.notification_channels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('email', 'webhook', 'slack')),
  config jsonb not null default '{}', -- Stores email_address, webhook_url, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notification_channels enable row level security;

-- Policies
create policy "Users can view their own notification_channels"
  on public.notification_channels for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notification_channels"
  on public.notification_channels for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notification_channels"
  on public.notification_channels for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notification_channels"
  on public.notification_channels for delete
  using (auth.uid() = user_id);


-- Create Monitor Notifications Junction table
create table public.monitor_notifications (
  id uuid default gen_random_uuid() primary key,
  monitor_id uuid references public.monitors(id) on delete cascade not null,
  channel_id uuid references public.notification_channels(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(monitor_id, channel_id)
);

-- Enable RLS
alter table public.monitor_notifications enable row level security;

-- Policies (Indirect access via monitor ownership)
-- We assume if you can see the monitor, you can see its notifications
create policy "Users can view monitor_notifications"
  on public.monitor_notifications for select
  using (
    exists (
      select 1 from public.monitors
      where monitors.id = monitor_notifications.monitor_id
      and monitors.user_id = auth.uid()
    )
  );

create policy "Users can insert monitor_notifications"
  on public.monitor_notifications for insert
  with check (
    exists (
      select 1 from public.monitors
      where monitors.id = monitor_notifications.monitor_id
      and monitors.user_id = auth.uid()
    )
  );

create policy "Users can delete monitor_notifications"
  on public.monitor_notifications for delete
  using (
    exists (
      select 1 from public.monitors
      where monitors.id = monitor_notifications.monitor_id
      and monitors.user_id = auth.uid()
    )
  );
