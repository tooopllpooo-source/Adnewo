/*
# Setup RLS for api_credentials table
Secures API credentials.

## Query Description:
Applies RLS policies to the `api_credentials` table, ensuring users can only access and manage their own credentials.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.api_credentials
- Policies: "Users can manage their own API credentials."

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Policies are based on `auth.uid()`.

## Performance Impact:
- Indexes: N/A
- Triggers: N/A
- Estimated Impact: Low
*/
create policy "Users can manage their own API credentials." on api_credentials for all using (auth.uid() = user_id);
