-- First, check if daytime type exists and create if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'daytime') THEN
        CREATE TYPE daytime AS ENUM ('morning', 'afternoon', 'evening');
    END IF;
END $$;

-- Add availability fields to menu_items table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'available_days') THEN
        ALTER TABLE menu_items
        ADD COLUMN available_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'available_times') THEN
        ALTER TABLE menu_items
        ADD COLUMN available_times daytime[] DEFAULT ARRAY['morning', 'afternoon', 'evening']::daytime[];
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                  WHERE constraint_name = 'valid_available_days') THEN
        ALTER TABLE menu_items
        ADD CONSTRAINT valid_available_days CHECK (
            available_days <@ ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                  WHERE constraint_name = 'valid_available_times') THEN
        ALTER TABLE menu_items
        ADD CONSTRAINT valid_available_times CHECK (
            available_times <@ ARRAY['morning', 'afternoon', 'evening']::daytime[]
        );
    END IF;
END $$;

-- Add indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE indexname = 'idx_menu_items_available_days') THEN
        CREATE INDEX idx_menu_items_available_days ON menu_items USING GIN (available_days);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE indexname = 'idx_menu_items_available_times') THEN
        CREATE INDEX idx_menu_items_available_times ON menu_items USING GIN (available_times);
    END IF;
END $$;

-- Create or replace the availability check function
CREATE OR REPLACE FUNCTION is_menu_item_available(
    item_id UUID,
    day_of_week TEXT,
    meal_time daytime
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM menu_items 
        WHERE id = item_id 
            AND day_of_week = ANY(available_days)
            AND meal_time = ANY(available_times)
    );
END;
$$ LANGUAGE plpgsql;

-- Add a rollback section in case we need to undo these changes
COMMENT ON FUNCTION is_menu_item_available(UUID, TEXT, daytime) IS 
'Checks if a menu item is available on a specific day and time';

-- In case we need to roll back:
-- DROP FUNCTION IF EXISTS is_menu_item_available(UUID, TEXT, daytime);
-- DROP INDEX IF EXISTS idx_menu_items_available_times;
-- DROP INDEX IF EXISTS idx_menu_items_available_days;
-- ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS valid_available_times;
-- ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS valid_available_days;
-- ALTER TABLE menu_items DROP COLUMN IF EXISTS available_times;
-- ALTER TABLE menu_items DROP COLUMN IF EXISTS available_days;
-- DROP TYPE IF EXISTS daytime; 