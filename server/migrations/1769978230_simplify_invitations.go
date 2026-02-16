package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		invitations, err := app.FindCollectionByNameOrId(InvitationsId)
		if err != nil {
			return err
		}

		invitations.Fields.RemoveByName("accepted")

		updatedAt := invitations.Fields.GetByName("updatedAt")
		updatedAt.SetSystem(false)

		if err := app.Save(invitations); err != nil {
			return err
		}

		invitations.Fields.RemoveByName("updatedAt")

		return app.Save(invitations)
	}, func(app core.App) error {
		invitations, err := app.FindCollectionByNameOrId(InvitationsId)
		if err != nil {
			return err
		}

		invitations.Fields.Add(&core.BoolField{
			Name: "accepted",
		})

		invitations.Fields.Add(&core.AutodateField{
			Name:     "updatedAt",
			System:   true,
			OnCreate: true,
			OnUpdate: true,
		})

		return app.Save(invitations)
	})
}
