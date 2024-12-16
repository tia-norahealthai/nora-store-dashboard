-- Add policies for restaurants table
create policy "Users can view restaurants they are associated with"
  on restaurants for select
  using (
    exists (
      select 1 
      from restaurant_users
      where restaurant_users.restaurant_id = restaurants.id
      and restaurant_users.user_id = auth.uid()
    )
  );

create policy "Super admins can view all restaurants"
  on restaurants for select
  using (
    exists (
      select 1 
      from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'super_admin'
    )
  );

create policy "Users can insert restaurants if they are business owners"
  on restaurants for insert
  with check (
    exists (
      select 1 
      from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name in ('business_owner', 'super_admin')
    )
  );

create policy "Users can update their own restaurants"
  on restaurants for update
  using (
    exists (
      select 1 
      from restaurant_users
      where restaurant_users.restaurant_id = restaurants.id
      and restaurant_users.user_id = auth.uid()
    )
  ); 