-- Erweiterung: Profilbild-Upload + Gruppeneinstellungen
-- (Einladungslink teilen an/aus, maximale Mitgliederanzahl).
--
-- Im Supabase Dashboard unter "SQL Editor" einmal ausfuehren (nach 003_fix_private_group_rls.sql).

alter table profiles add column avatar_url text;

alter table groups add column allow_member_invite boolean not null default true;
alter table groups add column max_members int;
-- max_members = NULL bedeutet unbegrenzt.
alter table groups add constraint max_members_positive check (max_members is null or max_members > 0);

-- Prueft, ob eine Gruppe ihr Mitgliederlimit erreicht hat (NULL-Limit = nie voll).
create function is_group_full(g uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from groups gr
    where gr.id = g and gr.max_members is not null
      and (select count(*) from group_members m where m.group_id = g) >= gr.max_members
  );
$$;

-- Oeffentlichem Beitritt zusaetzlich das Limit vorschreiben.
drop policy "members join public" on group_members;
create policy "members join public" on group_members for insert to authenticated
  with check (user_id = auth.uid() and role = 'member' and is_public_group(group_id) and not is_group_full(group_id));

-- Beitritt per Einladungscode: ebenfalls das Limit beachten.
create or replace function join_group_by_code(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  select id into gid from groups where invite_code = code;
  if gid is null then raise exception 'Ungueltiger Einladungscode'; end if;
  if is_group_full(gid) then raise exception 'Diese Gruppe hat ihre maximale Mitgliederanzahl erreicht'; end if;
  insert into group_members (group_id, user_id) values (gid, auth.uid()) on conflict do nothing;
  return gid;
end $$;

-- Storage-Bucket fuer Profilbilder (oeffentlich lesbar, jeder Nutzer verwaltet nur seinen eigenen Ordner).
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "users upload own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users update own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
