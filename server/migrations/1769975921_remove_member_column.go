package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
	"golang.org/x/sync/errgroup"
)

func init() {
	m.Register(func(app core.App) error {
		familyMembers, err := app.FindCollectionByNameOrId(FamilyMembersId)
		if err != nil {
			return err
		}

		familyRecords, err := app.FindAllRecords(FamiliesId)
		if err != nil {
			return err
		}

		g := errgroup.Group{}
		for _, fr := range familyRecords {
			familyId := fr.Id
			userIds := fr.GetStringSlice("members")

			for _, userId := range userIds {
				g.Go(func() error {
					record := core.NewRecord(familyMembers)
					record.Set("family", familyId)
					record.Set("user", userId)

					return app.Save(record)
				})
			}
		}

		if err := g.Wait(); err != nil {
			return err
		}

		families, err := app.FindCollectionByNameOrId(FamiliesId)
		if err != nil {
			return err
		}

		families.ViewRule = types.Pointer(`@request.auth.id != "" && createdBy = @request.auth.id`)
		families.ListRule = types.Pointer(`@request.auth.id != "" && createdBy = @request.auth.id`)
		families.UpdateRule = types.Pointer(`@request.auth.id != "" && createdBy = @request.auth.id`)
		families.DeleteRule = types.Pointer(`@request.auth.id != "" && createdBy = @request.auth.id`)

		families.Fields.RemoveByName("members")

		return app.Save(families)
	}, func(app core.App) error {
		return fmt.Errorf("cannot down member migration")
	})
}
