-- Drop existing table if it exists
DROP TABLE IF EXISTS restaurant_users CASCADE;

-- Create simplified restaurant_users table without role
CREATE TABLE IF NOT EXISTS restaurant_users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(restaurant_id, user_id)
);

-- Enable RLS
ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "Users can view their own restaurant associations"
    ON restaurant_users FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own restaurant associations"
    ON restaurant_users FOR ALL
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON restaurant_users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Insert associations for existing restaurants
DO $$
DECLARE
    restaurant_record RECORD;
    user_record RECORD;
BEGIN
    -- Get the first user (or you can specify a particular user)
    SELECT id INTO user_record
    FROM auth.users
    LIMIT 1;

    -- For each restaurant, create an association with the user
    FOR restaurant_record IN (SELECT id FROM restaurants) LOOP
        -- Check if association doesn't already exist
        IF NOT EXISTS (
            SELECT 1 
            FROM restaurant_users 
            WHERE restaurant_id = restaurant_record.id 
            AND user_id = user_record.id
        ) THEN
            -- Insert the association without role
            INSERT INTO restaurant_users (
                restaurant_id,
                user_id,
                created_at,
                updated_at
            ) VALUES (
                restaurant_record.id,
                user_record.id,
                NOW(),
                NOW()
            );
        END IF;
    END LOOP;
END $$; 