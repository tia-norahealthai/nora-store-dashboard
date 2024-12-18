-- Create enum for weight goal pace if not exists
DO $$ BEGIN
    CREATE TYPE weight_goal_pace AS ENUM ('slow', 'normal', 'fast');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns if they don't exist
DO $$ 
BEGIN 
    -- Add height_feet if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'height_feet') THEN
        ALTER TABLE customers ADD COLUMN height_feet INTEGER CHECK (height_feet >= 0);
    END IF;
    
    -- Add height_inches if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'height_inches') THEN
        ALTER TABLE customers ADD COLUMN height_inches INTEGER CHECK (height_inches >= 0 AND height_inches < 12);
    END IF;
    
    -- Add weight if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'weight') THEN
        ALTER TABLE customers ADD COLUMN weight DECIMAL(5,1) CHECK (weight >= 0);
    END IF;
    
    -- Add weight_goal if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'weight_goal') THEN
        ALTER TABLE customers ADD COLUMN weight_goal DECIMAL(5,1) CHECK (weight_goal >= 0);
    END IF;
    
    -- Add weight_goal_pace if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'weight_goal_pace') THEN
        ALTER TABLE customers ADD COLUMN weight_goal_pace weight_goal_pace;
    END IF;
END $$;