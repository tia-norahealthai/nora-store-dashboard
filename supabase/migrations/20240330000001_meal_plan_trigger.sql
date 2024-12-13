-- Create a function to handle meal plan insertions
CREATE OR REPLACE FUNCTION handle_meal_plan_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete any existing meal plans for this customer
    DELETE FROM meal_plans
    WHERE customer_id = NEW.customer_id
    AND id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER meal_plan_insert_trigger
    BEFORE INSERT ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION handle_meal_plan_insert(); 