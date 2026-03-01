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
		families.RemoveIndex("idx_family_name")
		families.Fields.RemoveByName("code")

		families.AddIndex("idx_family_name", false, "name", "")

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

		return app.Save(families)
	})
}
