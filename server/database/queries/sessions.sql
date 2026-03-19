-- name: CreateSession :one
insert into sessions (user_id, refresh_token, expires_at)
select user_id, ?, ?
from users
where user_uuid = ?
returning refresh_token,
  created_at,
  updated_at;

-- name: GetSessionUser :one
select u.user_uuid,
  u.email,
  u.first_name,
  u.last_name,
  u.avatar,
  u.created_at,
  u.updated_at
from sessions s
join users u
  on s.user_id = u.user_id
where s.refresh_token = ?
  and s.expires_at > unixepoch();

-- name: RefreshSession :one
update sessions
set refresh_token = sqlc.arg(new_refresh_token),
  expires_at = sqlc.arg(expires_at)
where refresh_token = sqlc.arg(refresh_token)
  and expires_at > unixepoch()
returning refresh_token,
  created_at,
  updated_at;
