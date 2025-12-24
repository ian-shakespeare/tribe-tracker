package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

const LocationsId = "locations"

func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		locations := core.NewBaseCollection(LocationsId)

		locations.CreateRule = types.Pointer(`@request.auth.id != ""`)
		locations.ViewRule = types.Pointer(`@request.auth.id != "" && user.id = @request.auth.id`)
		locations.ListRule = types.Pointer(`@request.auth.id != "" && user.id = @request.auth.id`)

		locations.Fields.Add(&core.RelationField{
			Name:          "user",
			CollectionId:  users.Id,
			CascadeDelete: true,
			MaxSelect:     1,
		})

		locations.Fields.Add(&core.GeoPointField{
			Name:     "coordinates",
			Required: true,
		})

		locations.Fields.Add(&core.AutodateField{
			Name:     "createdAt",
			System:   true,
			OnCreate: true,
		})

		locations.AddIndex("idx_location_user", false, "user", "")

		return app.Save(locations)
	}, func(app core.App) error {
		locations, err := app.FindCollectionByNameOrId(LocationsId)
		if err != nil {
			return err
		}

		return app.Delete(locations)
	})
}
