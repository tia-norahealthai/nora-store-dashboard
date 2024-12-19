# Database Schema Documentation

## Tables Overview

### Users Table
- Primary table for user management
- Managed by Supabase Auth

**Schema:** 
sql
users (
id uuid primary key,
email text unique,
created_at timestamp with time zone,
updated_at timestamp with time zone
)


### Orders Table
- Stores all customer orders
- Links to users and contains order details

**Schema:**
sql
orders (
id uuid primary key default uuid_generate_v4(),
user_id uuid references users(id),
status text,
total_amount decimal(10,2),
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
)

### Order Items Table
- Contains individual items within each order
- Links to the orders table

**Schema:**
sql
order_items (
id uuid primary key default uuid_generate_v4(),
order_id uuid references orders(id),
product_name text,
quantity integer,
price decimal(10,2),
created_at timestamp with time zone default now()
)

### Meal Plans Table
- Stores user meal plan subscriptions
- Links to users table

**Schema:**
sql
meal_plans (
id uuid primary key default uuid_generate_v4(),
user_id uuid references users(id),
status text,
start_date date,
end_date date,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
)


### Meal Plan Items Table
- Contains individual meals within each meal plan
- Links to meal plans table

**Schema:**
sql
meal_plan_items (
id uuid primary key default uuid_generate_v4(),
meal_plan_id uuid references meal_plans(id),
meal_name text,
scheduled_date date,
meal_type text,
created_at timestamp with time zone default now()
)


## Relationships

1. **Users → Orders**
   - One-to-Many relationship
   - A user can have multiple orders
   - Foreign key: `orders.user_id` references `users.id`

2. **Orders → Order Items**
   - One-to-Many relationship
   - An order can have multiple order items
   - Foreign key: `order_items.order_id` references `orders.id`

3. **Users → Meal Plans**
   - One-to-Many relationship
   - A user can have multiple meal plans
   - Foreign key: `meal_plans.user_id` references `users.id`

4. **Meal Plans → Meal Plan Items**
   - One-to-Many relationship
   - A meal plan can have multiple meal items
   - Foreign key: `meal_plan_items.meal_plan_id` references `meal_plans.id`


## Indexes
- `users.email` - Unique index for email lookups
- `orders.user_id` - Index for faster order queries by user
- `order_items.order_id` - Index for faster item lookups by order
- `meal_plans.user_id` - Index for faster meal plan queries by user
- `meal_plan_items.meal_plan_id` - Index for faster item lookups by meal plan
- `meal_plan_items.scheduled_date` - Index for date-based queries

## Constraints
1. Users
   - Email must be unique
   - ID must be unique (primary key)

2. Orders
   - Must have a valid user_id
   - Total amount cannot be negative
   - Status must be one of: 'pending', 'processing', 'completed', 'cancelled'

3. Order Items
   - Must have a valid order_id
   - Quantity must be positive
   - Price must be non-negative

4. Meal Plans
   - Must have a valid user_id
   - End date must be after start date
   - Status must be one of: 'active', 'paused', 'cancelled', 'completed'

5. Meal Plan Items
   - Must have a valid meal_plan_id
   - Scheduled date must fall within meal plan date range
   - Meal type must be one of: 'breakfast', 'lunch', 'dinner', 'snack'

## Database Functions and Triggers

### Updated At Trigger
- Automatically updates the `updated_at` timestamp when a record is modified
- Applied to: `users`, `orders` tables

### Order Total Calculator
- Trigger function that recalculates order total when order items are modified
- Maintains data consistency between order items and order total

## Security Policies

### Row Level Security (RLS)
1. Users
   - Users can only read their own profile
   - Only admins can modify user data

2. Orders
   - Users can only view and modify their own orders
   - Admins can view all orders

3. Order Items
   - Users can only view items from their own orders
   - Order items can only be modified while order status is 'pending'

4. Meal Plans
   - Users can only view and modify their own meal plans
   - Admins can view all meal plans

5. Meal Plan Items
   - Users can only view items from their own meal plans
   - Items can only be modified while meal plan status is 'active'

## Backup and Recovery
- Daily automated backups
- Point-in-time recovery enabled
- Backup retention period: 30 days

## Performance Considerations
1. Indexes are created on frequently queried columns
2. Partitioning strategy for orders table (if data volume grows)
3. Regular VACUUM and ANALYZE operations scheduled

## Migration Guidelines
1. Always use timestamped migration files
2. Include both up and down migrations
3. Test migrations on staging before production
4. Document breaking changes

## Common Queries

### Get User's Orders with Items

sql
SELECT
o.,
json_agg(oi.) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = :user_id
GROUP BY o.id;


### Get Order Summary
sql
SELECT
o.id,
o.created_at,
o.status,
COUNT(oi.id) as item_count,
SUM(oi.quantity oi.price) as total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = :order_id
GROUP BY o.id;

### Get User's Active Meal Plan with Items
sql
SELECT
mp.,
json_agg(mpi. ORDER BY mpi.scheduled_date) as meals
FROM meal_plans mp
LEFT JOIN meal_plan_items mpi ON mp.id = mpi.meal_plan_id
WHERE mp.user_id = :user_id
AND mp.status = 'active'
AND mp.start_date <= CURRENT_DATE
AND mp.end_date >= CURRENT_DATE
GROUP BY mp.id;

### Get Weekly Meal Schedule
sql
SELECT
mpi.scheduled_date,
json_agg(
json_build_object(
'meal_type', mpi.meal_type,
'meal_name', mpi.meal_name
) ORDER BY mpi.meal_type
) as daily_meals
FROM meal_plan_items mpi
JOIN meal_plans mp ON mp.id = mpi.meal_plan_id
WHERE mp.user_id = :user_id
AND mpi.scheduled_date BETWEEN :start_date AND :end_date
GROUP BY mpi.scheduled_date
ORDER BY mpi.scheduled_date;

## Maintenance Tasks
1. Regular index maintenance
2. Monitoring table bloat
3. Analyzing query performance
4. Updating statistics

---

Last Updated: March 21, 2024