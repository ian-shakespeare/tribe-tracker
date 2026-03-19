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
