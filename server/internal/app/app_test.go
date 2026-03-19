package app_test

import (
	"database/sql"
	"errors"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/ian-shakespeare/tribe-tracker/server/database/migrations"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/app"
	"github.com/stretchr/testify/require"
	_ "modernc.org/sqlite"
)

func createDb(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite", ":memory:")
	require.NoError(t, err)

	source, err := iofs.New(migrations.FS, ".")
	require.NoError(t, err)

	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	require.NoError(t, err)

	migrator, err := migrate.NewWithInstance("sqlite", source, "", driver)
	require.NoError(t, err)

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		t.Fatal(err)
	}
	return db
}

func registerUser(t *testing.T, a *app.App, email, password, firstName, lastName string) app.Access {
	t.Helper()

	var req app.RegisterUserRequest
	req.Body.Email = email
	req.Body.Password = password
	req.Body.FirstName = firstName
	req.Body.LastName = lastName

	res, err := a.RegisterUser(t.Context(), &req)
	require.NoError(t, err)

	return res.Body
}
