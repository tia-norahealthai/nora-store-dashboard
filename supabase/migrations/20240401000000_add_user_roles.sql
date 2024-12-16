-- Create roles enum type
CREATE TYPE user_role AS ENUM ('super_admin', 'business_owner');

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Super administrator with full system access'),
  ('business_owner', 'Restaurant owner with access to their business data');

-- Create RLS policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
CREATE POLICY "Roles viewable by authenticated users" ON roles
  FOR SELECT TO authenticated USING (true);

-- Policies for user_roles table
CREATE POLICY "User roles viewable by authenticated users" ON user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "User roles insertable by super_admin" ON user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'::user_role
    )
  );

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(role_name user_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TABLE (role_name user_role) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_role(
  target_user_id UUID,
  role_name user_role
)
RETURNS void AS $$
DECLARE
  role_id UUID;
BEGIN
  -- Check if caller is super_admin
  IF NOT public.has_role('super_admin'::user_role) THEN
    RAISE EXCEPTION 'Only super admins can assign roles';
  END IF;

  -- Get role id
  SELECT id INTO role_id
  FROM roles
  WHERE name = role_name;

  -- Insert role if not exists
  INSERT INTO user_roles (user_id, role_id)
  VALUES (target_user_id, role_id)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to create super admin
CREATE OR REPLACE FUNCTION public.create_super_admin(email TEXT, password TEXT)
RETURNS void AS $$
DECLARE
  new_user_id UUID;
  super_admin_role_id UUID;
BEGIN
  -- Get super_admin role id
  SELECT id INTO super_admin_role_id
  FROM roles
  WHERE name = 'super_admin'::user_role;

  -- Create user
  new_user_id := auth.uid();
  
  -- Assign super_admin role
  INSERT INTO user_roles (user_id, role_id)
  VALUES (new_user_id, super_admin_role_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);