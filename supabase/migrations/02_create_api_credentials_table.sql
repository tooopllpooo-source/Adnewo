/*
# [Operation] Create API Credentials Table
Creates the table to securely store user's Adsterra API credentials.

## Query Description:
This script creates the `api_credentials` table. It's designed to hold encrypted API keys and other related information for connecting to the Adsterra API. It is linked to the `profiles` table via the `user_id`.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (by dropping the table)

## Structure Details:
- Table: `public.api_credentials`
- Columns: `id`, `user_id`, `api_key_encrypted`, `publisher_id`, `endpoint`, `is_active`, `created_at`, `updated_at`
- Constraints: Primary Key on `id`, Foreign Key on `user_id` referencing `public.profiles.id`.

## Security Implications:
- RLS Status: Not enabled by this script.
- Policy Changes: No
- Auth Requirements: None for this script execution.

## Performance Impact:
- Indexes: Primary key and foreign key indexes are created.
- Triggers: None.
- Estimated Impact: Low.
*/

-- Create the api_credentials table
CREATE TABLE public.api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    api_key_encrypted TEXT NOT NULL,
    publisher_id TEXT NOT NULL,
    endpoint TEXT NOT NULL DEFAULT 'https://api.adsterra.com/v1',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.api_credentials IS 'Stores encrypted API credentials for each user.';
COMMENT ON COLUMN public.api_credentials.api_key_encrypted IS 'The Adsterra API key, encrypted.';
