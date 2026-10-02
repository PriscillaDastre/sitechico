-- Rode UMA vez: Supabase → SQL Editor → New query → colar tudo → Run.

-- 1) Tabela com os dados editados pelo corretor
create table if not exists public.site_state (
  id int primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_state (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;
alter table public.site_state enable row level security;

drop policy if exists "leitura publica" on public.site_state;
drop policy if exists "corretor grava" on public.site_state;
drop policy if exists "corretor atualiza" on public.site_state;
create policy "leitura publica" on public.site_state for select to anon, authenticated using (true);
create policy "corretor grava" on public.site_state for insert to authenticated with check (true);
create policy "corretor atualiza" on public.site_state for update to authenticated using (true) with check (true);

-- 2) Pasta pública de fotos (só quem está logado envia/apaga)
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) on conflict (id) do nothing;

drop policy if exists "fotos envio" on storage.objects;
drop policy if exists "fotos edicao" on storage.objects;
drop policy if exists "fotos exclusao" on storage.objects;
create policy "fotos envio" on storage.objects for insert to authenticated with check (bucket_id = 'fotos');
create policy "fotos edicao" on storage.objects for update to authenticated using (bucket_id = 'fotos');
create policy "fotos exclusao" on storage.objects for delete to authenticated using (bucket_id = 'fotos');
