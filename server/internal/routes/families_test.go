package routes_test

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateFamily(t *testing.T) {
	testCases := []struct {
		name               string
		inputBody          string
		expectStatus       int
		expectBodyContains []string
		buildAccess        func(*testing.T, *fiber.App) models.Access
	}{
		{
			name:               "ok",
			inputBody:          `{"name":"The Doe Family"}`,
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"id", "name", "createdBy", "createdAt", "updatedAt"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-ok@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "name too short",
			inputBody:    `{"name":"T"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-too-short@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "name too long",
			inputBody:    `{"name":"The Doe FamilyThe Doe FamilyThe Doe FamilyThe Doe FamilyThe Doe F"}`,
			expectStatus: http.StatusBadRequest,
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-too-long@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "unauthorized",
			inputBody:    `{"name":"The Doe Family"}`,
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

func TestCreateFamilyMember(t *testing.T) {
	testCases := []struct {
		name               string
		expectStatus       int
		expectBodyContains []string
		overrideFamilyId   string
		buildAccess        func(*testing.T, *fiber.App) models.Access
	}{
		{
			name:               "ok",
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"user", "family", "createdAt"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-member-ok@email.com", "password", "john", "doe")
			},
		},
		{
			name:             "not found",
			expectStatus:     http.StatusNotFound,
			overrideFamilyId: uuid.Nil.String(),
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-member-not-found@email.com", "password", "john", "doe")
			},
		},
		{
			name:             "bad family id",
			expectStatus:     http.StatusBadRequest,
			overrideFamilyId: "bad",
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-member-bad-family@email.com", "password", "john", "doe")
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
				http.MethodPost,
				"/api/families",
				strings.NewReader(`{"name":"Test Family"}`),
			)
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))

			res, err := a.Test(r)
			require.NoError(t, err)
			assert.Equal(t, http.StatusCreated, res.StatusCode)

			var family struct {
				ID string `json:"id"`
			}
			err = json.NewDecoder(res.Body).Decode(&family)
			_ = res.Body.Close()
			require.NoError(t, err)

			familyId := family.ID
			if tc.overrideFamilyId != "" {
				familyId = tc.overrideFamilyId
			}

			r = httptest.NewRequestWithContext(
				t.Context(),
				http.MethodPost,
				"/api/families/"+familyId+"/members",
				http.NoBody,
			)
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))

			res, err = a.Test(r)
			require.NoError(t, err)
			assert.Equal(t, tc.expectStatus, res.StatusCode)
			defer res.Body.Close()

			body, err := io.ReadAll(res.Body)
			assert.NoError(t, err)
			t.Log(string(body))

			if len(tc.expectBodyContains) >= 1 {
				for _, s := range tc.expectBodyContains {
					assert.Contains(t, string(body), s)
				}
			}
		})
	}
}
