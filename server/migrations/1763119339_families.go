package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

const FamiliesId = "families"

func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		families := core.NewBaseCollection(FamiliesId)

		families.CreateRule = types.Pointer(`@request.auth.id != ""`)
		families.ViewRule = types.Pointer(`@request.auth.id != "" && members.id ?= @request.auth.id`)
		families.ListRule = types.Pointer(`@request.auth.id != "" && members.id ?= @request.auth.id`)
		families.UpdateRule = types.Pointer(`@request.auth.id != "" && members.id ?= @request.auth.id`)

		families.Fields.Add(&core.TextField{
			Name:        "name",
			Min:         2,
			Max:         64,
			Presentable: true,
			Required:    true,
		})

		families.Fields.Add(&core.TextField{
			Name:     "code",
			Min:      8,
			Max:      255,
			Required: true,
		})

		families.Fields.Add(&core.RelationField{
			Name:         "createdBy",
			CollectionId: users.Id,
			MaxSelect:    1,
		})

		families.Fields.Add(&core.RelationField{
			Name:         "members",
			MaxSelect:    99,
			CollectionId: users.Id,
		})

		families.Fields.Add((&core.AutodateField{
			Name:     "createdAt",
			System:   true,
			OnCreate: true,
		}))

		families.Fields.Add(&core.AutodateField{
			Name:     "updatedAt",
			System:   true,
			OnCreate: true,
			OnUpdate: true,
		})

		families.AddIndex("idx_family_name", false, "code", "")
		families.AddIndex("idx_family_code", true, "code", "")

		return app.Save(families)
	}, func(app core.App) error {
		families, err := app.FindCollectionByNameOrId(FamiliesId)
		if err != nil {
			return err
		}

		return app.Delete(families)
	})
}
