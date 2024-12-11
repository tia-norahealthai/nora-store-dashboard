-- Add budget and preferences columns to customers table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'snacks_budget') THEN
        ALTER TABLE customers ADD COLUMN snacks_budget DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'meals_budget') THEN
        ALTER TABLE customers ADD COLUMN meals_budget DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'drinks_budget') THEN
        ALTER TABLE customers ADD COLUMN drinks_budget DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'food_preferences') THEN
        ALTER TABLE customers ADD COLUMN food_preferences TEXT[];
    END IF;
END $$;

-- Update existing customers with values and food preferences
UPDATE customers SET
  snacks_budget = 50.00,
  meals_budget = 200.00,
  drinks_budget = 75.00,
  food_preferences = ARRAY['Italian', 'Mediterranean']
WHERE email = 'sarah.j@example.com';

UPDATE customers SET
  snacks_budget = 45.00,
  meals_budget = 180.00,
  drinks_budget = 60.00,
  food_preferences = ARRAY['Asian', 'Japanese', 'Korean']
WHERE email = 'm.chen@example.com';

UPDATE customers SET
  snacks_budget = 40.00,
  meals_budget = 160.00,
  drinks_budget = 50.00,
  food_preferences = ARRAY['American', 'Mexican']
WHERE email = 'emma.w@example.com';

UPDATE customers SET
  snacks_budget = 55.00,
  meals_budget = 220.00,
  drinks_budget = 80.00,
  food_preferences = ARRAY['Mexican', 'Spanish', 'Latin American']
WHERE email = 'j.rodriguez@example.com';

UPDATE customers SET
  snacks_budget = 45.00,
  meals_budget = 190.00,
  drinks_budget = 70.00,
  food_preferences = ARRAY['Seafood', 'Mediterranean']
WHERE email = 'lisa.t@example.com';

UPDATE customers SET
  snacks_budget = 50.00,
  meals_budget = 200.00,
  drinks_budget = 65.00,
  food_preferences = ARRAY['Korean', 'Japanese', 'Chinese']
WHERE email = 'd.kim@example.com';

UPDATE customers SET
  snacks_budget = 35.00,
  meals_budget = 170.00,
  drinks_budget = 45.00,
  food_preferences = ARRAY['Mediterranean', 'Indian', 'Middle Eastern']
WHERE email = 'anna.m@example.com';

UPDATE customers SET
  snacks_budget = 60.00,
  meals_budget = 240.00,
  drinks_budget = 90.00,
  food_preferences = ARRAY['American', 'BBQ', 'Steakhouse']
WHERE email = 'r.taylor@example.com';

UPDATE customers SET
  snacks_budget = 45.00,
  meals_budget = 185.00,
  drinks_budget = 65.00,
  food_preferences = ARRAY['European', 'French', 'Italian']
WHERE email = 'sophie.b@example.com';

UPDATE customers SET
  snacks_budget = 50.00,
  meals_budget = 200.00,
  drinks_budget = 75.00,
  food_preferences = ARRAY['Asian Fusion', 'Thai', 'Vietnamese']
WHERE email = 'd.lee@example.com';

-- Set default values for any remaining customers
UPDATE customers SET
  snacks_budget = COALESCE(snacks_budget, 50.00),
  meals_budget = COALESCE(meals_budget, 200.00),
  drinks_budget = COALESCE(drinks_budget, 75.00),
  food_preferences = COALESCE(food_preferences, ARRAY[]::TEXT[])
WHERE food_preferences IS NULL 
   OR snacks_budget IS NULL 
   OR meals_budget IS NULL 
   OR drinks_budget IS NULL;