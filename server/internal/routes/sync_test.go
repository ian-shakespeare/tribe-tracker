package routes_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func syncRequest(t *testing.T, a *fiber.App, access models.Access, after string) *http.Response {
	t.Helper()

	url := "/api/sync"
	if after != "" {
		url += fmt.Sprintf("?after=%s", after)
	}

	r := httptest.NewRequestWithContext(
		t.Context(),
		http.MethodGet,
		url,
		http.NoBody,
	)
	r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))

	res, err := a.Test(r)
	require.NoError(t, err)

	return res
}

// buildPopulatedServer creates a server with a registered user who has a family,
// a family membership, and a location. Returns the app, access token, and the
// timestamp from just before the data was created.
func buildPopulatedServer(t *testing.T, email string) (*fiber.App, models.Access, time.Time) {
	t.Helper()

	a := createServer(t)
	before := time.Now().Add(-time.Second)

	access := registerUser(t, a, email, "password", "john", "doe")
	family := createFamily(t, a, access, "The Doe Family")
	createFamilyMember(t, a, access, family.ID)
	createLocation(t, a, access, 40.7128, -74.0060)

	return a, access, before
}

func TestGetSyncData(t *testing.T) {
	t.Run("ok", func(t *testing.T) {
		t.Parallel()

		a, access, before := buildPopulatedServer(t, "sync-ok@email.com")

		res := syncRequest(t, a, access, before.Format(time.RFC3339))
		defer res.Body.Close()
		assert.Equal(t, http.StatusOK, res.StatusCode)

		var sd models.SyncData
		err := json.NewDecoder(res.Body).Decode(&sd)
		require.NoError(t, err)

		assert.NotEmpty(t, sd.Users, "expected at least one user")
		assert.NotEmpty(t, sd.Families, "expected at least one family")
		assert.NotEmpty(t, sd.FamilyMembers, "expected at least one family member")
		assert.NotEmpty(t, sd.Locations, "expected at least one location")
	})

	t.Run("empty with future after date", func(t *testing.T) {
		t.Parallel()

		a, access, _ := buildPopulatedServer(t, "sync-future@email.com")
		futureDate := time.Now().Add(24 * time.Hour)

		res := syncRequest(t, a, access, futureDate.Format(time.RFC3339))
		defer res.Body.Close()
		assert.Equal(t, http.StatusOK, res.StatusCode)

		var sd models.SyncData
		err := json.NewDecoder(res.Body).Decode(&sd)
		require.NoError(t, err)

		assert.Empty(t, sd.Users, "expected no users")
		assert.Empty(t, sd.Families, "expected no families")
		assert.Empty(t, sd.FamilyMembers, "expected no family members")
		assert.Empty(t, sd.Locations, "expected no locations")
	})

	t.Run("unauthorized", func(t *testing.T) {
		t.Parallel()

		a := createServer(t)
		after := time.Now().Add(-time.Hour).Format(time.RFC3339)

		r := httptest.NewRequestWithContext(
			t.Context(),
			http.MethodGet,
			fmt.Sprintf("/api/sync?after=%s", after),
			http.NoBody,
		)

		res, err := a.Test(r)
		require.NoError(t, err)
		defer res.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, res.StatusCode)
	})

	t.Run("missing after param", func(t *testing.T) {
		t.Parallel()

		a := createServer(t)
		access := registerUser(t, a, "sync-missing-after@email.com", "password", "john", "doe")

		res := syncRequest(t, a, access, "")
		defer res.Body.Close()
		assert.Equal(t, http.StatusBadRequest, res.StatusCode)
	})

	t.Run("malformed after param", func(t *testing.T) {
		t.Parallel()

		a := createServer(t)
		access := registerUser(t, a, "sync-bad-after@email.com", "password", "john", "doe")

		res := syncRequest(t, a, access, "not-a-date")
		defer res.Body.Close()
		assert.Equal(t, http.StatusBadRequest, res.StatusCode)
	})

	t.Run("scoped to user families", func(t *testing.T) {
		t.Parallel()

		a := createServer(t)
		before := time.Now().Add(-time.Second)

		// User A: has a family, member, and location
		accessA := registerUser(t, a, "sync-scope-a@email.com", "password", "alice", "smith")
		familyA := createFamily(t, a, accessA, "Smith Family")
		createFamilyMember(t, a, accessA, familyA.ID)
		createLocation(t, a, accessA, 40.7128, -74.0060)

		// User B: has a separate family, member, and location
		accessB := registerUser(t, a, "sync-scope-b@email.com", "password", "bob", "jones")
		familyB := createFamily(t, a, accessB, "Jones Family")
		createFamilyMember(t, a, accessB, familyB.ID)
		createLocation(t, a, accessB, 34.0522, -118.2437)

		// Sync as user A — should not see user B's data
		res := syncRequest(t, a, accessA, before.Format(time.RFC3339))
		defer res.Body.Close()
		assert.Equal(t, http.StatusOK, res.StatusCode)

		var sd models.SyncData
		err := json.NewDecoder(res.Body).Decode(&sd)
		require.NoError(t, err)

		// User A should see exactly their own data
		assert.Len(t, sd.Families, 1, "expected exactly one family")
		assert.Equal(t, familyA.ID, sd.Families[0].ID)

		assert.Len(t, sd.FamilyMembers, 1, "expected exactly one family member")
		assert.Len(t, sd.Locations, 1, "expected exactly one location")

		// Verify none of user B's data leaked through
		for _, u := range sd.Users {
			assert.NotEqual(t, "sync-scope-b@email.com", u.Email, "user B should not appear in user A's sync")
		}
		for _, f := range sd.Families {
			assert.NotEqual(t, familyB.ID, f.ID, "user B's family should not appear in user A's sync")
		}
	})
}
