-- Insert order items for existing orders
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
    mi.price * floor(random() * 3 + 1)::int as subtotal, -- Calculate subtotal based on quantity
    o.created_at,
    o.created_at
FROM orders o
CROSS JOIN LATERAL (
    SELECT id, price 
    FROM menu_items 
    ORDER BY RANDOM() 
    LIMIT floor(random() * 4 + 1) -- Random number of items 1-4 per order
) mi
WHERE NOT EXISTS (
    SELECT 1 
    FROM order_items oi 
    WHERE oi.order_id = o.id
); -- Only for orders that don't have items yet

-- Update order totals
UPDATE orders o
SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM order_items
    WHERE order_id = o.id
); 