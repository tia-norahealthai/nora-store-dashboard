-- Add nutritional_info column to menu_items table
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS nutritional_info JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN menu_items.nutritional_info IS 'Stores nutritional information including calories, protein, fat, carbohydrates, fiber, processed_food flag, and food benefits'; 