-- IApoyo Consultora — Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  email text,
  nombre text,
  cuit text,
  condicion_fiscal text default 'monotributista',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Negocio mensual
create table negocio_mensual (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  anio int not null,
  mes int not null check (mes between 1 and 12),
  facturacion numeric default 0,
  compras numeric default 0,
  gastos numeric default 0,
  sueldos_cs numeric default 0,
  acreditaciones numeric default 0,
  created_at timestamptz default now(),
  unique(user_id, anio, mes)
);
alter table negocio_mensual enable row level security;
create policy "Users manage own negocio" on negocio_mensual for all using (auth.uid() = user_id);

-- Cheques
create table cheques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nro text,
  banco text,
  importe numeric default 0,
  fecha_pago date,
  beneficiario text,
  concepto text,
  estado text default 'pendiente' check (estado in ('cobrado','pendiente','vencido')),
  created_at timestamptz default now()
);
alter table cheques enable row level security;
create policy "Users manage own cheques" on cheques for all using (auth.uid() = user_id);

-- Acreditaciones bancarias
create table acreditaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  anio int not null,
  mes int not null check (mes between 1 and 12),
  banco text,
  imp_creditos numeric default 0,
  prestamos numeric default 0,
  transferencias numeric default 0,
  otras numeric default 0,
  total_acred numeric default 0,
  facturacion numeric default 0,
  created_at timestamptz default now(),
  unique(user_id, anio, mes)
);
alter table acreditaciones enable row level security;
create policy "Users manage own acreditaciones" on acreditaciones for all using (auth.uid() = user_id);

-- Categoria fiscal
create table categoria_fiscal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  cuit text,
  condicion text default 'monotributista',
  categoria text default 'A',
  actividad_principal text,
  actividad_secundaria text,
  updated_at timestamptz default now()
);
alter table categoria_fiscal enable row level security;
create policy "Users manage own fiscal" on categoria_fiscal for all using (auth.uid() = user_id);

-- Base de conocimiento (sin RLS — acceso público para lectura)
create table kb_temas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  orden int default 0,
  created_at timestamptz default now()
);

create table kb_nodos (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid references kb_temas on delete cascade,
  pregunta text,
  respuesta text,
  palabras_clave text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Consultas recibidas
create table consultas (
  id uuid primary key default gen_random_uuid(),
  tipo text,
  nombre text,
  email text,
  telefono text,
  datos_json jsonb,
  created_at timestamptz default now()
);
