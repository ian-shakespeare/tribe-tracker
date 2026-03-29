package routes_test

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUpdateMe(t *testing.T) {
	testCases := []struct {
		name               string
		inputBody          string
		expectStatus       int
		expectBodyContains []string
		buildAccess        func(*testing.T, *fiber.App) models.Access
	}{
		{
			name:               "ok first name",
			inputBody:          `{"firstName":"Johnny"}`,
			expectStatus:       http.StatusOK,
			expectBodyContains: []string{"johnny"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "update-me-first@email.com", "password", "john", "doe")
			},
		},
		{
			name:               "ok last name",
			inputBody:          `{"lastName":"Dough"}`,
			expectStatus:       http.StatusOK,
			expectBodyContains: []string{"dough"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "update-me-last@email.com", "password", "john", "doe")
			},
		},
		{
			name:               "ok full name",
			inputBody:          `{"firstName":"Johnny","lastName":"Dough"}`,
			expectStatus:       http.StatusOK,
			expectBodyContains: []string{"johnny", "dough"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "update-me-full@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "first name too short",
			inputBody:    `{"firstName":"j"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "update-me-first-short@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "first name too long",
			inputBody:    `{"firstName":"JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJ"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "update-me-first-long@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "last name too short",
			inputBody:    `{"lastName":"d"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "update-me-last-short@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "last name too long",
			inputBody:    `{"lastName":"DoughDoughDoughDoughDoughDoughDoughDoughDoughDoughDoughDoughDough"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "update-me-last-long@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "unauthorized",
			inputBody:    `{"firstName":"Johnny","lastName":"Dough"}`,
			expectStatus: http.StatusUnauthorized,
			buildAccess: func(t *testing.T, _ *fiber.App) models.Access {
				return models.Access{}
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			a := createServer(t)

			access := tc.buildAccess(t, a)

			r := httptest.NewRequestWithContext(
				t.Context(),
				http.MethodPatch,
				"/api/users/me",
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
