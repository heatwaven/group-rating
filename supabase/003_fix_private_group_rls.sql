-- Bugfix: Erstellen einer PRIVATEN Gruppe schlug mit
-- "new row violates row-level security policy for table groups" fehl.
--
-- Ursache: new.tsx macht .insert(...).select('id').single(). Bei RETURNING
-- prueft Postgres die SELECT-Policy der Tabelle. Die alte "groups read"-Policy
-- erlaubte nur is_public oder is_member(id) -- is_member(id) wird aber erst durch
-- den AFTER-INSERT-Trigger handle_new_group() wahr, dessen Sichtbarkeit fuer die
-- RETURNING-Pruefung nicht garantiert ist. Bei oeffentlichen Gruppen griff is_public
-- sofort, bei privaten Gruppen schlug der RETURNING-Select fehl.
--
-- Fix: Der Owner darf seine eigene Gruppe immer lesen, unabhaengig vom Mitglieds-Trigger.
--
-- Im Supabase Dashboard unter "SQL Editor" einmal ausfuehren (nach 002_emoji_category.sql).

drop policy "groups read" on groups;
create policy "groups read" on groups for select to authenticated
  using (is_public or owner_id = auth.uid() or is_member(id));
