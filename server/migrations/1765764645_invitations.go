package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

const InvitationsId = "invitations"

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

		invitations := core.NewBaseCollection(InvitationsId)

		invitations.CreateRule = types.Pointer(`@request.auth.id != ""`)
		invitations.ViewRule = types.Pointer(`@request.auth.id != "" && (sender.id = @request.auth.id || recipient.id = @request.auth.id)`)
		invitations.ListRule = types.Pointer(`@request.auth.id != "" && (sender.id = @request.auth.id || recipient.id = @request.auth.id)`)
		invitations.UpdateRule = types.Pointer(`@request.auth.id != "" && (sender.id = @request.auth.id || recipient.id = @request.auth.id)`)

		invitations.Fields.Add(&core.RelationField{
			Name:         "sender",
			CollectionId: users.Id,
			Required:     true,
		})

		invitations.Fields.Add(&core.RelationField{
			Name:          "recipient",
			CollectionId:  users.Id,
			Required:      true,
			CascadeDelete: true,
		})

		invitations.Fields.Add(&core.RelationField{
			Name:          "family",
			CollectionId:  families.Id,
			Required:      true,
			CascadeDelete: true,
		})

		invitations.Fields.Add(&core.BoolField{
			Name: "accepted",
		})

		invitations.Fields.Add((&core.AutodateField{
			Name:     "createdAt",
			System:   true,
			OnCreate: true,
		}))

		invitations.Fields.Add(&core.AutodateField{
			Name:     "updatedAt",
			System:   true,
			OnCreate: true,
			OnUpdate: true,
		})

		invitations.AddIndex("idx_invitation_sender", false, "sender", "")
		invitations.AddIndex("idx_invitation_recipient", false, "recipient", "")

		return app.Save(invitations)
	}, func(app core.App) error {
		invitations, err := app.FindCollectionByNameOrId(InvitationsId)
		if err != nil {
			return err
		}

		return app.Delete(invitations)
	})
}
