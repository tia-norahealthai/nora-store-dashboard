export const CONTEXTUAL_QUERIES = {
  "": [ // Dashboard queries
    "What's our current revenue?",
    "How many active users do we have?",
    "What's our conversion rate?",
    "How many pending orders are there?",
    "What's our total number of orders?"
  ],
  "menu": [
    "How many menu items do we have?",
    "What categories of food do we offer?",
    "Show me all available items",
    "Which items are currently out of stock?",
    "List items by category",
    "Create a new menu item with name: 'Margherita Pizza', price: 12.99, category: 'Pizza', description: 'Classic Italian pizza with tomatoes and mozzarella'",
    "Add a new dish to the menu",
    "How do I add a new menu item?",
    "Update menu item with id: '123' to:\n- name: 'Supreme Pizza'\n- price: 15.99",
    "Delete menu item with id: '123'",
    "How do I update a menu item?",
    "How do I delete a menu item?"
  ],
  "menu/[id]": [
    "What are the allergens in this dish?",
    "What's the nutritional information?",
    "Is this dish available?",
    "What's the price of this item?",
    "What dietary restrictions does this item meet?"
  ],
  "customers": [
    "How many total customers do we have?",
    "How many active customers are there?",
    "Show me customer statistics",
    "What's our customer retention rate?"
  ],
  "orders": [
    "How many pending orders are there?",
    "What's our total order count?",
    "Show me today's order summary",
    "List orders by status"
  ],
  "orders/[id]": [
    "What's the order status?",
    "What items are in this order?",
    "What's the total order amount?",
    "When was this order placed?",
    "Show me the delivery details"
  ]
} as const 