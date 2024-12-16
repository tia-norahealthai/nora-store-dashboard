BEGIN;  -- Start transaction

-- Insert 3 orders for each customer
WITH customer_orders AS (
  INSERT INTO orders (
    id,
    customer_id,
    restaurant_id,
    status,
    payment_status,
    total_amount,
    created_at,
    updated_at
  )
  SELECT 
    uuid_generate_v4(),
    c.id,
    (SELECT id FROM restaurants ORDER BY RANDOM() LIMIT 1),
    (ARRAY['pending', 'processing', 'completed', 'cancelled'])[floor(random() * 4 + 1)],
    (ARRAY['pending', 'paid', 'refunded'])[floor(random() * 3 + 1)],
    0.00,
    NOW() - (random() * interval '30 days'),
    NOW() - (random() * interval '30 days')
  FROM customers c
  CROSS JOIN generate_series(1, 3) -- Generate 3 orders per customer
  RETURNING id, created_at
),
-- Insert order items and return the order IDs with their totals
order_items_inserted AS (
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
  FROM customer_orders o
  CROSS JOIN LATERAL (
    SELECT id, price 
    FROM menu_items 
    ORDER BY RANDOM() 
    LIMIT floor(random() * 4 + 1)
  ) mi
  RETURNING order_id, subtotal
)
-- Update order totals
UPDATE orders o
SET total_amount = (
  SELECT COALESCE(SUM(subtotal), 0)
  FROM order_items_inserted
  WHERE order_id = o.id
)
WHERE EXISTS (
  SELECT 1 
  FROM customer_orders co 
  WHERE co.id = o.id
);

COMMIT;  -- End transaction