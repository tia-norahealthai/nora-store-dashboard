-- Add cashback column to restaurants table
ALTER TABLE restaurants
ADD COLUMN cashback_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (cashback_percentage >= 0 AND cashback_percentage <= 100);

-- Update existing restaurants with sample cashback values
UPDATE restaurants SET cashback_percentage = 
  CASE 
    WHEN name = 'The Tasty Corner' THEN 2.50
    ELSE ROUND(CAST(random() * 5 AS DECIMAL(5,2)), 2) -- Random cashback between 0-5%
  END; 