DO $$ 
BEGIN
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Super admins can view all restaurant associations" ON restaurant_users;
    DROP POLICY IF EXISTS "Super admins can view all restaurants" ON restaurants;
    DROP POLICY IF EXISTS "Users can insert restaurants if they are business owners" ON restaurants;
    DROP POLICY IF EXISTS "Users can view their own restaurant associations" ON restaurant_users;
    DROP POLICY IF EXISTS "Users can manage their own restaurant associations" ON restaurant_users;
    DROP POLICY IF EXISTS "Users can view restaurants they are associated with" ON restaurants;
    DROP POLICY IF EXISTS "Users can view their own restaurants" ON restaurants;
    DROP POLICY IF EXISTS "Users can create restaurants" ON restaurants;
    DROP POLICY IF EXISTS "Users can insert restaurants" ON restaurants;
    DROP POLICY IF EXISTS "Users can update their own restaurants" ON restaurants;
    DROP POLICY IF EXISTS "Users can delete their own restaurants" ON restaurants;

    -- Drop role-related tables and functions
    DROP FUNCTION IF EXISTS public.has_role;
    DROP FUNCTION IF EXISTS public.get_user_roles;
    DROP FUNCTION IF EXISTS public.assign_role;
    DROP FUNCTION IF EXISTS public.create_super_admin;
    DROP TABLE IF EXISTS user_roles CASCADE;
    DROP TABLE IF EXISTS roles CASCADE;
    DROP TYPE IF EXISTS user_role;

    -- Create new simplified policies for restaurants
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'restaurants' 
        AND policyname = 'Users can view their own restaurants'
    ) THEN
        CREATE POLICY "Users can view their own restaurants"
            ON restaurants FOR SELECT
            USING (
                EXISTS (
                    select 1 
                    from restaurant_users
                    where restaurant_users.restaurant_id = restaurants.id
                    and restaurant_users.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'restaurants' 
        AND policyname = 'Users can create restaurants'
    ) THEN
        CREATE POLICY "Users can create restaurants"
            ON restaurants FOR INSERT
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'restaurants' 
        AND policyname = 'Users can update their own restaurants'
    ) THEN
        CREATE POLICY "Users can update their own restaurants"
            ON restaurants FOR UPDATE
            USING (
                EXISTS (
                    select 1 
                    from restaurant_users
                    where restaurant_users.restaurant_id = restaurants.id
                    and restaurant_users.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'restaurants' 
        AND policyname = 'Users can delete their own restaurants'
    ) THEN
        CREATE POLICY "Users can delete their own restaurants"
            ON restaurants FOR DELETE
            USING (
                EXISTS (
                    select 1 
                    from restaurant_users
                    where restaurant_users.restaurant_id = restaurants.id
                    and restaurant_users.user_id = auth.uid()
                )
            );
    END IF;

    -- Create new simplified policies for restaurant_users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'restaurant_users' 
        AND policyname = 'Users can view their own restaurant associations'
    ) THEN
        CREATE POLICY "Users can view their own restaurant associations"
            ON restaurant_users FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'restaurant_users' 
        AND policyname = 'Users can manage their own restaurant associations'
    ) THEN
        CREATE POLICY "Users can manage their own restaurant associations"
            ON restaurant_users FOR ALL
            USING (auth.uid() = user_id);
    END IF;

END $$;