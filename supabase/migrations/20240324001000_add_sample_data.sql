-- First, ensure we have some customers
INSERT INTO customers (id, name, email, phone, created_at)
SELECT 
  uuid_generate_v4(),
  'Customer ' || i,
  'customer' || i || '@example.com',
  '+1' || (floor(random() * 900) + 100)::text || (floor(random() * 900) + 100)::text || (floor(random() * 9000) + 1000)::text,
  NOW() - (random() * interval '90 days')
FROM generate_series(1, 10) i
ON CONFLICT DO NOTHING;

-- Insert 20 sample orders
WITH sample_orders AS (
  INSERT INTO orders (
    id,
    customer_id,
    status,
    total_amount,
    created_at,
    updated_at
  )
  SELECT 
    uuid_generate_v4(),
    (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
    (ARRAY['pending', 'processing', 'completed', 'cancelled'])[floor(random() * 4 + 1)],
    0.00, -- Will be updated after adding order items
    NOW() - (random() * interval '30 days'),
    NOW() - (random() * interval '30 days')
  FROM generate_series(1, 20)
  RETURNING id, created_at
)
-- Insert 1-4 order items for each order
INSERT INTO order_items (
  id,
  order_id,
  menu_item_id,
  quantity,
  unit_price,
  subtotal,
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(),
  o.id as order_id,
  mi.id as menu_item_id,
  floor(random() * 3 + 1)::int as quantity,
  mi.price as unit_price,
  (floor(random() * 3 + 1)::int * mi.price) as subtotal,
  o.created_at,
  o.created_at
FROM sample_orders o
CROSS JOIN LATERAL (
  SELECT id, price 
  FROM menu_items 
  ORDER BY RANDOM() 
  LIMIT floor(random() * 4 + 1) -- Random number of items 1-4
) mi;

-- Update order totals
UPDATE orders o
SET total_amount = (
  SELECT COALESCE(SUM(subtotal), 0)
  FROM order_items
  WHERE order_id = o.id
)
WHERE EXISTS (
  SELECT 1 
  FROM order_items oi 
  WHERE oi.order_id = o.id
); 

-- Add this to your existing migration or create a new one
ALTER TABLE orders 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'preparing', 'in_delivery', 'completed', 'cancelled'));

-- Add some sample data with different statuses
INSERT INTO orders (status, customer_id, /* other fields */) 
VALUES 
  ('pending', /* customer_id */, /* other values */),
  ('completed', /* customer_id */, /* other values */),
  ('in_delivery', /* customer_id */, /* other values */);