-- SocialsFlip Supabase-ready schema
-- Use this SQL in Supabase SQL editor when migrating from the local JSON store.

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.listing_status as enum ('pending', 'approved', 'draft', 'rejected');
create type public.deal_status as enum (
  'awaiting_payment',
  'funds_held',
  'credentials_shared',
  'completed',
  'disputed',
  'cancelled',
  'refunded'
);
create type public.message_role as enum ('buyer', 'seller', 'admin');
create type public.app_status as enum ('new', 'approved', 'rejected');
create type public.private_req_status as enum ('requested', 'approved', 'denied');

create table public.users (
  id bigint generated always as identity primary key,
  email text unique not null,
  password_hash text not null,
  name text not null,
  role public.user_role not null default 'buyer',
  country text default '',
  bio text default '',
  phone text default '',
  verified boolean not null default false,
  rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  dummy boolean not null default false,
  official boolean not null default false,
  joined_at timestamptz not null default now(),
  active boolean not null default true
);

create table public.seller_applications (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text default '',
  country text default '',
  about text default '',
  title text not null,
  cat text not null,
  price numeric(12,2) not null,
  description text default '',
  status public.app_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.listings (
  id bigint generated always as identity primary key,
  seller_id bigint not null references public.users(id) on delete cascade,
  title text not null,
  cat text not null,
  niche text default '',
  followers text default '',
  monetized boolean not null default false,
  teaser text default '',
  private_handle text not null default '',
  price numeric(12,2) not null,
  description text default '',
  img text default '',
  status public.listing_status not null default 'pending',
  listed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orders (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id),
  seller_id bigint not null references public.users(id),
  buyer_id bigint references public.users(id),
  buyer_email text not null,
  buyer_name text default '',
  title text not null,
  transfer_details text default '',
  coin text default 'USDT (TRC20)',
  price numeric(12,2) not null,
  fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  status public.deal_status not null default 'awaiting_payment',
  handle_revealed boolean not null default false,
  private_request_status text not null default 'none',
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  from_role public.message_role not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.private_requests (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  buyer_email text not null,
  buyer_name text default '',
  status public.private_req_status not null default 'requested',
  created_at timestamptz not null default now()
);

create table public.reviews (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id),
  listing_id bigint not null references public.listings(id),
  seller_id bigint not null references public.users(id),
  stars int not null check (stars between 1 and 5),
  body text not null,
  who text not null,
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null
);

insert into public.settings (key, value) values
  ('escrow_fee_percent', '10'),
  ('allow_direct_pay_to_seller', 'false'),
  ('crypto_wallets', '[
    {"asset":"USDT_TRC20","network":"Tron","label":"USDT (TRC20)","address":"TLj1Esv4stWJNcimvXZDXkP5W9FZfQVpx7","enabled":true},
    {"asset":"USDT_BEP20","network":"BNB Smart Chain","label":"USDT (BEP20)","address":"0x97ff787aa462141bc27660BFDB8b96728B3e0209","enabled":true}
  ]');
