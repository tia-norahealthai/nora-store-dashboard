-- Create enum for days of the week if not exists
DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM (
        'monday', 'tuesday', 'wednesday', 'thursday', 
        'friday', 'saturday', 'sunday'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for daytime if not exists
DO $$ BEGIN
    CREATE TYPE daytime AS ENUM ('morning', 'afternoon', 'evening');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create meal_plan_items table to store the menu items for each day/time
CREATE TABLE IF NOT EXISTS meal_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    day day_of_week NOT NULL,
    daytime daytime NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (meal_plan_id, day, daytime, menu_item_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_meal_plans_customer_id ON meal_plans(customer_id);
CREATE INDEX idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_menu_item_id ON meal_plan_items(menu_item_id);
CREATE INDEX idx_meal_plan_items_day_daytime ON meal_plan_items(day, daytime);

-- Create function to check for allergen conflicts
CREATE OR REPLACE FUNCTION check_meal_plan_allergens()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if any menu items contain allergens that the customer is allergic to
    IF EXISTS (
        SELECT 1
        FROM meal_plan_items mpi
        JOIN menu_items mi ON mpi.menu_item_id = mi.id
        JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
        JOIN customers c ON mp.customer_id = c.id
        WHERE mpi.meal_plan_id = NEW.meal_plan_id
        AND mi.allergens && c.allergens
    ) THEN
        RAISE EXCEPTION 'Menu item contains allergens that conflict with customer allergies';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check allergens before inserting meal plan items
CREATE TRIGGER check_allergens_before_insert
    BEFORE INSERT ON meal_plan_items
    FOR EACH ROW
    EXECUTE FUNCTION check_meal_plan_allergens();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plan_items_updated_at
    BEFORE UPDATE ON meal_plan_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sample meal plan data
INSERT INTO meal_plans (customer_id, name, start_date, end_date)
SELECT 
    c.id,
    'Weekly Plan',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days'
FROM customers c
WHERE c.email = 'sarah.j@example.com'
LIMIT 1;

-- Add sample meal plan items (ensuring no allergen conflicts)
WITH sample_plan AS (
    SELECT id AS meal_plan_id
    FROM meal_plans
    LIMIT 1
)
INSERT INTO meal_plan_items (meal_plan_id, menu_item_id, day, daytime)
SELECT 
    p.meal_plan_id,
    mi.id AS menu_item_id,
    'monday'::day_of_week AS day,
    'morning'::daytime AS daytime
FROM sample_plan p
CROSS JOIN (
    SELECT id 
    FROM menu_items 
    WHERE NOT (allergens && ARRAY['Peanuts', 'Shellfish'])
    LIMIT 1
) mi; 