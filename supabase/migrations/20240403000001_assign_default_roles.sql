-- Create a function to automatically assign business_owner role to new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'business_owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically assign role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Assign business_owner role to all existing users who don't have a role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'business_owner'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
);

-- Create a function to assign the first user as admin
CREATE OR REPLACE FUNCTION assign_first_user_as_admin()
RETURNS void AS $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user
    SELECT id INTO first_user_id
    FROM auth.users
    ORDER BY created_at
    LIMIT 1;

    -- If we found a user, assign them the admin role
    IF first_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (first_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to assign the first user as admin
SELECT assign_first_user_as_admin(); 