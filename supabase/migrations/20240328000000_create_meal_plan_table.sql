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

-- Create indexes for better query performance (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meal_plans_customer_id') THEN
        CREATE INDEX idx_meal_plans_customer_id ON meal_plans(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meal_plan_items_meal_plan_id') THEN
        CREATE INDEX idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meal_plan_items_menu_item_id') THEN
        CREATE INDEX idx_meal_plan_items_menu_item_id ON meal_plan_items(menu_item_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meal_plan_items_day_daytime') THEN
        CREATE INDEX idx_meal_plan_items_day_daytime ON meal_plan_items(day, daytime);
    END IF;
END $$;

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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS check_allergens_before_insert ON meal_plan_items;
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
DROP TRIGGER IF EXISTS update_meal_plan_items_updated_at ON meal_plan_items;

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

-- Add sample meal plan items (considering only allergens)
WITH sample_plan AS (
    SELECT mp.id AS meal_plan_id, c.allergens
    FROM meal_plans mp
    JOIN customers c ON mp.customer_id = c.id
    LIMIT 1
),
time_slots AS (
    SELECT 
        day::day_of_week AS day,
        time::daytime AS daytime
    FROM UNNEST(ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) AS day
    CROSS JOIN UNNEST(ARRAY['morning', 'afternoon', 'evening']) AS time
),
available_items AS (
    SELECT id, category, name
    FROM menu_items mi
    WHERE 
        -- Only exclude items with allergens the customer is allergic to
        NOT (mi.allergens && (SELECT allergens FROM sample_plan))
)
INSERT INTO meal_plan_items (meal_plan_id, menu_item_id, day, daytime)
SELECT 
    p.meal_plan_id,
    (
        SELECT id 
        FROM available_items 
        ORDER BY RANDOM() 
        LIMIT 1
    ) AS menu_item_id,
    ts.day,
    ts.daytime
FROM sample_plan p
CROSS JOIN time_slots ts;

-- Create function to populate meal plan items
CREATE OR REPLACE FUNCTION populate_meal_plan_items(meal_plan_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO meal_plan_items (meal_plan_id, menu_item_id, day, daytime)
    WITH customer_prefs AS (
        SELECT c.allergens
        FROM meal_plans mp
        JOIN customers c ON mp.customer_id = c.id
        WHERE mp.id = meal_plan_id
    ),
    time_slots AS (
        SELECT 
            day::day_of_week AS day,
            time::daytime AS daytime
        FROM UNNEST(ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) AS day
        CROSS JOIN UNNEST(ARRAY['morning', 'afternoon', 'evening']) AS time
    ),
    available_items AS (
        SELECT id
        FROM menu_items mi
        WHERE 
            -- Only exclude items with allergens the customer is allergic to
            NOT (mi.allergens && (SELECT allergens FROM customer_prefs))
    )
    SELECT 
        meal_plan_id,
        (
            SELECT id 
            FROM available_items 
            ORDER BY RANDOM() 
            LIMIT 1
        ) AS menu_item_id,
        ts.day,
        ts.daytime
    FROM time_slots ts
    WHERE EXISTS (SELECT 1 FROM available_items);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically populate meal plan items when a new meal plan is created
CREATE OR REPLACE FUNCTION trigger_populate_meal_plan_items()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM populate_meal_plan_items(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_populate_meal_plan_items ON meal_plans;

-- Create trigger
CREATE TRIGGER auto_populate_meal_plan_items
    AFTER INSERT ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION trigger_populate_meal_plan_items(); 