-- Erweiterung fuer das neue Design: Emoji-Icon und Kategorie pro Gruppe.
-- Im Supabase Dashboard unter "SQL Editor" einmal ausfuehren (nach schema.sql).

alter table groups add column emoji text not null default '⭐';
alter table groups add column category text not null default 'other'
  check (category in ('food', 'cafe', 'bar', 'streetfood', 'other'));
