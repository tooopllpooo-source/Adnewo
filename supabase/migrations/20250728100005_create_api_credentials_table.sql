/*
# Create api_credentials table
Stores encrypted API credentials for users.

## Query Description:
Creates the `api_credentials` table to store user-specific Adsterra API credentials. The API key is encrypted.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.api_credentials
- Columns: id, user_id, api_key_encrypted, publisher_id, endpoint, is_active, created_at, updated_at
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
create table public.api_credentials (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references public.profiles on delete cascade,
    api_key_encrypted text not null,
    publisher_id text not null,
    endpoint text not null default 'https://api.adsterra.com/v1',
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);
alter table public.api_credentials enable row level security;
