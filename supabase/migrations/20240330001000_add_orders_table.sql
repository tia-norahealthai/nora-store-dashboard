-- Create orders table and establish relationship with restaurants
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Add other order fields as needed
);

-- Create index for better query performance
create index orders_restaurant_id_idx on orders(restaurant_id); 