package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

const UsersId = "users"

func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		users.Fields.RemoveByName("name")

		users.Fields.Add(&core.TextField{
			Name:        "firstName",
			Presentable: true,
			Required:    true,
			Min:         2,
			Max:         64,
		})

		users.Fields.Add(&core.TextField{
			Name:        "lastName",
			Presentable: true,
			Required:    true,
			Min:         2,
			Max:         64,
		})

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		users.Fields.RemoveByName("firstName")
		users.Fields.RemoveByName("lastName")

		users.Fields.Add(&core.TextField{
			Name:        "name",
			Presentable: true,
			Min:         2,
			Max:         64,
		})

		return nil
	})
}
