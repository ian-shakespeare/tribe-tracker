package database

import (
	"strings"
	"time"

	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/pocketbase/dbx"
)

func GetRecentUsers(db dbx.Builder, userId string, after time.Time) ([]models.User, error) {
	afterStr := strings.ReplaceAll(after.Format(time.RFC3339), "T", " ")

	query := `
    select u.id,
      u.email,
      u.firstName,
      u.lastName,
      u.avatar,
      u.createdAt,
      max(u.updatedAt) updatedAt,
      u.isDeleted
    from familyMembers me
    join familyMembers fm
      on me.family = fm.family
    join users u
      on fm.user = u.id
    where me.user = {:userId}
      and u.updatedAt >= {:after}
    group by u.id
  `

	var users []models.User
	err := db.NewQuery(query).Bind(dbx.Params{"after": afterStr, "userId": userId}).All(&users)
	return users, err
}

func GetRecentFamilies(db dbx.Builder, userId string, after time.Time) ([]models.Family, error) {
	afterStr := strings.ReplaceAll(after.Format(time.RFC3339), "T", " ")

	query := `
    select f.id,
      f.name,
      f.createdBy,
      f.createdAt,
      max(f.updatedAt) updatedAt,
      f.isDeleted
    from familyMembers me
    join families f
      on me.family = f.id
    where me.user = {:userId}
      and f.updatedAt > {:after}
    group by f.id
  `

	var families []models.Family
	err := db.NewQuery(query).Bind(dbx.Params{"after": afterStr, "userId": userId}).All(&families)
	return families, err
}

func GetRecentFamilyMembers(db dbx.Builder, userId string, after time.Time) ([]models.FamilyMember, error) {
	afterStr := strings.ReplaceAll(after.Format(time.RFC3339), "T", " ")

	query := `
    select fm.id,
      fm.family,
      fm.user,
      fm.createdAt
    from familyMembers me
    join families f
      on me.family = f.id
    join familyMembers fm
      on f.id = fm.family
    where me.user = {:userId}
      and fm.createdAt > {:after}
  `

	var familyMembers []models.FamilyMember
	err := db.NewQuery(query).Bind(dbx.Params{"after": afterStr, "userId": userId}).All(&familyMembers)
	return familyMembers, err
}

func GetRecentLocations(db dbx.Builder, userId string, after time.Time) ([]models.Location, error) {
	afterStr := strings.ReplaceAll(after.Format(time.RFC3339), "T", " ")

	query := `
    select l.id,
      l.user,
      l.coordinates,
      max(l.createdAt) createdAt
    from familyMembers me
    join familyMembers fm
      on me.family = fm.family
    join users u
      on fm.user = u.id
    join locations l
      on u.id = l.user
    where me.user = {:userId}
      and l.createdAt > {:after}
    group by l.user
  `

	var locations []models.Location
	err := db.NewQuery(query).Bind(dbx.Params{"after": afterStr, "userId": userId}).All(&locations)
	return locations, err
}

func CreateFamily(db dbx.Builder, userId, name, code string) (models.Family, error) {
	now := strings.ReplaceAll(time.Now().Format(time.RFC3339), "T", " ")

	query := `
  insert into families (
    name,
    code,
    createdBy,
    createdAt,
    updatedAt
  ) values (
    {:name},
    {:code},
    {:userId},
    {:now},
    {:now}
  ) returning id,
    name,
    code,
    createdBy,
    createdAt,
    updatedAt
  `

	var f models.Family
	err := db.NewQuery(query).Bind(dbx.Params{"name": name, "code": code, "userId": userId, "now": now}).One(&f)
	return f, err
}

func CreateFamilyMember(db dbx.Builder, familyId, userId string) (models.FamilyMember, error) {
	now := strings.ReplaceAll(time.Now().Format(time.RFC3339), "T", " ")

	query := `
  insert into familyMembers (
    family,
    user,
    createdAt
  ) values (
    {:familyId},
    {:userId},
    {:now}
  ) returning id,
    family,
    user,
    createdAt
  `

	var fm models.FamilyMember
	err := db.NewQuery(query).Bind(dbx.Params{"familyId": familyId, "userId": userId, "now": now}).One(&fm)
	return fm, err
}
