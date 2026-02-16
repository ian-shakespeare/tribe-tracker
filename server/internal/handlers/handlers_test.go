package handlers_test

import (
	"io"
	"net/http"
	"net/url"
	"testing"

	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	"github.com/pocketbase/pocketbase/tests"
	"github.com/stretchr/testify/require"
)

const testDataDir = "../../testdata"

func generateToken(t *testing.T, collection, email string) string {
	t.Helper()

	app, err := tests.NewTestApp(testDataDir)
	require.NoError(t, err)
	defer app.Cleanup()

	record, err := app.FindAuthRecordByEmail(collection, email)
	require.NoError(t, err)

	token, err := record.NewAuthToken()
	require.NoError(t, err)

	return token
}

func TestGetSyncData(t *testing.T) {
	token := generateToken(t, "users", "luke.skywalker@email.com")

	setupTestApp := func(t testing.TB) *tests.TestApp {
		testApp, err := tests.NewTestApp(testDataDir)
		require.NoError(t, err)

		handlers.Bind(testApp)

		return testApp
	}

	path := "/mobile/sync"
	scenarios := []tests.ApiScenario{
		{
			Name:               "unauthorzed",
			Method:             http.MethodGet,
			URL:                path,
			ExpectedStatus:     http.StatusUnauthorized,
			NotExpectedContent: []string{`users`, `families`, `locations`},
			TestAppFactory:     setupTestApp,
		},
		{
			Name:   "invalid http method",
			Method: http.MethodPost,
			URL:    path,
			Headers: map[string]string{
				"Authorization": token,
			},
			ExpectedStatus:     http.StatusNotFound,
			NotExpectedContent: []string{"users", "families", "locations"},
			TestAppFactory:     setupTestApp,
		},
		{
			Name:   "first sync",
			Method: http.MethodGet,
			URL:    path + "?after=" + url.QueryEscape("1970-01-01T00:00:00.000Z"),
			Headers: map[string]string{
				"Authorization": token,
			},
			ExpectedStatus:     http.StatusOK,
			ExpectedContent:    []string{"users", "families", "locations"},
			NotExpectedContent: []string{`users":[]`, `families":[]`, `locations":[]`},
			TestAppFactory:     setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				b, _ := io.ReadAll(res.Body)
				t.Logf("response: %s", string(b))
			},
		},
		{
			Name:   "up to date sync",
			Method: http.MethodGet,
			URL:    path + "?after=" + url.QueryEscape("2026-02-01T17:51:44.784Z"),
			Headers: map[string]string{
				"Authorization": token,
			},
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`users":[]`, `families":[]`, `locations":[]`},
			TestAppFactory:  setupTestApp,
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}
