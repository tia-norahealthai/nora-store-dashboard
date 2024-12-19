# Database Schema Documentation

## Tables Overview

### Users Table
- Primary table for user management
- Managed by Supabase Auth

**Schema:** 
```sql
users (
    id uuid primary key,
    email text unique,        -- User's email address (unique identifier)
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
```

### Restaurants Table
- Primary table for restaurant information
- Contains restaurant details and operational data

**Schema:**
```sql
restaurants (
    id uuid primary key default uuid_generate_v4(),
    name text not null,                    -- Restaurant name
    description text,                      -- Restaurant description
    address text not null,                 -- Physical address
    contact_phone text,                    -- Contact phone number
    business_hours jsonb,                  -- Operating hours for each day
    cuisine_type text[],                   -- Array of cuisine types
    rating decimal(3,2),                   -- Average rating (1.00-5.00)
    is_active boolean default true,        -- Whether restaurant is active
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
)
```

### Orders Table
- Stores all customer orders
- Links to users and contains order details

**Schema:**
```sql
orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id),  -- Reference to the user who placed the order
    status text,                        -- Order status (pending/processing/completed/cancelled)
    total_amount decimal(10,2),         -- Total order amount including all items
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
)
```

### Order Items Table
- Contains individual items within each order
- Links to the orders table

**Schema:**
```sql
order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references orders(id), -- Reference to the parent order
    product_name text,                   -- Name of the ordered product
    quantity integer,                    -- Number of items ordered
    price decimal(10,2),                 -- Price per unit
    created_at timestamp with time zone default now()
)
```

### Meal Plans Table
- Stores user meal plan subscriptions
- Links to users table

**Schema:**
```sql
meal_plans (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id),   -- Reference to the subscribing user
    status text,                         -- Subscription status
    start_date date,                     -- Plan start date
    end_date date,                       -- Plan end date
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
)
```

### Meal Plan Items Table
- Contains individual meals within each meal plan
- Links to meal plans table

**Schema:**
```sql
meal_plan_items (
    id uuid primary key default uuid_generate_v4(),
    meal_plan_id uuid references meal_plans(id), -- Reference to the parent meal plan
    meal_name text,                              -- Name of the meal
    scheduled_date date,                         -- Date when meal is scheduled
    meal_type text,                             -- Type of meal (breakfast/lunch/dinner/snack)
    created_at timestamp with time zone default now()
)
```

### Customers Table
- Extended profile information for users
- Links to users table

**Schema:**
```sql
customers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id),     -- Reference to the base user
    full_name text,                        -- Customer's full name
    phone_number text,                     -- Contact phone number
    delivery_address text,                 -- Default delivery address
    preferences jsonb,                     -- Customer preferences
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
)
```

### Restaurant Users Table
- Links restaurant staff to their restaurant
- Manages restaurant-specific user roles

**Schema:**
```sql
restaurant_users (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id),        -- Reference to the base user
    restaurant_id uuid references restaurants(id), -- Reference to the restaurant
    role text not null,                       -- Role within the restaurant
    is_active boolean default true,           -- Whether the user is active
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
)
```

### Menu Items Table
- Stores restaurant menu items
- Contains pricing and availability information

**Schema:**
```sql
menu_items (
    id uuid primary key default uuid_generate_v4(),
    restaurant_id uuid references restaurants(id), -- Reference to the restaurant
    name text not null,                           -- Item name
    description text,                             -- Item description
    price decimal(10,2) not null,                 -- Item price
    category text,                                -- Item category
    is_available boolean default true,            -- Whether item is available
    image_url text,                               -- URL to item image
    allergens text[],                             -- Array of allergens
    nutritional_info jsonb,                       -- Nutritional information
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
)
```

### Role Permissions Table
- Defines permissions for different roles
- Used for access control

**Schema:**
```sql
role_permissions (
    id uuid primary key default uuid_generate_v4(),
    role_name text not null,                      -- Name of the role
    permission_name text not null,                -- Name of the permission
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    UNIQUE(role_name, permission_name)
)
```

### User Roles Table
- Associates users with their roles
- Manages user permissions

**Schema:**
```sql
user_roles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id),            -- Reference to the user
    role_name text references role_permissions(role_name), -- Reference to the role
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    UNIQUE(user_id, role_name)
)
```

## Views

### Restaurant Auth View
- Security view for restaurant authentication and authorization
- Used to validate restaurant user permissions and access rights

**Schema:**
```sql
CREATE VIEW restaurant_auth_view AS
SELECT 
    ru.id as restaurant_user_id,
    ru.user_id,
    ru.restaurant_id,
    ru.role as restaurant_role,
    ru.is_active,
    r.name as restaurant_name,
    u.email as user_email,
    ur.role_name as system_role,
    array_agg(DISTINCT rp.permission_name) as permissions
FROM restaurant_users ru
JOIN restaurants r ON ru.restaurant_id = r.id
JOIN users u ON ru.user_id = u.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN role_permissions rp ON ur.role_name = rp.role_name
WHERE ru.is_active = true
GROUP BY 
    ru.id,
    ru.user_id,
    ru.restaurant_id,
    ru.role,
    ru.is_active,
    r.name,
    u.email,
    ur.role_name;
```

**Purpose:**
- Combines restaurant user information with their system-wide roles and permissions
- Provides a single source of truth for authorization checks
- Simplifies access control in application code

**Usage:**
1. Authentication
   - Validates restaurant staff credentials
   - Verifies active status of restaurant users

2. Authorization
   - Determines user's role within specific restaurants
   - Checks permissions for restaurant-specific operations
   - Controls access to restaurant management features

3. Access Control
   - Used by Row Level Security policies
   - Enforces restaurant-specific data isolation
   - Manages feature access based on roles

**Example Queries:**

```sql
-- Check user's restaurant permissions
SELECT * FROM restaurant_auth_view
WHERE user_id = :user_id
    AND restaurant_id = :restaurant_id;

-- Get all restaurants user can manage
SELECT * FROM restaurant_auth_view
WHERE user_id = :user_id
    AND restaurant_role = 'manager';

-- Verify specific permission
SELECT EXISTS (
    SELECT 1 FROM restaurant_auth_view
    WHERE user_id = :user_id
        AND restaurant_id = :restaurant_id
        AND 'manage_menu' = ANY(permissions)
) as has_permission;
```

## Relationships

1. **Users → Orders**
   - One-to-Many relationship
   - A user can have multiple orders
   - Foreign key: `orders.user_id` references `users.id`

2. **Restaurants → Orders**
   - One-to-Many relationship
   - A restaurant can have multiple orders
   - Foreign key: `orders.restaurant_id` references `restaurants.id`

3. **Orders → Order Items**
   - One-to-Many relationship
   - An order can have multiple order items
   - Foreign key: `order_items.order_id` references `orders.id`

4. **Users → Meal Plans**
   - One-to-Many relationship
   - A user can have multiple meal plans
   - Foreign key: `meal_plans.user_id` references `users.id`

5. **Restaurants → Meal Plans**
   - One-to-Many relationship
   - A restaurant can provide multiple meal plans
   - Foreign key: `meal_plans.restaurant_id` references `restaurants.id`

6. **Meal Plans → Meal Plan Items**
   - One-to-Many relationship
   - A meal plan can have multiple meal items
   - Foreign key: `meal_plan_items.meal_plan_id` references `meal_plans.id`

7. **Users → Customers**
   - One-to-One relationship
   - Each user can have one customer profile
   - Foreign key: `customers.user_id` references `users.id`

8. **Users → Restaurant Users**
   - One-to-Many relationship
   - A user can be associated with multiple restaurants
   - Foreign key: `restaurant_users.user_id` references `users.id`

9. **Restaurants → Restaurant Users**
   - One-to-Many relationship
   - A restaurant can have multiple staff members
   - Foreign key: `restaurant_users.restaurant_id` references `restaurants.id`

10. **Restaurants → Menu Items**
    - One-to-Many relationship
    - A restaurant can have multiple menu items
    - Foreign key: `menu_items.restaurant_id` references `restaurants.id`

11. **Users → User Roles**
    - One-to-Many relationship
    - A user can have multiple roles
    - Foreign key: `user_roles.user_id` references `users.id`

## Indexes
- `users.email` - Unique index for email lookups
- `restaurants.name` - Index for restaurant name searches
- `restaurants.cuisine_type` - GiST index for cuisine type array searches
- `restaurants.rating` - Index for rating-based queries
- `orders.user_id` - Index for faster order queries by user
- `orders.restaurant_id` - Index for faster order queries by restaurant
- `order_items.order_id` - Index for faster item lookups by order
- `meal_plans.user_id` - Index for faster meal plan queries by user
- `meal_plans.restaurant_id` - Index for faster meal plan queries by restaurant
- `meal_plan_items.meal_plan_id` - Index for faster item lookups by meal plan
- `meal_plan_items.scheduled_date` - Index for date-based queries
- `customers.user_id` - Unique index for user lookup
- `restaurant_users.user_id` - Index for user lookup
- `restaurant_users.restaurant_id` - Index for restaurant staff lookup
- `menu_items.restaurant_id` - Index for restaurant menu lookup
- `menu_items.category` - Index for category-based searches
- `role_permissions.role_name` - Index for role lookup
- `user_roles.user_id` - Index for user role lookup

## Constraints
1. Users
   - Email must be unique
   - ID must be unique (primary key)

2. Restaurants
   - Name must not be empty
   - Address must not be empty
   - Rating must be between 1.00 and 5.00
   - Business hours must be valid JSON format
   - Cuisine types array must not be empty

3. Orders
   - Must have a valid user_id
   - Total amount cannot be negative
   - Status must be one of: 'pending', 'processing', 'completed', 'cancelled'

4. Order Items
   - Must have a valid order_id
   - Quantity must be positive
   - Price must be non-negative

5. Meal Plans
   - Must have a valid user_id
   - End date must be after start date
   - Status must be one of: 'active', 'paused', 'cancelled', 'completed'

6. Meal Plan Items
   - Must have a valid meal_plan_id
   - Scheduled date must fall within meal plan date range
   - Meal type must be one of: 'breakfast', 'lunch', 'dinner', 'snack'

7. Customers
   - User ID must be unique
   - Phone number must be valid format
   - Preferences must be valid JSON

8. Restaurant Users
   - Combination of user_id and restaurant_id must be unique
   - Role must be one of: 'owner', 'manager', 'staff'

9. Menu Items
   - Price must be positive
   - Name must not be empty
   - Nutritional info must be valid JSON

10. Role Permissions
    - Combination of role_name and permission_name must be unique

11. User Roles
    - Combination of user_id and role_name must be unique

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

6. Restaurant Users
   - Users can only view their own restaurant associations
   - Restaurant owners can manage their staff
   - Admins can view all associations

7. Menu Items
   - Public read access for available items
   - Only restaurant staff can modify their restaurant's menu items

8. Role Permissions
   - Only admins can modify roles and permissions
   - Public read access for role information

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
```sql
SELECT 
    o.*,
    json_agg(oi.*) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = :user_id
GROUP BY o.id;
```

### Get Order Summary
```sql
SELECT
    o.id,
    o.created_at,
    o.status,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity * oi.price) as total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = :order_id
GROUP BY o.id;
```

### Get User's Active Meal Plan with Items
```sql
SELECT
    mp.*,
    json_agg(mpi.* ORDER BY mpi.scheduled_date) as meals
FROM meal_plans mp
LEFT JOIN meal_plan_items mpi ON mp.id = mpi.meal_plan_id
WHERE mp.user_id = :user_id
    AND mp.status = 'active'
    AND mp.start_date <= CURRENT_DATE
    AND mp.end_date >= CURRENT_DATE
GROUP BY mp.id;
```

### Get Weekly Meal Schedule
```sql
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
```

### Get Restaurant Details with Rating
```sql
SELECT 
    r.*,
    COUNT(DISTINCT o.id) as total_orders,
    AVG(o.total_amount) as average_order_amount
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
WHERE r.is_active = true
GROUP BY r.id;
```

### Get Restaurant's Active Meal Plans
```sql
SELECT 
    r.name as restaurant_name,
    mp.*,
    COUNT(mpi.id) as total_meals
FROM restaurants r
JOIN meal_plans mp ON r.id = mp.restaurant_id
LEFT JOIN meal_plan_items mpi ON mp.id = mpi.meal_plan_id
WHERE r.id = :restaurant_id
    AND mp.status = 'active'
    AND mp.start_date <= CURRENT_DATE
    AND mp.end_date >= CURRENT_DATE
GROUP BY r.name, mp.id;
```

## Maintenance Tasks
1. Regular index maintenance
2. Monitoring table bloat
3. Analyzing query performance
4. Updating statistics

## Error Handling

### Database Errors
1. Foreign Key Violations
   - Log error details
   - Return user-friendly message
   - Rollback transaction

2. Unique Constraint Violations
   - Handle duplicate email entries gracefully
   - Provide clear feedback to users

3. Check Constraint Violations
   - Validate data before insertion
   - Return specific error messages for each constraint

### Application-Level Error Handling
1. Connection Errors
   - Implement connection pooling
   - Automatic reconnection strategy
   - Circuit breaker pattern for repeated failures

2. Transaction Management
   - Proper transaction isolation levels
   - Deadlock detection and handling
   - Automatic retry for recoverable errors

## Monitoring and Logging

### Performance Monitoring
1. Query Performance
   - Track slow queries (> 1 second)
   - Monitor query plans
   - Log query statistics

2. Resource Usage
   - CPU utilization
   - Memory usage
   - Disk I/O
   - Connection pool statistics

### Audit Logging
1. User Actions
   - Track all data modifications
   - Log user authentication attempts
   - Record admin operations

2. System Events
   - Backup operations
   - Maintenance tasks
   - Schema migrations

### Alerts and Notifications
1. Performance Thresholds
   - Slow query alerts
   - High resource usage warnings
   - Connection pool exhaustion

2. Security Events
   - Failed login attempts
   - Unauthorized access attempts
   - RLS policy violations

---

Last Updated: March 21, 2024