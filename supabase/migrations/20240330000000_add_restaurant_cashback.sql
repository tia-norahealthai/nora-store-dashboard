DO $$ 
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'cashback_percentage'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE restaurants
        ADD COLUMN cashback_percentage DECIMAL(5,2) DEFAULT NULL CHECK (cashback_percentage >= 0 AND cashback_percentage <= 100);
    ELSE
        -- Modify the existing column
        ALTER TABLE restaurants 
        ALTER COLUMN cashback_percentage SET DEFAULT NULL,
        ALTER COLUMN cashback_percentage TYPE DECIMAL(5,2);
    END IF;
END $$;

-- Update existing restaurants with sample cashback values
UPDATE restaurants SET cashback_percentage = 
  CASE 
    WHEN name = 'The Tasty Corner' THEN 2.50
    ELSE ROUND(CAST(random() * 5 AS DECIMAL(5,2)), 2) -- Random cashback between 0-5%
  END; 