create table if not exists locations (
  location_id integer primary key,
  location_uuid blob not null check (length(location_uuid) = 36),
  user_id int not null references users (user_id) on delete cascade,
  lat real not null,
  lon real not null,
  created_at integer not null default (unixepoch())
);

create unique index if not exists location_uuid_idx on locations (location_uuid);
create index if not exists location_user_id_idx on locations (user_id);
