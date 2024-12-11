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
    "List items by category"
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