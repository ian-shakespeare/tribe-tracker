package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

const FamilyMembersId = "familyMembers"

func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		families, err := app.FindCollectionByNameOrId(FamiliesId)
		if err != nil {
			return err
		}

		familyMembers := core.NewBaseCollection(FamilyMembersId)

		familyMembers.DeleteRule = types.Pointer(`@request.auth.id != "" && user = @request.auth.id`)

		familyMembers.Fields.Add(&core.RelationField{
			Name:          "family",
			CollectionId:  families.Id,
			MaxSelect:     1,
			CascadeDelete: true,
			Required:      true,
		})

		familyMembers.Fields.Add(&core.RelationField{
			Name:          "user",
			CollectionId:  users.Id,
			MaxSelect:     1,
			CascadeDelete: true,
			Required:      true,
		})

		familyMembers.Fields.Add((&core.AutodateField{
			Name:     "createdAt",
			System:   true,
			OnCreate: true,
		}))

		return app.Save(familyMembers)
	}, func(app core.App) error {
		familyMembers, err := app.FindCollectionByNameOrId(FamilyMembersId)
		if err != nil {
			return err
		}

		return app.Delete(familyMembers)
	})
}
