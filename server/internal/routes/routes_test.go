package routes_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
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

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	dbSrv, err := services.NewDB(dsn)
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

func createFamily(t *testing.T, a *fiber.App, access models.Access, name string) models.Family {
	t.Helper()

	r := httptest.NewRequestWithContext(
		t.Context(),
		http.MethodPost,
		"/api/families",
		strings.NewReader(fmt.Sprintf(`{"name":%q}`, name)),
	)
	r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))

	res, err := a.Test(r)
	require.NoError(t, err)
	require.Equal(t, http.StatusCreated, res.StatusCode)
	defer res.Body.Close()

	var f models.Family
	err = json.NewDecoder(res.Body).Decode(&f)
	require.NoError(t, err)

	return f
}

func createFamilyMember(t *testing.T, a *fiber.App, access models.Access, familyId string) models.FamilyMember {
	t.Helper()

	r := httptest.NewRequestWithContext(
		t.Context(),
		http.MethodPost,
		fmt.Sprintf("/api/families/%s/members", familyId),
		http.NoBody,
	)
	r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))

	res, err := a.Test(r)
	require.NoError(t, err)
	require.Equal(t, http.StatusCreated, res.StatusCode)
	defer res.Body.Close()

	var fm models.FamilyMember
	err = json.NewDecoder(res.Body).Decode(&fm)
	require.NoError(t, err)

	return fm
}

func createLocation(t *testing.T, a *fiber.App, access models.Access, lat, lon float64) models.Location {
	t.Helper()

	r := httptest.NewRequestWithContext(
		t.Context(),
		http.MethodPost,
		"/api/locations",
		strings.NewReader(fmt.Sprintf(`{"lat":%f,"lon":%f}`, lat, lon)),
	)
	r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))

	res, err := a.Test(r)
	require.NoError(t, err)
	require.Equal(t, http.StatusCreated, res.StatusCode)
	defer res.Body.Close()

	var l models.Location
	err = json.NewDecoder(res.Body).Decode(&l)
	require.NoError(t, err)

	return l
}
