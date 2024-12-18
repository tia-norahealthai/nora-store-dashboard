BEGIN;

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Enable read access for users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read permissions" ON public.role_permissions;

-- Drop existing tables to avoid conflicts
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;

-- Create enum type for user roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'business_owner');
    END IF;
END $$;

-- Create the user_roles table
CREATE TABLE public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'business_owner',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role)
);

-- Create the role_permissions table
CREATE TABLE public.role_permissions (
    id SERIAL PRIMARY KEY,
    role user_role NOT NULL,
    resource TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (role, resource)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.role_permissions TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;
GRANT ALL ON TABLE public.role_permissions TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create simplified RLS policies
CREATE POLICY "Allow users to read all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to read all permissions"
    ON public.role_permissions FOR SELECT
    TO authenticated
    USING (true);

-- Insert default permissions for business owners
INSERT INTO public.role_permissions (role, resource)
VALUES 
    ('business_owner', '/dashboard'),
    ('business_owner', '/orders'),
    ('business_owner', '/menu'),
    ('business_owner', '/opportunities'),
    ('business_owner', '/maria'),
    ('business_owner', '/maria/history'),
    ('business_owner', '/settings')
ON CONFLICT (role, resource) DO NOTHING;

-- Create trigger function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'business_owner')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Assign roles to existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'business_owner'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Function to assign admin role
CREATE OR REPLACE FUNCTION assign_admin_role(target_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION assign_admin_role(UUID) TO authenticated;

-- Create policy for admin role assignment
CREATE POLICY "Allow admins to insert roles"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Assign admin role to the first user (you can replace this with specific user IDs)
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id
    FROM auth.users
    ORDER BY created_at
    LIMIT 1;

    IF first_user_id IS NOT NULL THEN
        PERFORM assign_admin_role(first_user_id);
    END IF;
END
$$;

-- Allow admins to update roles
CREATE POLICY "Allow admins to update roles"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Allow admins to delete roles
CREATE POLICY "Allow admins to delete roles"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Function to manage user roles
CREATE OR REPLACE FUNCTION manage_user_role(
    target_user_id UUID,
    new_role user_role
)
RETURNS void AS $$
BEGIN
    -- Delete existing role if it exists
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id;
    
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, new_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION manage_user_role(UUID, user_role) TO authenticated;

COMMIT;