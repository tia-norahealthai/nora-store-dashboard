-- Create restaurant_locations table
CREATE TABLE IF NOT EXISTS restaurant_locations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
    address text NOT NULL,
    city text NOT NULL,
    state text,
    postal_code text,
    country text DEFAULT 'US',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create restaurant_platforms table
CREATE TABLE IF NOT EXISTS restaurant_platforms (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
    platform_name text NOT NULL,
    platform_url text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on both tables
ALTER TABLE restaurant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_platforms ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for restaurant_locations
CREATE POLICY "Users can view locations of their restaurants"
    ON restaurant_locations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_users
            WHERE restaurant_users.restaurant_id = restaurant_locations.restaurant_id
            AND restaurant_users.user_id = auth.uid()
        )
    );

-- Add RLS policies for restaurant_platforms
CREATE POLICY "Users can view platforms of their restaurants"
    ON restaurant_platforms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_users
            WHERE restaurant_users.restaurant_id = restaurant_platforms.restaurant_id
            AND restaurant_users.user_id = auth.uid()
        )
    ); 