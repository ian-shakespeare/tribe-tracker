package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/ian-shakespeare/tribe-tracker/server/database/migrations"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/app"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/env"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
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

	dbHost := env.Fallback("POSTGRES_HOST", "localhost")
	dbPort := env.Fallback("POSTGRES_PORT", "5432")
	dbUser := env.Fallback("POSTGRES_USER", "admin")
	dbPassword := env.Fallback("POSTGRES_PASSWORD", "password")
	dbName := env.Fallback("POSTGRES_DB", "tribetracker")
	dbSsl := env.Fallback("POSTGRES_SSL", "disable")
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", dbHost, dbPort, dbUser, dbPassword, dbName, dbSsl)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	source, err := iofs.New(migrations.FS, ".")
	if err != nil {
		log.Fatal(err)
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Fatal(err)
	}

	migrator, err := migrate.NewWithInstance("postgres", source, "", driver)
	if err != nil {
		log.Fatal(err)
	}

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatal(err)
	}

	signingKey := env.Must(env.Get("SIGNING_KEY"))

	a := app.New(db, []byte(signingKey))

	addr := ":8000"
	fmt.Printf("Listening on %s\n", addr)
	if err := a.Listen(addr); err != nil {
		log.Fatal(err)
	}
}
