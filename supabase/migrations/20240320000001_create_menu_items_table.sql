-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    dietary TEXT[],
    allergens TEXT[],
    ingredients TEXT[],
    preparation_time INTEGER,
    available_days TEXT[],
    nutritional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    calories INTEGER,
    protein NUMERIC,
    carbohydrates NUMERIC,
    fat NUMERIC,
    fiber NUMERIC,
    type VARCHAR NOT NULL,
    cuisine_type VARCHAR,
    average_rating NUMERIC,
    added_sugars NUMERIC,
    processed_food BOOLEAN DEFAULT false,
    dressing TEXT,
    food_benefits TEXT,
    healthy_score NUMERIC,
    availability BOOLEAN DEFAULT true,
    available_times TEXT[]
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Add RLS policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Restaurant staff can manage their menu items" ON menu_items;
    DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policy to allow restaurant staff to manage their menu items
CREATE POLICY "Restaurant staff can manage their menu items"
    ON menu_items
    FOR ALL
    USING (
        restaurant_id IN (
            SELECT restaurant_id 
            FROM restaurant_users 
            WHERE user_id = auth.uid()
        )
    );

-- Create policy to allow public to view menu items
CREATE POLICY "Public can view menu items"
    ON menu_items
    FOR SELECT
    USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_timestamp ON menu_items;
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp(); 