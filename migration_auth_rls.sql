
-- 1. Enable RLS on existing tables
alter table public.monitors enable row level security;
alter table public.status_pages enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_comments enable row level security;
alter table public.heartbeats enable row level security;

-- 2. Add user_id columns
alter table public.monitors add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table public.status_pages add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table public.incidents add column if not exists user_id uuid references auth.users(id) default auth.uid();
-- incident_comments usually linked to user via profile or auth.uid, let's add user_id for authorship
alter table public.incident_comments add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table public.maintenance_windows add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table public.team_members add column if not exists user_id uuid references auth.users(id) default auth.uid(); -- owner of the team
alter table public.integrations add column if not exists user_id uuid references auth.users(id) default auth.uid();

-- 3. Create Policies

-- Monitors
create policy "Users can select own monitors" on public.monitors for select using (user_id = auth.uid());
create policy "Users can insert own monitors" on public.monitors for insert with check (auth.uid() = user_id);
create policy "Users can update own monitors" on public.monitors for update using (user_id = auth.uid());
create policy "Users can delete own monitors" on public.monitors for delete using (user_id = auth.uid());

-- Status Pages (Private Management)
create policy "Users can select own status_pages" on public.status_pages for select using (user_id = auth.uid());
create policy "Users can insert own status_pages" on public.status_pages for insert with check (auth.uid() = user_id);
create policy "Users can update own status_pages" on public.status_pages for update using (user_id = auth.uid());
create policy "Users can delete own status_pages" on public.status_pages for delete using (user_id = auth.uid());

-- Status Pages (Public Access) - Allow anyone to read status pages by slug (if we have a published flag, check it, else allow)
-- Logic: If looking up by slug, allow. But RLS is row-based.
-- Simplest: Allow SELECT for ALL if we assume all created pages are public.
-- OR: Add a separate policy for public access.
create policy "Public access to status_pages" on public.status_pages for select using (true); 
-- note: this overrides the "own" select policy effectively for SELECT.
-- IF we want to hide sensitive fields, we need Column Level Security or separate views, but for now this is fine.

-- Incidents
create policy "Users can manage own incidents" on public.incidents for all using (user_id = auth.uid());

-- Comments
create policy "Users can manage own comments" on public.incident_comments for all using (user_id = auth.uid());

-- Maintenance
create policy "Users can manage own maintenance" on public.maintenance_windows for all using (user_id = auth.uid());

-- Integrations
create policy "Users can manage own integrations" on public.integrations for all using (user_id = auth.uid());

-- Junction Tables (Need strict access based on parent)
-- status_page_monitors
-- Policy: Allow if user owns the status_page_id OR status_page is public?
-- Public view needs to fetch monitors for a page. So yes, allow select true.
alter table public.status_page_monitors enable row level security;
create policy "Public access to status_page_monitors" on public.status_page_monitors for select using (true);
create policy "Users can insert status_page_monitors" on public.status_page_monitors for insert with check (
    exists (select 1 from public.status_pages where id = status_page_id and user_id = auth.uid())
);
create policy "Users can delete status_page_monitors" on public.status_page_monitors for delete using (
    exists (select 1 from public.status_pages where id = status_page_id and user_id = auth.uid())
);

-- maintenance_monitors
alter table public.maintenance_monitors enable row level security;
create policy "Users can manage maintenance_monitors" on public.maintenance_monitors for all using (
    exists (select 1 from public.maintenance_windows where id = maintenance_id and user_id = auth.uid())
);

-- Heartbeats (Public? No. User only? Yes. Cron job?)
-- The Cron Job runs as service role / or we need to allow `anon` insert if using simple setup?
-- Ideally Cron API route uses Service Role key to bypass RLS.
-- For User Dashboard:
create policy "Users can select own heartbeats" on public.heartbeats for select using (
    exists (select 1 from public.monitors where id = monitor_id and user_id = auth.uid())
);

-- Team Members
create policy "Users can manage own team" on public.team_members for all using (user_id = auth.uid());

