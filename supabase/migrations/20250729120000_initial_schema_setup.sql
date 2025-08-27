/*
# [Initial Schema Setup]
This script sets up the complete initial database schema for the Adnewo application. It creates all necessary tables, functions, triggers, and Row Level Security (RLS) policies required for the application to function correctly.

## Query Description: This is a foundational script for a new database. It will create four main tables: `profiles` for user data, `api_credentials` for Adsterra keys, `campaigns` for ad campaign data, and `generated_scripts` for saved code snippets. It also sets up automation to create user profiles upon sign-up and enforces strict security rules so users can only access their own data. This operation is safe to run on an empty database but should not be run on a database that already has these tables.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables Created: public.profiles, public.api_credentials, public.campaigns, public.generated_scripts
- Functions Created: public.handle_new_user, public.update_updated_at_column
- Triggers Created: on_auth_user_created, update_profiles_updated_at, update_api_credentials_updated_at, update_campaigns_updated_at

## Security Implications:
- RLS Status: Enabled for all new tables.
- Policy Changes: Yes, policies are created to ensure users can only access their own data.
- Auth Requirements: Policies are based on `auth.uid()`, linking data to authenticated users.

## Performance Impact:
- Indexes: Primary keys and foreign keys will have indexes created automatically.
- Triggers: Triggers are added for creating user profiles and updating timestamps. Impact is minimal and necessary for data integrity.
- Estimated Impact: Low performance impact on a new database.
*/

-- 1. Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row modification.';

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Function and Trigger to Handle New Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a new user profile upon registration.';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates a profile for a new user.';

-- 4. Setup RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. Create API Credentials Table
CREATE TABLE public.api_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    api_key_encrypted text NOT NULL,
    publisher_id text NOT NULL,
    endpoint text NOT NULL DEFAULT 'https://api.adsterra.com/v1',
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.api_credentials IS 'Stores encrypted API credentials for Adsterra.';

CREATE TRIGGER update_api_credentials_updated_at
BEFORE UPDATE ON public.api_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Setup RLS for API Credentials
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own API credentials." ON public.api_credentials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Create Campaigns Table
CREATE TABLE public.campaigns (
    id text NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    name text NOT NULL,
    url text NOT NULL,
    cpm numeric(10, 4) NOT NULL,
    country text NOT NULL,
    device text NOT NULL,
    category text NOT NULL,
    status text NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    revenue numeric(10, 4) DEFAULT 0.00 NOT NULL,
    is_selected boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (id, user_id)
);
COMMENT ON TABLE public.campaigns IS 'Caches campaign data from Adsterra API for each user.';

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Setup RLS for Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own campaigns." ON public.campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Create Generated Scripts Table
CREATE TABLE public.generated_scripts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    name text NOT NULL,
    script_code text NOT NULL,
    config jsonb NOT NULL,
    campaign_ids text[] NOT NULL,
    script_type text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.generated_scripts IS 'Stores user-generated popunder scripts.';

-- 10. Setup RLS for Generated Scripts
ALTER TABLE public.generated_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own generated scripts." ON public.generated_scripts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
