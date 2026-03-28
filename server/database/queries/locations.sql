-- name: CreateLocation :one
insert into locations (location_uuid, lat, lon, user_id)
select ?, ?, ?, u.user_id
from users u
where u.user_uuid = ?
  and u.is_deleted = false
returning location_uuid,
  user_id,
  lat,
  lon,
  created_at;

-- name: GetRecentLocations :many
select l.location_uuid,
  u.user_uuid,
  l.lat,
  l.lon,
  cast(max(l.created_at) as integer) created_at
from users me
join family_members my_family
  on me.user_id = my_family.user_id
join family_members fm
  on my_family.family_id = fm.family_id
join users u
  on fm.user_id = u.user_id
join locations l
  on u.user_id = l.user_id
where me.user_uuid = ?
  and l.created_at > sqlc.arg(created_after)
group by l.user;
