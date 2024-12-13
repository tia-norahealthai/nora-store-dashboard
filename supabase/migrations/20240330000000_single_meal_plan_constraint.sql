-- First, keep only the most recent meal plan for each customer
WITH latest_meal_plans AS (
  SELECT DISTINCT ON (customer_id) 
    id,
    customer_id
  FROM meal_plans
  ORDER BY customer_id, created_at DESC
),
duplicates AS (
  DELETE FROM meal_plans mp
  WHERE mp.id NOT IN (
    SELECT id FROM latest_meal_plans
  )
  AND mp.customer_id IN (
    SELECT customer_id FROM latest_meal_plans
  )
  RETURNING *
)
SELECT count(*) FROM duplicates;

-- Now we can safely add the unique constraint
ALTER TABLE meal_plans
ADD CONSTRAINT unique_customer_meal_plan UNIQUE (customer_id); 