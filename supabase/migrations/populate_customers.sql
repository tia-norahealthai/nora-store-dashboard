INSERT INTO customers (
  name,
  email,
  phone,
  dietary_preferences,
  allergens
) VALUES
  (
    'Sarah Johnson',
    'sarah.j@example.com',
    '+1 (555) 123-4567',
    ARRAY['Vegetarian'],
    ARRAY['Peanuts', 'Shellfish']
  ),
  (
    'Michael Chen',
    'm.chen@example.com',
    '+1 (555) 234-5678',
    ARRAY['None'],
    ARRAY['Dairy']
  ),
  (
    'Emma Wilson',
    'emma.w@example.com',
    '+1 (555) 345-6789',
    ARRAY['Gluten-Free'],
    ARRAY['Gluten']
  ),
  (
    'James Rodriguez',
    'j.rodriguez@example.com',
    '+1 (555) 456-7890',
    ARRAY['None'],
    ARRAY[]::TEXT[]
  ),
  (
    'Lisa Thompson',
    'lisa.t@example.com',
    '+1 (555) 567-8901',
    ARRAY['Pescatarian'],
    ARRAY['Soy']
  ),
  (
    'David Kim',
    'd.kim@example.com',
    '+1 (555) 678-9012',
    ARRAY['None'],
    ARRAY['Nuts']
  ),
  (
    'Anna Martinez',
    'anna.m@example.com',
    '+1 (555) 789-0123',
    ARRAY['Vegan'],
    ARRAY[]::TEXT[]
  ),
  (
    'Robert Taylor',
    'r.taylor@example.com',
    '+1 (555) 890-1234',
    ARRAY['None'],
    ARRAY['Eggs']
  ),
  (
    'Sophie Brown',
    'sophie.b@example.com',
    '+1 (555) 901-2345',
    ARRAY['Lactose-Free'],
    ARRAY['Dairy', 'Soy']
  ),
  (
    'Daniel Lee',
    'd.lee@example.com',
    '+1 (555) 012-3456',
    ARRAY['None'],
    ARRAY[]::TEXT[]
  ); 