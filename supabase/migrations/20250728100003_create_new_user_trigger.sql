/*
# Create on_auth_user_created trigger
This trigger fires the handle_new_user function.

## Query Description:
Creates a trigger that executes the `handle_new_user` function after a new user is inserted into the `auth.users` table.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Trigger: on_auth_user_created
- Target Table: auth.users

## Security Implications:
- RLS Status: N/A
- Policy Changes: No
- Auth Requirements: N/A

## Performance Impact:
- Indexes: N/A
- Triggers: Adds a trigger to `auth.users`.
- Estimated Impact: Low, as it only fires on user creation.
*/
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
