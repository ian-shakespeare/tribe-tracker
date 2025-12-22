package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/types"

	_ "github.com/ian-shakespeare/tribe-tracker/server/migrations"
)

type UserLocation struct {
	FirstName  string         `db:"firstName" json:"firstName"`
	LastName   string         `db:"lastName" json:"lastName"`
	Coords     types.GeoPoint `db:"coords" json:"coords"`
	RecordedAt types.DateTime `db:"recordedAt" json:"recordedAt"`
}

type FamilyMember struct {
	ID        string         `db:"id" json:"id"`
	Email     string         `db:"email" json:"email"`
	FirstName string         `db:"firstName" json:"firstName"`
	LastName  string         `db:"lastName" json:"lastName"`
	JoinedAt  types.DateTime `db:"joinedAt" json:"joinedAt"`
}

type MemberLocation struct {
	UserID      string         `db:"userId" json:"userId"`
	FirstName   string         `db:"firstName" json:"firstName"`
	LastName    string         `db:"lastName" json:"lastName"`
	Coordinates types.GeoPoint `db:"coordinates" json:"coordinates"`
	RecordedAt  types.DateTime `db:"recordedAt" json:"recordedAt"`
}

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/display/families/{code}", func(e *core.RequestEvent) error {
			code := e.Request.PathValue("code")

			query := `
			select u.firstName as firstName,
				u.lastName as lastName,
				l.coordinates as coords,
				l.updatedAt as recordedAt
			from families f
			join locations l
				on f.id = l.family
			join users u
				on l.user = u.id
			where f.code = {:code}
			`

			var ul []UserLocation

			err := app.DB().NewQuery(query).Bind(dbx.Params{"code": code}).All(&ul)
			if err != nil {
				message := fmt.Sprintf("Family with code '%s' not found.", code)
				return e.String(http.StatusNotFound, message)
			}

			return e.JSON(http.StatusOK, ul)
		})

		se.Router.GET("/mobile/families/{familyId}/members", func(e *core.RequestEvent) error {
			familyId := e.Request.PathValue("familyId")
			userId := e.Auth.Id

			query := `
      select u.id as id,
        u.email as email,
        u.firstName as firstName,
        u.lastName as lastName,
        ifnull(i.updatedAt, f.createdAt) as joinedAt
      from families f
      join json_each(f.members) members
      join users u
        on members.value = u.id
      left join invitations i
        on u.id = i.recipient
        and i.accepted = 1
      where f.id = {:familyId}
        and exists (
          select 1
          from json_each(f.members) m
          where m.value = {:userId}
        )
      `

			var fm []FamilyMember

			err := app.DB().NewQuery(query).Bind(dbx.Params{"familyId": familyId, "userId": userId}).All(&fm)
			if err != nil {
				message := "Failed to get family members."
				return e.String(http.StatusInternalServerError, message)
			}

			return e.JSON(http.StatusOK, fm)
		})

		se.Router.GET("/mobile/families/{familyId}/members/locations", func(e *core.RequestEvent) error {
			familyId := e.Request.PathValue("familyId")
			userId := e.Auth.Id

			query := `
      select u.id as userId,
        u.firstName as firstName,
        u.lastName as lastName,
        l.coordinates as coordinates,
        max(l.createdAt) as recordedAt
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
      group by u.id
      `

			var ml []MemberLocation

			err := app.DB().NewQuery(query).Bind(dbx.Params{"familyId": familyId, "userId": userId}).All(&ml)
			if err != nil {
				message := "Failed to get member locations."
				return e.String(http.StatusInternalServerError, message)
			}

			return e.JSON(http.StatusOK, ml)
		})

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
