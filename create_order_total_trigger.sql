-- Create or replace the function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(oi.quantity * mi.price), 0)
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_order_total_insert ON order_items;
DROP TRIGGER IF EXISTS update_order_total_update ON order_items;
DROP TRIGGER IF EXISTS update_order_total_delete ON order_items;

-- Create triggers to update order total when items are modified
CREATE TRIGGER update_order_total_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

CREATE TRIGGER update_order_total_update
    AFTER UPDATE OF quantity ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total();

CREATE TRIGGER update_order_total_delete
    AFTER DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_total(); 