create table if not exists users (
  user_id integer primary key,
  user_uuid blob not null check (length(user_uuid) = 36),
  email text unique not null check (5 <= length(email) and length(email) <= 255),
  password_digest text not null check (length(password_digest) <= 255),
  first_name text not null check (length(first_name) <= 64),
  last_name text not null check (length(last_name) <= 64),
  avatar text check (length(avatar) <= 255),
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
