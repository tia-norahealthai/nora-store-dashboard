-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Add restaurant_id to menu_items table
ALTER TABLE menu_items 
ADD COLUMN restaurant_id UUID REFERENCES restaurants(id);

-- Create index for better query performance
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);

-- Insert sample restaurant data
INSERT INTO restaurants (
  name,
  address,
  logo_url,
  phone,
  email,
  website,
  business_hours
) VALUES (
  'The Tasty Corner',
  '123 Main Street, Cityville, ST 12345',
  'https://example.com/logo.png',
  '+1 (555) 123-4567',
  'contact@tastycorner.com',
  'https://tastycorner.com',
  '{
    "monday": {"open": "09:00", "close": "22:00"},
    "tuesday": {"open": "09:00", "close": "22:00"},
    "wednesday": {"open": "09:00", "close": "22:00"},
    "thursday": {"open": "09:00", "close": "22:00"},
    "friday": {"open": "09:00", "close": "23:00"},
    "saturday": {"open": "10:00", "close": "23:00"},
    "sunday": {"open": "10:00", "close": "21:00"}
  }'::jsonb
);

-- Update existing menu items to associate with the restaurant
UPDATE menu_items
SET restaurant_id = (SELECT id FROM restaurants LIMIT 1)
WHERE restaurant_id IS NULL;

-- Make restaurant_id required for future menu items
ALTER TABLE menu_items
ALTER COLUMN restaurant_id SET NOT NULL; 