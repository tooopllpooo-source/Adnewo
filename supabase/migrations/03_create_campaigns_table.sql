/*
# [Operation] Create Campaigns Table
Creates the table to store Adsterra campaign data for each user.

## Query Description:
This script creates the `campaigns` table to cache campaign data fetched from the Adsterra API. This improves performance by reducing the number of API calls. Data is associated with a user.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (by dropping the table)

## Structure Details:
- Table: `public.campaigns`
- Columns: `id`, `user_id`, `name`, `url`, `cpm`, `country`, `device`, `category`, `status`, `impressions`, `clicks`, `revenue`, `is_selected`, `created_at`, `updated_at`
- Constraints: Primary Key on `id`, Foreign Key on `user_id` referencing `public.profiles.id`.

## Security Implications:
- RLS Status: Not enabled by this script.
- Policy Changes: No
- Auth Requirements: None.

## Performance Impact:
- Indexes: Primary key and foreign key indexes. An index on `cpm` is added for sorting.
- Triggers: None.
- Estimated Impact: Low.
*/

-- Create the campaigns table
CREATE TABLE public.campaigns (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    cpm NUMERIC(10, 4) NOT NULL,
    country TEXT NOT NULL,
    device TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    revenue NUMERIC(10, 4) NOT NULL DEFAULT 0,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, user_id)
);

-- Add index for better query performance
CREATE INDEX idx_campaigns_user_id_cpm ON public.campaigns (user_id, cpm DESC);

-- Add comments
COMMENT ON TABLE public.campaigns IS 'Stores Adsterra campaign data fetched for each user.';
