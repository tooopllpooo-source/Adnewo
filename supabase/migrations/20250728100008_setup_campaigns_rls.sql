/*
# Setup RLS for campaigns table
Secures campaign data.

## Query Description:
Applies RLS policies to the `campaigns` table, ensuring users can only access their own campaign data.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.campaigns
- Policies: "Users can manage their own campaigns."

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Policies are based on `auth.uid()`.

## Performance Impact:
- Indexes: N/A
- Triggers: N/A
- Estimated Impact: Low
*/
create policy "Users can manage their own campaigns." on campaigns for all using (auth.uid() = user_id);
