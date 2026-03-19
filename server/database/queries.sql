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

-- name: CreateSession :one
insert into sessions (user_id, refresh_token, expires_at)
select user_id,
  ? as refresh_token,
  ? as expires_at
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

-- name: CreateFamily :one
insert into families (family_uuid, name, created_by)
select ?,
  ?,
  u.user_id
from users u
where u.user_uuid = ?
returning family_uuid,
  name,
  created_by,
  created_at,
  updated_at;

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

-- name: CreateLocation :one
insert into locations (location_uuid, user_id, lat, lon)
select ? as location_uuid,
  u.user_id as user_id,
  ? as lat,
  ? as lon
from users u
where u.user_uuid = ?
  and u.is_deleted = false
returning location_uuid,
  user_id,
  lat,
  lon,
  created_at;

-- name: CreateFamilyMember :one
insert into family_members (user_id, family_id)
select u.user_id as user_id,
  f.family_id as family_id
from users u
join families f
  on f.family_uuid = ?
  and f.is_deleted = false
where u.user_uuid = ?
  and u.is_deleted = false
returning family_member_id,
  user_id,
  family_id,
  created_at;
