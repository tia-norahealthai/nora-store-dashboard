-- Add restaurant_id column to orders table if it doesn't exist
DO $$ 
DECLARE
    default_restaurant_id UUID;
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'restaurant_id'
    ) THEN
        -- Add restaurant_id column
        ALTER TABLE public.orders
        ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id);

        -- Create an index for better query performance
        CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id 
        ON public.orders(restaurant_id);

        -- Get the first restaurant as default
        SELECT id INTO default_restaurant_id
        FROM restaurants
        LIMIT 1;

        -- First try to assign random restaurants
        WITH random_restaurants AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY RANDOM()) as rn 
            FROM restaurants
        )
        UPDATE orders o
        SET restaurant_id = r.id
        FROM random_restaurants r
        WHERE o.restaurant_id IS NULL
        AND r.rn = 1 + (FLOOR(RANDOM() * (SELECT COUNT(*) FROM restaurants)))::INTEGER;

        -- Assign default restaurant to any remaining null values
        UPDATE orders
        SET restaurant_id = default_restaurant_id
        WHERE restaurant_id IS NULL;

        -- Now that all rows have a restaurant_id, make it required
        ALTER TABLE public.orders
        ALTER COLUMN restaurant_id SET NOT NULL;
    END IF;
END $$; 