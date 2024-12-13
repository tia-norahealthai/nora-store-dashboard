-- Rename item_type column to type in meal_plan_items table
ALTER TABLE meal_plan_items RENAME COLUMN item_type TO type;

-- Update the type check constraint
ALTER TABLE meal_plan_items DROP CONSTRAINT IF EXISTS meal_plan_items_item_type_check;
ALTER TABLE meal_plan_items ADD CONSTRAINT meal_plan_items_type_check 
  CHECK (type IN ('Meal', 'Snack', 'Drink')); 