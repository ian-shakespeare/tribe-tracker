create table if not exists users (
  user_id integer primary key,
  user_uuid blob not null check (length(user_uuid) = 36),
  email varchar(255) unique not null check (length(email) >= 5),
  password_digest varchar(255) not null,
  first_name varchar(64) not null,
  last_name varchar(64) not null,
  avatar varchar(255),
  created_at integer not null default (unixepoch()),
  updated_at integer not null default (unixepoch()),
  is_deleted boolean not null default false
);

create unique index if not exists user_uuid_idx on users (user_uuid);
create unique index if not exists user_email_idx on users (email);

create trigger update_users_updated_at
after update on users
for each row
begin
  update users
  set updated_at = unixepoch()
  where user_id = new.user_id;
end;
