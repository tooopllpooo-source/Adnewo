/*
# Setup RLS for generated_scripts table
Secures generated scripts.

## Query Description:
Applies RLS policies to the `generated_scripts` table, ensuring users can only access their own saved scripts.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.generated_scripts
- Policies: "Users can manage their own scripts."

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Policies are based on `auth.uid()`.

## Performance Impact:
- Indexes: N/A
- Triggers: N/A
- Estimated Impact: Low
*/
create policy "Users can manage their own scripts." on generated_scripts for all using (auth.uid() = user_id);
