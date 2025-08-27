/*
# [Operation] Setup RLS and Triggers
Enables Row Level Security on all tables and creates a trigger to handle new user profiles.

## Query Description:
This is a critical security and functionality script.
1.  **Profile Trigger**: It creates a function (`public.handle_new_user`) that automatically inserts a new row into `public.profiles` when a new user signs up in `auth.users`.
2.  **RLS Policies**: It enables RLS on all tables and adds policies to ensure that users can only access and manage their own data. This prevents data leaks between users.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: false (requires manual reversal of policies and triggers)

## Structure Details:
- Tables affected: `profiles`, `api_credentials`, `campaigns`, `generated_scripts`
- Functions created: `handle_new_user`
- Triggers created: `on_auth_user_created`

## Security Implications:
- RLS Status: Enabled on all tables.
- Policy Changes: Yes, policies are created for all CRUD operations.
- Auth Requirements: Policies are based on `auth.uid()`.

## Performance Impact:
- Indexes: None.
- Triggers: Adds a trigger on `auth.users` table.
- Estimated Impact: Low, but RLS adds a small overhead to every query.
*/

-- 1. Create a function to automatically create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- 2. Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_scripts ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the 'profiles' table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Create RLS policies for 'api_credentials' table
CREATE POLICY "Users can manage their own API credentials" ON public.api_credentials
  FOR ALL USING (auth.uid() = user_id);

-- 6. Create RLS policies for 'campaigns' table
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

-- 7. Create RLS policies for 'generated_scripts' table
CREATE POLICY "Users can manage their own scripts" ON public.generated_scripts
  FOR ALL USING (auth.uid() = user_id);
