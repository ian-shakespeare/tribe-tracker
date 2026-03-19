create table if not exists families (
  family_id integer primary key,
  family_uuid blob not null check (length(family_uuid) = 36),
  name varchar(64) not null check (length(name) >= 2),
  created_by int references users (user_id) on delete set null,
  created_at integer not null default (unixepoch()),
  updated_at integer not null default (unixepoch()),
  is_deleted boolean not null default false
);

create unique index if not exists family_uuid_idx on families (family_uuid);

create trigger update_families_updated_at
after update on families
for each row
begin
  update families
  set updated_at = unixepoch()
  where family_id = new.family_id;
end;
