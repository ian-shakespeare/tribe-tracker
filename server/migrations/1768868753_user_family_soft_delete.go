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

		users.Fields.Add(&core.BoolField{
			Name:        "isDeleted",
			Presentable: true,
			System:      true,
			Hidden:      true,
		})
		if err := app.Save(users); err != nil {
			return err
		}

		families, err := app.FindCollectionByNameOrId(FamiliesId)
		if err != nil {
			return nil
		}

		families.Fields.Add(&core.BoolField{
			Name:        "isDeleted",
			Presentable: true,
			System:      true,
			Hidden:      true,
		})
		if err := app.Save(families); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		users.Fields.RemoveByName("isDeleted")
		if err := app.Save(users); err != nil {
			return err
		}

		families, err := app.FindCollectionByNameOrId(FamiliesId)
		if err != nil {
			return nil
		}

		families.Fields.RemoveByName("isDeleted")
		if err := app.Save(families); err != nil {
			return err
		}

		return nil
	})
}
