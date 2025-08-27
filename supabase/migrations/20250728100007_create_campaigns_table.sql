/*
# Create campaigns table
Stores campaign data fetched from Adsterra.

## Query Description:
Creates the `campaigns` table to cache campaign data for each user.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.campaigns
- Columns: id, user_id, name, url, cpm, country, device, category, status, impressions, clicks, revenue, is_selected, created_at, updated_at
- Constraints: Foreign Key to public.profiles

## Security Implications:
- RLS Status: Disabled (will be enabled in a later step)
- Policy Changes: No
- Auth Requirements: Linked to user profiles.

## Performance Impact:
- Indexes: Primary key and foreign key indexes.
- Triggers: None
- Estimated Impact: Low
*/
create table public.campaigns (
    id text not null,
    user_id uuid not null references public.profiles on delete cascade,
    name text not null,
    url text not null,
    cpm numeric not null,
    country text not null,
    device text not null,
    category text not null,
    status text not null,
    impressions integer not null default 0,
    clicks integer not null default 0,
    revenue numeric not null default 0,
    is_selected boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id, user_id)
);
alter table public.campaigns enable row level security;
