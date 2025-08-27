/*
# Setup RLS for profiles table
Secures the profiles table.

## Query Description:
Applies Row Level Security (RLS) policies to the `public.profiles` table. This ensures users can only view and edit their own profile information.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.profiles
- Policies: "Public profiles are viewable by everyone.", "Users can insert their own profile.", "Users can update own profile."

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Policies are based on `auth.uid()`.

## Performance Impact:
- Indexes: N/A
- Triggers: N/A
- Estimated Impact: Low
*/
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
