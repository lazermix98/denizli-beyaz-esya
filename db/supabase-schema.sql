create extension if not exists pgcrypto;

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  district text not null,
  neighborhood text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  device_type text not null,
  brand text not null,
  model text,
  serial_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists service_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  device_id uuid references devices(id) on delete set null,
  service_type text not null,
  problem_summary text not null,
  status text not null default 'new',
  appointment_at timestamptz,
  technician_notes text,
  operation_summary text,
  warranty_until date,
  report_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references service_records(id) on delete cascade,
  technician_name text,
  appointment_at timestamptz not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table if not exists used_parts (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references service_records(id) on delete cascade,
  part_name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  warranty_months integer not null default 6,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references service_records(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'TRY',
  method text not null default 'cash',
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ai_content_items (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  topic text not null,
  output text not null,
  channel text,
  planned_for date,
  created_at timestamptz not null default now()
);

create table if not exists service_report_files (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid references service_records(id) on delete set null,
  file_name text not null,
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists customers_phone_idx on customers(phone);
create index if not exists service_records_status_idx on service_records(status);
create index if not exists appointments_at_idx on appointments(appointment_at);
create index if not exists ai_content_created_idx on ai_content_items(created_at desc);
