create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  whatsapp text,
  sector text,
  created_at timestamptz not null default now()
);

create table if not exists staff_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  district text,
  neighborhood text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  source text not null default 'website',
  subject text not null,
  description text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  device_type text not null,
  brand text,
  model text,
  serial_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  request_id uuid references requests(id) on delete set null,
  device_id uuid references devices(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open',
  price numeric not null default 0,
  warranty_until date,
  technician_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  appointment_at timestamptz not null,
  status text not null default 'scheduled',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists ai_contents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  content_type text not null,
  topic text not null,
  output text not null,
  channel text,
  created_at timestamptz not null default now()
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  channel text not null,
  title text,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists report_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  file_name text not null,
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists customers_company_idx on customers(company_id, created_at desc);
create index if not exists requests_company_idx on requests(company_id, created_at desc);
create index if not exists jobs_company_idx on jobs(company_id, created_at desc);
create index if not exists appointments_company_idx on appointments(company_id, appointment_at);
create index if not exists ai_contents_company_idx on ai_contents(company_id, created_at desc);

alter table companies enable row level security;
alter table staff_users enable row level security;
alter table customers enable row level security;
alter table requests enable row level security;
alter table devices enable row level security;
alter table jobs enable row level security;
alter table appointments enable row level security;
alter table ai_contents enable row level security;
alter table message_templates enable row level security;
alter table report_files enable row level security;

drop policy if exists "public can create website requests" on requests;
drop policy if exists "service role manages companies" on companies;
drop policy if exists "service role manages staff" on staff_users;
drop policy if exists "service role manages customers" on customers;
drop policy if exists "service role manages requests" on requests;
drop policy if exists "service role manages devices" on devices;
drop policy if exists "service role manages jobs" on jobs;
drop policy if exists "service role manages appointments" on appointments;
drop policy if exists "service role manages ai contents" on ai_contents;
drop policy if exists "service role manages templates" on message_templates;
drop policy if exists "service role manages reports" on report_files;

create policy "service role manages companies" on companies for all to service_role using (true) with check (true);
create policy "service role manages staff" on staff_users for all to service_role using (true) with check (true);
create policy "service role manages customers" on customers for all to service_role using (true) with check (true);
create policy "service role manages requests" on requests for all to service_role using (true) with check (true);
create policy "service role manages devices" on devices for all to service_role using (true) with check (true);
create policy "service role manages jobs" on jobs for all to service_role using (true) with check (true);
create policy "service role manages appointments" on appointments for all to service_role using (true) with check (true);
create policy "service role manages ai contents" on ai_contents for all to service_role using (true) with check (true);
create policy "service role manages templates" on message_templates for all to service_role using (true) with check (true);
create policy "service role manages reports" on report_files for all to service_role using (true) with check (true);

insert into companies (name, slug, phone, whatsapp, sector)
values ('Denizli Beyaz Eşya Servisi', 'denizli-beyaz-esya-servisi', '0532 639 78 98', '905326397898', 'Beyaz eşya ve klima servisi')
on conflict (slug) do update set
  name = excluded.name,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  sector = excluded.sector;
