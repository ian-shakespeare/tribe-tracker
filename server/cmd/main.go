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

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/displays/families/{code}", func(e *core.RequestEvent) error {
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

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
