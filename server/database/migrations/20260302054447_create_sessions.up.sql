create table if not exists sessions (
  session_id integer primary key,
  user_id int not null references users (user_id) on delete cascade,
  refresh_token blob not null check (length(refresh_token) = 36),
  created_at integer not null default (unixepoch()),
  updated_at integer not null default (unixepoch())
);

create unique index if not exists session_refresh_token_idx on sessions (refresh_token);

create trigger update_sessions_updated_at
after update on sessions
for each row
begin
  update sessions
  set updated_at = unixepoch()
  where session_id = new.session_id;
end;
