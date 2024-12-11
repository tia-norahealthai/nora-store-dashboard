-- Insert 20 sample orders
WITH sample_orders AS (
    INSERT INTO orders (
        id,
        customer_id,
        status,
        payment_status,
        total_amount,
        created_at,
        updated_at
    )
    SELECT 
        uuid_generate_v4(),
        (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1), -- Assumes you have customers table
        (ARRAY['pending', 'processing', 'completed', 'cancelled'])[floor(random() * 4 + 1)],
        (ARRAY['pending', 'paid', 'refunded'])[floor(random() * 3 + 1)],
        0.00,
        NOW() - (random() * interval '30 days'), -- Random date within last 30 days
        NOW() - (random() * interval '30 days')
    FROM generate_series(1, 20)
    RETURNING id, created_at
)
-- Insert 1-4 order items for each order
INSERT INTO order_items (
    order_id,
    menu_item_id,
    quantity,
    unit_price,
    subtotal,
    created_at,
    updated_at
)
SELECT 
    o.id as order_id,
    mi.id as menu_item_id,
    floor(random() * 3 + 1)::int as quantity, -- Random quantity 1-3
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
    FROM sample_orders so 
    WHERE so.id = o.id
); 