-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add some sample restaurants
INSERT INTO public.restaurants (name, address, phone) VALUES
    ('Downtown Diner', '123 Main St, Downtown', '+1234567890'),
    ('Seaside Restaurant', '456 Beach Rd, Waterfront', '+1234567891'),
    ('Mountain View Cafe', '789 Highland Ave, Uptown', '+1234567892');

-- Add restaurant_id column to orders table
ALTER TABLE public.orders
ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id);

-- Create an index for better query performance
CREATE INDEX idx_orders_restaurant_id ON public.orders(restaurant_id);

-- Update existing orders to have a random restaurant (for sample data)
WITH random_restaurants AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY RANDOM()) as rn 
    FROM restaurants
)
UPDATE orders o
SET restaurant_id = r.id
FROM random_restaurants r
WHERE o.restaurant_id IS NULL
AND r.rn = 1 + (FLOOR(RANDOM() * (SELECT COUNT(*) FROM restaurants)))::INTEGER;

-- Make restaurant_id required for future orders
ALTER TABLE public.orders
ALTER COLUMN restaurant_id SET NOT NULL;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for restaurants table
CREATE TRIGGER set_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 