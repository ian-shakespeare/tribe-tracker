package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		created := users.Fields.GetByName("created")
		created.SetName("createdAt")

		updated := users.Fields.GetByName("updated")
		updated.SetName("updatedAt")

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		createdAt := users.Fields.GetByName("createdAt")
		createdAt.SetName("created")

		updatedAt := users.Fields.GetByName("updatedAt")
		updatedAt.SetName("updated")

		return app.Save(users)
	})
}
