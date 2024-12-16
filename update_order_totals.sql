-- Update total_amount for all orders based on their order items
UPDATE orders o
SET total_amount = (
  SELECT COALESCE(SUM(oi.quantity * mi.price), 0)
  FROM order_items oi
  JOIN menu_items mi ON oi.menu_item_id = mi.id
  WHERE oi.order_id = o.id
); 