package database

import (
	"time"

	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/pocketbase/dbx"
)

func GetRecentUsers(db dbx.Builder, userId string, after time.Time) ([]models.UserModel, error) {
	afterStr := after.Format(time.RFC3339)

	query := `
    select u.id,
      u.email,
      u.firstName,
      u.lastName,
      u.avatar,
      u.created,
      max(u.updated),
      u.isDeleted
    from families f
    join json_each(f.members) members
    join users u
      on members.value = u.id
    where u.updated >= {:after}
      and exists (
        select 1
        from json_each(f.members) m
        where m.value = {:userId}
      )
      and u.isDeleted = false
    group by u.id
  `

	var users []models.UserModel
	err := db.NewQuery(query).Bind(dbx.Params{"after": afterStr, "userId": userId}).All(&users)
	return users, err
}

func GetRecentFamilies(db dbx.Builder, userId string, after time.Time) ([]models.FamilyModel, error) {
	afterStr := after.Format(time.RFC3339)

	query := `
    select f.id,
      f.name,
      f.createdBy,
      f.members,
      f.createdAt,
      max(f.updatedAt),
      f.isDeleted
    from families f
    where f.updatedAt > {:after}
      and exists (
        select 1
        from json_each(f.members) m
        where m.value = {:userId}
      )
      and f.isDeleted = false
    group by f.id
  `

	var families []models.FamilyModel
	err := db.NewQuery(query).Bind(dbx.Params{"after": afterStr, "userId": userId}).All(&families)
	return families, err
}

func GetRecentLocations(db dbx.Builder, userId string, after time.Time) ([]models.LocationModel, error) {
	afterStr := after.Format(time.RFC3339)

	query := `
    select l.id,
      l.user,
      l.coordinates,
      max(l.createdAt)
    from families f
    join json_each(f.members) members
    join users u
      on members.value = u.id
    join locations l
      on u.id = l.user
    where f.id = {:familyId}
      and exists (
        select 1
        from json_each(f.members) m
        where m.value = {:userId}
      )
    where l.createdAt > {:after}
    group by l.id
  `

	var locations []models.LocationModel
	err := db.NewQuery(query).Bind(dbx.Params{"after": afterStr, "userId": userId}).All(&locations)
	return locations, err
}
