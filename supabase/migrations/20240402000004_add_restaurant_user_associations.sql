DO $$
DECLARE
    restaurant_record RECORD;
    user_record RECORD;
BEGIN
    -- Get the first user (or you can specify a particular user)
    SELECT id INTO user_record
    FROM auth.users
    LIMIT 1;

    -- For each restaurant, create an association with the user
    FOR restaurant_record IN (SELECT id FROM restaurants) LOOP
        -- Check if association doesn't already exist
        IF NOT EXISTS (
            SELECT 1 
            FROM restaurant_users 
            WHERE restaurant_id = restaurant_record.id 
            AND user_id = user_record.id
        ) THEN
            -- Insert the association
            INSERT INTO restaurant_users (
                restaurant_id,
                user_id,
                role,
                created_at,
                updated_at
            ) VALUES (
                restaurant_record.id,
                user_record.id,
                'owner',
                NOW(),
                NOW()
            );
        END IF;
    END LOOP;
END $$; 