-- ====================================================================
-- SUPABASE SCHEMA FOR AI/SOFTWARE SUBSCRIPTION EXPENSE TRACKER
-- Copy and run this script in your Supabase SQL Editor
-- ====================================================================

-- 1. Create a profiles table for users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  full_name text not null,
  avatar_url text
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Setup RLS Policies for profiles
create policy "Allow public read access to profiles" 
  on public.profiles for select 
  using (true);

create policy "Allow users to update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario Nuevo'), 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create subscriptions table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text not null,
  cost numeric(10, 2) not null check (cost >= 0),
  currency varchar(5) default 'USD' not null,
  billing_cycle varchar(15) not null check (billing_cycle in ('monthly', 'yearly', 'weekly', 'one-time')),
  status varchar(15) default 'active' not null check (status in ('active', 'paused', 'cancelled')),
  next_billing_date date,
  started_at date default current_date,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexing for optimized filtering
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_category on public.subscriptions(category);

-- Enable Row Level Security (RLS) on subscriptions
alter table public.subscriptions enable row level security;

-- Setup RLS Policies for subscriptions
create policy "Allow users to view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Allow users to insert their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Allow users to update their own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Allow users to delete their own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);
