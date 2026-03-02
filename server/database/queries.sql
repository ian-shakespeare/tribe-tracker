-- name: CreateUser :one
insert into users (email, password_digest, first_name, last_name)
values ($1, $2, $3, $4)
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
insert into sessions (user_id)
select user_id
from users
where user_uuid = $1
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
where s.refresh_token = $1;

-- name: RefreshSession :one
update sessions
set refresh_token = gen_random_uuid()
where refresh_token = $1
returning refresh_token,
  created_at,
  updated_at;
