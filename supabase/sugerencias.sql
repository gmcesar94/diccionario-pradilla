-- Propuestas de palabras desde la página «Colabora».
-- Pegar en Supabase → SQL Editor → Run. Se puede ejecutar varias veces.

create table if not exists public.sugerencias (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  palabra text not null check (char_length(palabra) between 1 and 80),
  definicion text not null check (char_length(definicion) between 1 and 1000),
  categoria_gramatical text check (char_length(categoria_gramatical) <= 30),
  ejemplo text check (char_length(ejemplo) <= 500),
  nombre text check (char_length(nombre) <= 80),
  contacto text check (char_length(contacto) <= 120),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aceptada', 'descartada'))
);

-- Sin políticas públicas: solo el servidor (clave secreta) puede leer y escribir.
alter table public.sugerencias enable row level security;
