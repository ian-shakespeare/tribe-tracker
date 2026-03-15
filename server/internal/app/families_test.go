package app_test

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/ian-shakespeare/tribe-tracker/server/internal/app"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
)

func TestCreateFamily(t *testing.T) {
	container, db := createDbContainerAndConnection(t)
	defer testcontainers.CleanupContainer(t, container)

	testCases := []struct {
		name               string
		inputBody          string
		expectStatus       int
		expectBodyContains []string
		buildAccess        func(*testing.T, *app.App) app.Access
	}{
		{
			name:               "ok",
			inputBody:          `{"name":"The Doe Family"}`,
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"id", "name", "createdBy", "createdAt", "updatedAt"},
			buildAccess: func(t *testing.T, a *app.App) app.Access {
				return registerUser(t, a, "create-family-ok@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "name too short",
			inputBody:    `{"name":"T"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *app.App) app.Access {
				return registerUser(t, a, "create-family-too-short@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "name too long",
			inputBody:    `{"name":"The Doe FamilyThe Doe FamilyThe Doe FamilyThe Doe FamilyThe Doe F"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *app.App) app.Access {
				return registerUser(t, a, "create-family-too-long@email.com", "password", "john", "doe")
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			a := app.New(db)
			access := tc.buildAccess(t, a)

			r := httptest.NewRequestWithContext(
				t.Context(),
				http.MethodPost,
				"/api/families",
				strings.NewReader(tc.inputBody),
			)
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))

			res, err := a.Test(r)
			require.NoError(t, err)
			assert.Equal(t, tc.expectStatus, res.StatusCode)
			defer res.Body.Close()

			body, err := io.ReadAll(res.Body)
			assert.NoError(t, err)

			if len(tc.expectBodyContains) >= 1 {
				for _, s := range tc.expectBodyContains {
					assert.Contains(t, string(body), s)
				}
			}
		})
	}
}
