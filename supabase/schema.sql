-- Im Supabase Dashboard unter "SQL Editor" einmal komplett ausfuehren.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_public boolean not null default false,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  owner_id uuid not null references profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table group_members (
  group_id uuid references groups on delete cascade,
  user_id uuid references profiles on delete cascade default auth.uid(),
  role text not null default 'member' check (role in ('owner','member')),
  primary key (group_id, user_id)
);

create table items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups on delete cascade,
  name text not null,
  created_by uuid not null references profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items on delete cascade,
  user_id uuid not null references profiles(id) default auth.uid(),
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (item_id, user_id)
);

-- Profil automatisch bei Registrierung anlegen
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Ersteller wird automatisch Owner-Mitglied
create function handle_new_group() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into group_members (group_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end $$;
create trigger on_group_created after insert on groups
  for each row execute function handle_new_group();

-- Hilfsfunktionen (security definer, damit RLS keine Rekursion erzeugt)
create function is_member(g uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from group_members where group_id = g and user_id = auth.uid());
$$;
create function is_public_group(g uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from groups where id = g and is_public);
$$;

-- Private Gruppe per Einladungscode beitreten
create function join_group_by_code(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  select id into gid from groups where invite_code = code;
  if gid is null then raise exception 'Ungueltiger Einladungscode'; end if;
  insert into group_members (group_id, user_id) values (gid, auth.uid()) on conflict do nothing;
  return gid;
end $$;

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table items enable row level security;
alter table ratings enable row level security;

-- Profile: alle angemeldeten Nutzer sehen Namen, nur man selbst aendert
create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles update own" on profiles for update to authenticated using (id = auth.uid());

-- Gruppen: oeffentliche fuer alle sichtbar, private nur fuer Mitglieder
create policy "groups read" on groups for select to authenticated using (is_public or is_member(id));
create policy "groups create" on groups for insert to authenticated with check (owner_id = auth.uid());
create policy "groups update owner" on groups for update to authenticated using (owner_id = auth.uid());
create policy "groups delete owner" on groups for delete to authenticated using (owner_id = auth.uid());

-- Mitglieder: oeffentlich selbst beitreten, jederzeit austreten
create policy "members read" on group_members for select to authenticated
  using (is_member(group_id) or is_public_group(group_id));
create policy "members join public" on group_members for insert to authenticated
  with check (user_id = auth.uid() and role = 'member' and is_public_group(group_id));
create policy "members leave" on group_members for delete to authenticated using (user_id = auth.uid());

-- Eintraege (z.B. Pizzerien): lesen wie Gruppe, hinzufuegen nur Mitglieder
create policy "items read" on items for select to authenticated
  using (is_member(group_id) or is_public_group(group_id));
create policy "items insert" on items for insert to authenticated
  with check (created_by = auth.uid() and is_member(group_id));
create policy "items delete own" on items for delete to authenticated using (created_by = auth.uid());

-- Bewertungen: lesen wie Gruppe, bewerten nur Mitglieder, nur eigene aendern
create policy "ratings read" on ratings for select to authenticated using (
  exists (select 1 from items i where i.id = item_id and (is_member(i.group_id) or is_public_group(i.group_id))));
create policy "ratings insert" on ratings for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from items i where i.id = item_id and is_member(i.group_id)));
create policy "ratings update own" on ratings for update to authenticated using (user_id = auth.uid());
create policy "ratings delete own" on ratings for delete to authenticated using (user_id = auth.uid());
