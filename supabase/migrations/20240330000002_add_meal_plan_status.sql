-- Add status column to meal_plans table
ALTER TABLE meal_plans 
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN ('draft', 'partial', 'completed'));

-- Create function to update meal plan status based on items
CREATE OR REPLACE FUNCTION update_meal_plan_status()
RETURNS TRIGGER AS $$
DECLARE
    total_slots INTEGER;
    filled_slots INTEGER;
BEGIN
    -- Calculate total possible slots (7 days * 3 times * 3 types = 63 slots)
    total_slots := 63;
    
    -- Count filled slots
    SELECT COUNT(*)
    INTO filled_slots
    FROM meal_plan_items
    WHERE meal_plan_id = NEW.meal_plan_id;
    
    -- Update meal plan status
    UPDATE meal_plans
    SET status = CASE
        WHEN filled_slots = 0 THEN 'draft'
        WHEN filled_slots = total_slots THEN 'completed'
        ELSE 'partial'
    END
    WHERE id = NEW.meal_plan_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update status when items change
CREATE TRIGGER update_meal_plan_status_trigger
AFTER INSERT OR DELETE OR UPDATE ON meal_plan_items
FOR EACH ROW
EXECUTE FUNCTION update_meal_plan_status(); 