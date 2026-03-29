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
  last_name = coalesce(lower(sqlc.narg(last_name)), last_name),
  avatar = coalesce(sqlc.narg(avatar), avatar)
where user_uuid = sqlc.arg(user_uuid)
returning user_uuid,
  email,
  first_name,
  last_name,
  avatar,
  created_at,
  updated_at;

-- name: GetRecentUsers :many
select u.user_uuid,
  u.email,
  u.first_name,
  u.last_name,
  u.avatar,
  u.created_at,
  cast(max(u.updated_at) as integer) updated_at,
  u.is_deleted
from users me
join family_members my_family
  on me.user_id = my_family.user_id
join family_members fm
  on my_family.family_id = fm.family_id
join users u
  on fm.user_id = u.user_id
where me.user_uuid = ?
  and u.updated_at >= sqlc.arg(updated_after)
group by u.user_id;
