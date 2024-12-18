DO $$ 
BEGIN
    -- Create user_role enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'business_owner');
    END IF;
END $$;

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS user_roles CASCADE;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;

-- Create RLS policies
CREATE POLICY "Users can view their own roles"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Drop existing functions if any
DROP FUNCTION IF EXISTS public.has_role(user_role);
DROP FUNCTION IF EXISTS public.assign_role(UUID, user_role);

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(role_name user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
        AND role = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_role(
    target_user_id UUID,
    role_name user_role
)
RETURNS void AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role('admin'::user_role) THEN
        RAISE EXCEPTION 'Only admins can assign roles';
    END IF;

    -- Insert role if not exists
    INSERT INTO user_roles (user_id, role)
    VALUES (target_user_id, role_name)
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS set_timestamp ON user_roles;

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp(); 