-- EasyCV Laos — ຕິດຕັ້ງ Supabase (ວາງທັງໝົດໃນ SQL Editor ແລ້ວກົດ Run; ແລ່ນຊ້ຳໄດ້)

-- 1) ລາຍຊື່ Admin
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
drop policy if exists "admin reads self" on public.admins;
create policy "admin reads self" on public.admins for select using (auth.uid() = user_id);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- 2) ຕາຕະລາງແບບ CV
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  image_path text not null,
  layout text not null default 'l1' check (layout in ('l1','l2','l3')),
  color text not null default '#2563eb',
  fg text not null default '#222222',
  pad jsonb not null default '[40,40,40,40]',
  sw int not null default 230,
  photo jsonb not null default '{"mode":"inline"}',
  premium boolean not null default false,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.templates enable row level security;

drop policy if exists "read published" on public.templates;
drop policy if exists "admin insert" on public.templates;
drop policy if exists "admin update" on public.templates;
drop policy if exists "admin delete" on public.templates;
create policy "read published" on public.templates for select using (published or public.is_admin());
create policy "admin insert" on public.templates for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.templates for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.templates for delete to authenticated using (public.is_admin());

-- 3) ບ່ອນເກັບຮູບ (public ສຳລັບອ່ານ, ສະເພາະ Admin ຂຽນໄດ້)
insert into storage.buckets (id, name, public) values ('designs', 'designs', true)
on conflict (id) do update set public = true;

drop policy if exists "designs admin insert" on storage.objects;
drop policy if exists "designs admin update" on storage.objects;
drop policy if exists "designs admin delete" on storage.objects;
create policy "designs admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'designs' and public.is_admin());
create policy "designs admin update" on storage.objects for update to authenticated
  using (bucket_id = 'designs' and public.is_admin());
create policy "designs admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'designs' and public.is_admin());

-- 4) ຕັ້ງ Admin: ສ້າງຜູ້ໃຊ້ໃນ Authentication → Users ກ່ອນ ແລ້ວແກ້ອີເມວລຸ່ມນີ້ ແລະ Run ແຍກຕ່າງຫາກ
-- insert into public.admins (user_id) select id from auth.users where email = 'jonepms16@gmail.com';
