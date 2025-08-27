/*
# Create profiles table
This table stores public user data.

## Query Description:
Creates the main table for user profiles, linked to the authentication system. This is a foundational step and safe to run on a new database.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.profiles
- Columns: id, email, full_name, avatar_url, created_at, updated_at
- Constraints: Primary Key on id, Foreign Key to auth.users

## Security Implications:
- RLS Status: Disabled (will be enabled in a later step)
- Policy Changes: No
- Auth Requirements: None for creation

## Performance Impact:
- Indexes: Primary key index on id.
- Triggers: None
- Estimated Impact: Low
*/
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);
alter table public.profiles enable row level security;
