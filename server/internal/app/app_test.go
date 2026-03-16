package app_test

import (
	"database/sql"
	"errors"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	pgmigrator "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/ian-shakespeare/tribe-tracker/server/database/migrations"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/app"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/require"
	pgcontainer "github.com/testcontainers/testcontainers-go/modules/postgres"
)

func createDbContainerAndConnection(t *testing.T) (*pgcontainer.PostgresContainer, *sql.DB) {
	t.Helper()

	dbUser := "admin"
	dbPassword := "password"
	dbName := "tribetracker"

	container, err := pgcontainer.Run(
		t.Context(),
		"postgis/postgis:18-3.6",
		pgcontainer.WithDatabase(dbName),
		pgcontainer.WithUsername(dbUser),
		pgcontainer.WithPassword(dbPassword),
		pgcontainer.BasicWaitStrategies(),
	)
	require.NoError(t, err)

	connStr, err := container.ConnectionString(t.Context(), "sslmode=disable")
	require.NoError(t, err)

	db, err := sql.Open("postgres", connStr)
	require.NoError(t, err)

	source, err := iofs.New(migrations.FS, ".")
	require.NoError(t, err)

	driver, err := pgmigrator.WithInstance(db, &pgmigrator.Config{})
	require.NoError(t, err)

	migrator, err := migrate.NewWithInstance("postgres", source, "", driver)
	require.NoError(t, err)

	if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		t.Fatal(err)
	}
	return container, db
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
