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
