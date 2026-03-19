-- name: CreateUser :one
insert into users (user_uuid, email, password_digest, first_name, last_name)
values (?, ?, ?, lower(sqlc.arg(first_name)), lower(sqlc.arg(last_name)))
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
where user_uuid = ?;

-- name: GetUserByEmail :one
select user_uuid,
  email,
  first_name,
  last_name,
  avatar,
  created_at,
  updated_at
from users
where email = ?;

-- name: GetUserPasswordDigest :one
select password_digest
from users
where user_uuid = ?;

-- name: UpdateUser :one
update users
set first_name = coalesce(lower(sqlc.narg(first_name)), first_name),
  last_name = coalesce(lower(sqlc.narg(last_name)), last_name)
where user_uuid = sqlc.arg(user_uuid)
returning user_uuid,
  email,
  first_name,
  last_name,
  avatar,
  created_at,
  updated_at;
