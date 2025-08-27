/*
# [Operation] Create Profiles Table
Creates the public.profiles table to store user profile information, linked to the auth.users table.

## Query Description:
This script creates the `profiles` table which is essential for storing user-specific data that is not part of the default Supabase auth schema. It includes a foreign key to `auth.users` to link profiles with authenticated users. This is a foundational step and is safe to run on a new project.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the table)

## Structure Details:
- Table: `public.profiles`
- Columns: `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`
- Constraints: Primary Key on `id`, Foreign Key on `id` referencing `auth.users.id`.

## Security Implications:
- RLS Status: Not enabled by this script. Will be enabled in a later script.
- Policy Changes: No
- Auth Requirements: None for this script execution.

## Performance Impact:
- Indexes: Primary key index is created.
- Triggers: None.
- Estimated Impact: Low.
*/

-- Create the profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Add comments to the table and columns
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the user in auth.users.';
