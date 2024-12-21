-- Add time_ranges column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'time_ranges') THEN
        ALTER TABLE menu_items ADD COLUMN time_ranges JSONB;
    END IF;
END $$;

-- Create validation function for time_ranges
CREATE OR REPLACE FUNCTION validate_time_ranges()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.time_ranges IS NOT NULL AND NOT (
        SELECT BOOL_AND(
            (value->>'start') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND
            (value->>'end') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        )
        FROM jsonb_array_elements(NEW.time_ranges)
    ) THEN
        RAISE EXCEPTION 'Invalid time format in time_ranges. Must be HH:MM format.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for time_ranges validation
DROP TRIGGER IF EXISTS validate_time_ranges_trigger ON menu_items;
CREATE TRIGGER validate_time_ranges_trigger
    BEFORE INSERT OR UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_time_ranges();

-- Insert the menu item
INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    category,
    price,
    type,
    dietary,
    allergens,
    ingredients,
    preparation_time,
    calories,
    protein,
    carbohydrates,
    fat,
    fiber,
    cuisine_type,
    healthy_score,
    availability,
    available_days,
    available_times,
    time_ranges
) VALUES (
    '41d83f5b-930b-49ec-8792-8d6601512e40',
    'Mediterranean Quinoa Bowl',
    'Fresh and nutritious bowl with quinoa, roasted vegetables, feta cheese, and herb-infused olive oil dressing',
    'Bowls',
    15.99,
    'main',
    ARRAY['vegetarian', 'gluten-free'],
    ARRAY['dairy', 'nuts'],
    ARRAY['quinoa', 'bell peppers', 'zucchini', 'feta cheese', 'olive oil', 'herbs', 'pine nuts'],
    20,
    450,
    18,
    52,
    22,
    8,
    'Mediterranean',
    85,
    true,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    ARRAY['afternoon', 'evening']::daytime[],
    '[{"start": "12:00", "end": "16:59"}, {"start": "17:00", "end": "23:59"}]'::jsonb
); 