-- Create trigger function if it doesn't exist
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create restaurant_users table
create table restaurant_users (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(restaurant_id, user_id)
);

-- Add RLS policies
alter table restaurant_users enable row level security;

create policy "Users can view their own restaurant associations"
  on restaurant_users for select
  using (auth.uid() = user_id);

create policy "Super admins can view all restaurant associations"
  on restaurant_users for select
  using (
    exists (
      select 1 
      from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'super_admin'
    )
  );

-- Add trigger for updated_at
create trigger set_timestamp
  before update on restaurant_users
  for each row
  execute procedure trigger_set_timestamp();

-- Index for faster lookups
create index restaurant_users_user_id_idx on restaurant_users(user_id);
create index restaurant_users_restaurant_id_idx on restaurant_users(restaurant_id); 