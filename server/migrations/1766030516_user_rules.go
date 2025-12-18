package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		users.ListRule = types.Pointer(`@request.auth.id != "" && @collection.families:relatives.members.id ?= @request.auth.id && @collection.families:relatives.members.id ?= id`)

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		users.ListRule = types.Pointer(`@request.auth.id = id`)

		return app.Save(users)
	})
}
