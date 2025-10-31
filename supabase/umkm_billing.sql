-- UMKM KitStudio billing schema for Supabase
-- Transactions and Subscriptions + profiles augmentation

-- 1) transactions table
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  amount integer not null default 0,
  status text not null default 'PENDING', -- PENDING | PAID | EXPIRED
  external_ref text unique,              -- Tripay merchant_ref
  gateway text default 'TRIPAY',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_transactions_user on public.transactions(user_id);

-- Keep status within allowed values
do $$ begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_status_check'
  ) then
    alter table public.transactions
      add constraint transactions_status_check
      check (status in ('PENDING','PAID','EXPIRED'));
  end if;
end $$;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.transactions enable row level security;

-- Policies: allow owner to read/insert; service role bypasses RLS for callbacks
drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own
on public.transactions for select
using (auth.uid() = user_id);

drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own
on public.transactions for insert
with check (auth.uid() = user_id);

-- Allow users to update their own transactions (needed to set external_ref after Tripay create)
drop policy if exists transactions_update_own on public.transactions;
create policy transactions_update_own
on public.transactions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Manual in-app payments support
do $$ begin
  -- Add optional columns if they don't exist
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'method'
  ) then
    alter table public.transactions add column method text default 'MANUAL';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'invoice_ref'
  ) then
    alter table public.transactions add column invoice_ref text unique;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'expires_at'
  ) then
    alter table public.transactions add column expires_at timestamp with time zone;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'proof_url'
  ) then
    alter table public.transactions add column proof_url text;
  end if;
end $$;

-- Extend status to include REVIEW for manual payment verification
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'transactions_status_check') then
    alter table public.transactions drop constraint transactions_status_check;
  end if;
  alter table public.transactions
    add constraint transactions_status_check
    check (status in ('PENDING','REVIEW','PAID','EXPIRED'));
end $$;

-- 2) subscriptions table
create table if not exists public.subscriptions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null,
  status text not null default 'active', -- active | pending | expired
  expires_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscriptions_status_check'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_status_check
      check (status in ('active','pending','expired'));
  end if;
end $$;

alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
on public.subscriptions for select
using (auth.uid() = user_id);

-- Inserts/updates are done by service role via webhook; no extra policies required

-- 3) profiles augmentation (if not already present)
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'plan'
  ) then
    alter table public.profiles add column plan text not null default 'Free';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'plan_expires_at'
  ) then
    alter table public.profiles add column plan_expires_at timestamp with time zone;
  end if;
end $$;

-- Optional: align plan values with ('Gratis','Basic','Pro','Enterprise')
-- Handles both enum-typed and text-typed columns safely.
do $$
declare
  typname text;
  is_enum boolean := false;
begin
  select t.typname, (t.typtype = 'e') as is_enum
    into typname, is_enum
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid and c.relname = 'profiles'
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
  join pg_type t on t.oid = a.atttypid
  where a.attname = 'plan' and a.attnum > 0 and not a.attisdropped
  limit 1;

  if is_enum then
    -- If enum type exists, ensure default is canonical 'Free' and migrate any non-canonical values back
    -- (We may have previously added 'Gratis'/'Enterprise' labels; they can remain on the type but we won't use them.)
    execute format('alter table public.profiles alter column plan set default %L::%I', 'Free', typname);

    -- Migrate any rows with non-canonical values back to canonical names
    -- If these values don't exist in the enum, the update will be a no-op
    begin
      execute format('update public.profiles set plan = %L::%I where plan::text = %L', 'Free', typname, 'Gratis');
    exception when others then null; end;
    begin
      execute format('update public.profiles set plan = %L::%I where plan::text = %L', 'Business', typname, 'Enterprise');
    exception when others then null; end;
  else
    -- If text type, we can enforce a CHECK constraint and migrate values
    if exists (select 1 from pg_constraint where conname = 'profiles_plan_check') then
      execute 'alter table public.profiles drop constraint profiles_plan_check';
    end if;
    alter table public.profiles
      add constraint profiles_plan_check
      check (plan in ('Free','Basic','Pro','Business'));

    update public.profiles set plan = 'Free' where plan = 'Gratis';
    update public.profiles set plan = 'Business' where plan = 'Enterprise';
  end if;
end $$;

-- Keep subscriptions consistent with new vocabulary
update public.subscriptions set plan_name = 'Free' where plan_name = 'Gratis';
update public.subscriptions set plan_name = 'Business' where plan_name = 'Enterprise';

-- Also normalize any transactions plan values to canonical names
update public.transactions set plan = 'Free' where plan = 'Gratis';
update public.transactions set plan = 'Business' where plan = 'Enterprise';
