package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		families, err := app.FindCollectionByNameOrId(FamiliesId)
		if err != nil {
			return err
		}

		families.RemoveIndex("idx_family_code")
		families.Fields.RemoveByName("code")

		return app.Save(families)
	}, func(app core.App) error {
		families, err := app.FindCollectionByNameOrId(FamiliesId)
		if err != nil {
			return err
		}

		families.Fields.Add(&core.TextField{
			Name:     "code",
			Min:      8,
			Max:      255,
			Required: true,
		})

		families.AddIndex("idx_family_code", true, "code", "")

		return app.Save(families)
	})
}
