-- Run this in your Supabase SQL Editor to add the missing appearance columns
ALTER TABLE public.status_pages 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS favicon_url text,
ADD COLUMN IF NOT EXISTS font text default 'Inter',
ADD COLUMN IF NOT EXISTS show_groups boolean default true,
ADD COLUMN IF NOT EXISTS layout_density text default 'wide' check (layout_density in ('wide', 'compact')),
ADD COLUMN IF NOT EXISTS layout_alignment text default 'left' check (layout_alignment in ('center', 'left'));
