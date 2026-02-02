-- Migration for products table for KITARA app
-- This migration creates a products table that allows
-- administrators to manage a catalogue of items for sale. Each
-- product has a name, description, price and timestamps. A
-- reference to the creator's profile is also stored.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id)
);

-- Enable row level security on the products table. By default
-- nobody can access the table until policies are defined.
alter table public.products enable row level security;

-- Allow anyone to read products (clients and admins). This
-- ensures that the catalogue is visible to all authenticated
-- users.
create policy "Allow read for all" on public.products
  for select using (true);

-- Allow admins to insert, update and delete products. This
-- policy checks the user_roles table to ensure that the
-- authenticated user has an admin role before permitting
-- modification of product records.
create policy "Admins can manage products" on public.products
  for all using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );
