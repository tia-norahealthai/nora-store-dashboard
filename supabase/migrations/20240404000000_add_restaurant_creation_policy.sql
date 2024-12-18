-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can create their own restaurants" ON public.restaurants;
    DROP POLICY IF EXISTS "Users can view their own restaurants" ON public.restaurants;
    DROP POLICY IF EXISTS "Users can update their own restaurants" ON public.restaurants;
    DROP POLICY IF EXISTS "Users can delete their own restaurants" ON public.restaurants;
    
    -- Enable RLS if not already enabled
    ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

    -- Create new policies
    CREATE POLICY "Users can create their own restaurants"
    ON public.restaurants
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Users can view their own restaurants"
    ON public.restaurants
    FOR SELECT
    USING (auth.uid() = created_by);

    CREATE POLICY "Users can update their own restaurants"
    ON public.restaurants
    FOR UPDATE
    USING (auth.uid() = created_by);

    CREATE POLICY "Users can delete their own restaurants"
    ON public.restaurants
    FOR DELETE
    USING (auth.uid() = created_by);
END $$; 