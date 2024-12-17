DO $$ 
BEGIN
    -- First, drop all existing policies on restaurant_users
    DROP POLICY IF EXISTS "Super admins can view all restaurant associations" ON restaurant_users;
    DROP POLICY IF EXISTS "Users can view their own restaurant associations" ON restaurant_users;
    DROP POLICY IF EXISTS "Users can manage their own restaurant associations" ON restaurant_users;
    
    -- Drop and recreate the restaurant_users table
    DROP TABLE IF EXISTS restaurant_users CASCADE;
    
    -- Recreate restaurant_users table with proper structure
    CREATE TABLE restaurant_users (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        role text NOT NULL DEFAULT 'owner',
        created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(restaurant_id, user_id)
    );

    -- Enable RLS
    ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;

    -- Create new simplified policies
    CREATE POLICY "Users can view their own restaurant associations"
        ON restaurant_users FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage their own restaurant associations"
        ON restaurant_users FOR ALL
        USING (auth.uid() = user_id);

    -- Create updated_at trigger
    CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON restaurant_users
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();

END $$; 