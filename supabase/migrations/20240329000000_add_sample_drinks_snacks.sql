-- Add sample drinks
INSERT INTO menu_items (name, description, price, type, allergens) VALUES
('Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 'Drink', '{}'),
('Green Smoothie', 'Spinach, apple, and banana smoothie', 5.99, 'Drink', '{}'),
('Sparkling Water', 'Carbonated mineral water', 2.99, 'Drink', '{}'),
('Iced Coffee', 'Cold brewed coffee with ice', 3.99, 'Drink', '{}'),
('Herbal Tea', 'Assorted herbal tea selection', 2.99, 'Drink', '{}');

-- Add sample snacks
INSERT INTO menu_items (name, description, price, type, allergens) VALUES
('Mixed Nuts', 'Assorted premium nuts', 4.99, 'Snack', ARRAY['nuts']),
('Fresh Fruit Bowl', 'Seasonal fresh fruits', 5.99, 'Snack', '{}'),
('Yogurt Parfait', 'Greek yogurt with granola and berries', 4.99, 'Snack', ARRAY['dairy']),
('Energy Bar', 'Homemade granola bar', 3.99, 'Snack', ARRAY['nuts']),
('Veggie Sticks', 'Fresh cut vegetables with hummus', 4.99, 'Snack', '{}'); 