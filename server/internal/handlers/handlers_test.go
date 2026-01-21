package handlers_test

import (
	"net/http"
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

	url := "/mobile/sync"
	scenarios := []tests.ApiScenario{
		{
			Name:            "unauthorzed",
			Method:          http.MethodGet,
			URL:             url,
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{`"users":[]`, `"families":[]`, `"locations":[]`},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:   "invalid http method",
			Method: http.MethodPost,
			URL:    url,
			Headers: map[string]string{
				"Authorization": token,
			},
			ExpectedStatus:     http.StatusMethodNotAllowed,
			NotExpectedContent: []string{"users", "families", "locations"},
			TestAppFactory:     setupTestApp,
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}
