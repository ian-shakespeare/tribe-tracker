package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/env"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/routes"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	"github.com/joho/godotenv"
	_ "modernc.org/sqlite"
)

const (
	dataDir    = "data"
	storageDir = "storage"
)

func setupDirectories(baseDir string) error {
	dirs := []string{
		baseDir,
		filepath.Join(baseDir, dataDir),
		filepath.Join(baseDir, storageDir),
	}

	for _, dir := range dirs {
		if err := createDirIfNotExists(dir); err != nil {
			return err
		}
	}

	return nil
}

func createDirIfNotExists(path string) error {
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		readWriteExecute := os.FileMode(0755)
		err := os.MkdirAll(path, readWriteExecute)
		return err
	}
	if err != nil {
		return err
	}

	if !info.IsDir() {
		return fmt.Errorf("path exists but is not a directory: %s", path)
	}

	return nil
}

func checkDirPermission(path string) error {
	testFile := filepath.Join(path, ".write_test")

	file, err := os.Create(testFile)
	if err != nil {
		return err
	}
	_ = file.Close()

	err = os.Remove(testFile)
	return err
}

//	@title			Tribe Tracker API
//	@version		1.0.0
//	@description	Web API for Tribe Tracker

//	@servers.url	http://localhost:8000

//	@securityDefinitions.bearerauth	BearerAuth

func main() {
	_ = godotenv.Load()

	baseDir := env.Fallback("BASE_DIR", "/var/lib/go-app-template")

	if err := setupDirectories(baseDir); err != nil {
		log.Fatal(err)
	}

	if err := checkDirPermission(baseDir); err != nil {
		log.Fatal(err)
	}

	dbSrv, err := services.NewDB(filepath.Join(baseDir, dataDir, "tribetracker.db"))
	if err != nil {
		log.Fatal(err)
	}

	storageSrv := services.NewStorage(filepath.Join(baseDir, storageDir))

	var cfg fiber.Config
	cfg.Services = append(cfg.Services, dbSrv)
	cfg.Services = append(cfg.Services, storageSrv)

	app := fiber.New(cfg)
	app.State().Set("signingKey", []byte(env.Must(env.Get("SIGNING_KEY"))))
	app.State().Set("accessExpiry", time.Hour)
	app.State().Set("refreshExpiry", 60*24*time.Hour)

	routes.Register(app)

	addr := ":8000"
	if err := app.Listen(addr); err != nil {
		log.Fatal(err)
	}
}
