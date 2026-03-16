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

-- name: CreateLocation :one
with inserted_location as (
  insert into locations (user_id, coordinates)
  select u.user_id as user_id,
    st_setsrid(st_makepoint(sqlc.arg(lat)::real, sqlc.arg(lon)::real), 4326) as coordinates
  from users u
  where u.user_uuid = $1
    and u.is_deleted = false
  returning location_uuid,
    user_id,
    coordinates,
    created_at
)
select ia.location_uuid,
  u.user_uuid,
  jsonb_build_object('lat', st_y(ia.coordinates::geometry), 'lon', st_x(ia.coordinates::geometry)) as coordinates,
  ia.created_at
from inserted_location as ia
join users u
  on ia.user_id = u.user_id
  and u.is_deleted = false;

-- name: CreateFamilyMember :one
with inserted_family_member as (
  insert into family_members (user_id, family_id)
  select u.user_id as user_id,
    f.family_id as family_id
  from users u
  join families f
    on f.family_uuid = $1
    and f.is_deleted = false
  where u.user_uuid = $2
    and u.is_deleted = false
  returning family_member_id,
    user_id,
    family_id,
    created_at
)
select u.user_uuid,
  f.family_uuid,
  ifm.created_at
from inserted_family_member ifm
join users u
  on ifm.user_id = u.user_id
  and u.is_deleted = false
join families f
  on ifm.family_id = f.family_id
  and f.is_deleted = false;
