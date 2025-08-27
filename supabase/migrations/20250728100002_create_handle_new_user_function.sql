/*
# Create handle_new_user function
This function automatically creates a profile for a new user.

## Query Description:
Creates a PostgreSQL function that inserts a new row into the `public.profiles` table whenever a new user is created in `auth.users`. This automates profile creation.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function: public.handle_new_user

## Security Implications:
- RLS Status: N/A
- Policy Changes: No
- Auth Requirements: Defines function with `security definer` for necessary permissions.

## Performance Impact:
- Indexes: N/A
- Triggers: This function will be used by a trigger.
- Estimated Impact: Low
*/
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$;
