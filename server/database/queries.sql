-- name: CreateUser :one
insert into users (email, password_digest, first_name, last_name)
values ($1, $2, lower(sqlc.arg(first_name)), lower(sqlc.arg(last_name)))
returning user_uuid,
  email,
  first_name,
  last_name,
  avatar,
  created_at,
  updated_at;

-- name: GetUser :one
select user_uuid,
  email,
  first_name,
  last_name,
  avatar,
  created_at,
  updated_at
from users
where user_uuid = $1;

-- name: GetUserByEmail :one
select user_uuid,
  email,
  first_name,
  last_name,
  avatar,
  created_at,
  updated_at
from users
where email = $1;

-- name: GetUserPasswordDigest :one
select password_digest
from users
where user_uuid = $1;

-- name: CreateSession :one
insert into sessions (user_id, expires_at)
select user_id,
  $1 as expires_at
from users
where user_uuid = $2
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
where s.refresh_token = $1
  and s.expires_at > current_timestamp;

-- name: RefreshSession :one
update sessions
set refresh_token = gen_random_uuid(),
  expires_at = $1
where refresh_token = $2
  and expires_at > current_timestamp
returning refresh_token,
  created_at,
  updated_at;

-- name: CreateFamily :one
with inserted_family as (
  insert into families (name, created_by)
  select lower(sqlc.arg(name)) as name,
    u.user_id as created_by
  from users u
  where u.user_uuid = $1
  returning family_uuid,
    name,
    created_by,
    created_at,
    updated_at
)
select if.family_uuid,
  if.name,
  u.user_uuid,
  if.created_at,
  if.updated_at
from inserted_family if
join users u
  on if.created_by = u.user_id
  and u.is_deleted = false;

-- name: UpdateUser :one
update users
set first_name = coalesce(lower(sqlc.narg(first_name)), first_name),
  last_name = coalesce(lower(sqlc.narg(last_name)), last_name)
where user_uuid = $1
returning user_uuid,
  email,
  first_name,
  last_name,
  avatar,
  created_at,
  updated_at;
