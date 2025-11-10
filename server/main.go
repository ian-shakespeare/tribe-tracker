package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func createFamiliesCollection(app core.App, users *core.Collection) (*core.Collection, error) {
	families, err := app.FindCollectionByNameOrId("families")
	if err == nil {
		return families, nil
	}

	families = core.NewBaseCollection("families")

	// TODO: rules

	families.Fields.Add(&core.TextField{
		Name:     "name",
		Required: true,
		Min:      2,
		Max:      64,
	})

	families.Fields.Add(&core.RelationField{
		Name:         "createdBy",
		CollectionId: users.Id,
	})

	families.Fields.Add(&core.RelationField{
		Name:         "members",
		MaxSelect:    99,
		CollectionId: users.Id,
	})

	families.AddIndex("idx_family_name", true, "name", "")

	err = app.Save(families)
	return families, err
}

func main() {
	app := pocketbase.New()

	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		if err := e.Next(); err != nil {
			return err
		}

		userCollection, err := e.App.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		families, err := createFamiliesCollection(app, userCollection)
		if err != nil {
			return err
		}

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
