package routes_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/routes"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/stretchr/testify/require"
	_ "modernc.org/sqlite"
)

func createServer(t *testing.T) *fiber.App {
	t.Helper()

	dbSrv, err := services.NewDB(":memory:")
	require.NoError(t, err)

	storageSrv := services.NewStorage(os.TempDir())

	var cfg fiber.Config
	cfg.Services = append(cfg.Services, dbSrv)
	cfg.Services = append(cfg.Services, storageSrv)

	a := fiber.New(cfg)
	a.State().Set("refreshExpiry", 60*24*time.Hour)
	a.State().Set("accessExpiry", time.Hour)
	a.State().Set("signingKey", []byte("test-signing-key"))
	routes.Register(a)

	return a
}

func registerUser(t *testing.T, a *fiber.App, email, password, firstName, lastName string) models.Access {
	t.Helper()

	var nu models.NewUser
	nu.Email = email
	nu.Password = password
	nu.FirstName = firstName
	nu.LastName = lastName

	body := new(bytes.Buffer)
	err := json.NewEncoder(body).Encode(nu)
	require.NoError(t, err)

	req := httptest.NewRequestWithContext(t.Context(), http.MethodPost, "/api/auth/register", body)

	res, err := a.Test(req)
	require.NoError(t, err)
	defer res.Body.Close()

	var acc models.Access
	err = json.NewDecoder(res.Body).Decode(&acc)
	require.NoError(t, err)

	return acc
}
