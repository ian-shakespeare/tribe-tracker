-- name: CreateFamily :one
insert into families (family_uuid, name, created_by)
select ?, ?, u.user_id
from users u
where u.user_uuid = ?
returning family_uuid,
  name,
  created_by,
  created_at,
  updated_at;

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

-- name: GetRecentFamilies :many
select f.family_uuid,
  f.name,
  u.user_uuid created_by,
  f.created_at,
  cast(max(f.updated_at) as integer) updated_at,
  f.is_deleted
from users me
join family_members fm
  on me.user_id = fm.user_id
join families f
  on fm.family_id = f.family_id
join users u
  on f.created_by = u.user_id
where me.user_uuid = ?
  and f.updated_at > sqlc.arg(updated_after)
group by f.family_id;

-- name: GetRecentFamilyMembers :many
select f.family_uuid,
  u.user_uuid,
  fm.created_at
from users me
join family_members my_family
  on me.user_id = my_family.user_id
join families f
  on my_family.family_id = f.family_id
join family_members fm
  on f.family_id = fm.family_id
join users u
  on fm.user_id = u.user_id
where me.user_uuid = ?
  and fm.created_at > sqlc.arg(created_after);
