-- Ajustes para el Diccionario de Pradilla.
-- Pegar en Supabase → SQL Editor → Run. Se puede ejecutar varias veces.

-- 1. Ejemplos de uso en cada acepción
alter table public.acepciones add column if not exists ejemplo text;

-- 2. El slug identifica cada palabra (lo necesita el importador)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.palabras'::regclass and contype = 'u'
      and conkey = array[(select attnum from pg_attribute
                          where attrelid = 'public.palabras'::regclass and attname = 'slug')]
  ) then
    alter table public.palabras add constraint palabras_slug_key unique (slug);
  end if;
end $$;

-- 3. Al borrar una palabra se borran sus acepciones
do $$
declare
  fk record;
begin
  select conname, confdeltype into fk
  from pg_constraint
  where conrelid = 'public.acepciones'::regclass and contype = 'f'
    and confrelid = 'public.palabras'::regclass;

  if fk.conname is null then
    alter table public.acepciones
      add constraint acepciones_palabra_id_fkey
      foreign key (palabra_id) references public.palabras(id) on delete cascade;
  elsif fk.confdeltype <> 'c' then
    execute format('alter table public.acepciones drop constraint %I', fk.conname);
    alter table public.acepciones
      add constraint acepciones_palabra_id_fkey
      foreign key (palabra_id) references public.palabras(id) on delete cascade;
  end if;
end $$;

create index if not exists acepciones_palabra_id_idx on public.acepciones (palabra_id);

-- 4. Lectura pública (la web usa la clave publishable)
alter table public.palabras enable row level security;
alter table public.acepciones enable row level security;

drop policy if exists "Lectura pública de palabras" on public.palabras;
create policy "Lectura pública de palabras" on public.palabras
  for select to anon, authenticated using (true);

drop policy if exists "Lectura pública de acepciones" on public.acepciones;
create policy "Lectura pública de acepciones" on public.acepciones
  for select to anon, authenticated using (true);
