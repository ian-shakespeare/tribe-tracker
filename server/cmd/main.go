package main

import (
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	_ "github.com/ian-shakespeare/tribe-tracker/server/migrations"
)

func getEnvWithFallback(name, fallback string) string {
	if value, exists := os.LookupEnv(name); exists {
		return value
	}

	return fallback
}

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	handlers.Bind(app)
	app.Settings().Meta.AppName = "Tribe Tracker"
	app.Settings().Meta.AppURL = getEnvWithFallback("API_URL", "http://localhost:8090")
	app.Settings().Meta.HideControls = true

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
