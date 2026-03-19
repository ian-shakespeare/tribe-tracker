package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/ian-shakespeare/tribe-tracker/server/database/migrations"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/app"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/env"
	"github.com/joho/godotenv"
	_ "modernc.org/sqlite"
)

const dataDir = "data"

func setupDirectories(baseDir string) error {
	dirs := []string{
		baseDir,
		filepath.Join(baseDir, dataDir),
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

func main() {
	_ = godotenv.Load()

	baseDir := env.Fallback("BASE_DIR", "/var/lib/go-app-template")

	if err := setupDirectories(baseDir); err != nil {
		log.Fatal(err)
	}

	if err := checkDirPermission(baseDir); err != nil {
		log.Fatal(err)
	}

	db, err := sql.Open("sqlite", filepath.Join(baseDir, dataDir, "tribetracker.db"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	source, err := iofs.New(migrations.FS, ".")
	if err != nil {
		log.Fatal(err)
	}

	driver, err := sqlite.WithInstance(db, &sqlite.Config{
		NoTxWrap: true,
	})
	if err != nil {
		log.Fatal(err)
	}

	migrator, err := migrate.NewWithInstance("sqlite", source, "", driver)
	if err != nil {
		log.Fatal(err)
	}

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatal(err)
	}

	signingKey := env.Must(env.Get("SIGNING_KEY"))

	a := app.New(db, app.WithSigningKey(signingKey))

	addr := ":8000"
	fmt.Printf("Listening on %s\n", addr)
	if err := a.Listen(addr); err != nil {
		log.Fatal(err)
	}
}
