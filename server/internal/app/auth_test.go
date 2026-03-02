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

func TestRegister(t *testing.T) {
	container, db := createDbContainerAndConnection(t)

	testCases := []struct {
		name               string
		inputBody          string
		expectStatus       int
		expectBodyContains []string
	}{
		{
			name:               "ok",
			inputBody:          `{"email":"register-ok@email.com","password":"password","firstName":"john","lastName":"doe"}`,
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"accessToken", "refreshToken", "expiry"},
		},
		{
			name:         "missing email",
			inputBody:    `{"email":"","password":"password","firstName":"john","lastName":"doe"}`,
			expectStatus: http.StatusBadRequest,
		},
		{
			name:         "empty password",
			inputBody:    `{"email":"register-empty-password@email.com","password":"","firstName":"john","lastName":"doe"}`,
			expectStatus: http.StatusBadRequest,
		},
		{
			name:         "short password",
			inputBody:    `{"email":"register-empty-password@email.com","password":"short","firstName":"john","lastName":"doe"}`,
			expectStatus: http.StatusBadRequest,
		},
		{
			name:         "short first name",
			inputBody:    `{"email":"short-first-name@email.com","password":"password","firstName":"j","lastName":"doe"}`,
			expectStatus: http.StatusBadRequest,
		},
		{
			name:         "long first name",
			inputBody:    `{"email":"long-first-name@email.com","password":"password","firstName":"johnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnj","lastName":"doe"}`,
			expectStatus: http.StatusBadRequest,
		},
		{
			name:         "short last name",
			inputBody:    `{"email":"short-first-name@email.com","password":"password","firstName":"john","lastName":"d"}`,
			expectStatus: http.StatusBadRequest,
		},
		{
			name:         "long last name",
			inputBody:    `{"email":"long-last-name@email.com","password":"password","firstName":"john","lastName":"doedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoe"}`,
			expectStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := httptest.NewRequestWithContext(
				t.Context(),
				http.MethodPost,
				"/api/register",
				strings.NewReader(tc.inputBody),
			)
			a := app.New(db, []byte("test-signing-key"))

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

	testcontainers.CleanupContainer(t, container)
}

func TestSignIn(t *testing.T) {
	container, db := createDbContainerAndConnection(t)

	testCases := []struct {
		name               string
		inputBody          string
		expectStatus       int
		expectBodyContains []string
		onBeforeTest       func(*testing.T, *app.App)
	}{
		{
			name:               "ok",
			inputBody:          `{"email":"sign-in-ok@email.com","password":"password"}`,
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"accessToken", "refreshToken", "expiry"},
			onBeforeTest: func(t *testing.T, a *app.App) {
				registerUser(t, a, "sign-in-ok@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "incorrect-password",
			inputBody:    `{"email":"incorrect-password@email.com","password":"bad"}`,
			expectStatus: http.StatusNotFound,
			onBeforeTest: func(t *testing.T, a *app.App) {
				registerUser(t, a, "incorrect-password@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "user not found",
			inputBody:    `{"email":"user-not-found@email.com","password":"password"}`,
			expectStatus: http.StatusNotFound,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := httptest.NewRequestWithContext(
				t.Context(),
				http.MethodPost,
				"/api/sign-in",
				strings.NewReader(tc.inputBody),
			)
			a := app.New(db, []byte("test-signing-key"))

			if tc.onBeforeTest != nil {
				tc.onBeforeTest(t, a)
			}

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

	testcontainers.CleanupContainer(t, container)
}

func TestRefreshToken(t *testing.T) {
	container, db := createDbContainerAndConnection(t)

	testCases := []struct {
		name               string
		expectStatus       int
		expectBodyContains []string
		buildRefreshToken  func(*testing.T, *app.App) string
	}{
		{
			name:               "ok",
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"accessToken", "refreshToken", "expiry"},
			buildRefreshToken: func(t *testing.T, a *app.App) string {
				access := registerUser(t, a, "refresh-ok@email.com", "password", "john", "doe")
				return access.RefreshToken
			},
		},
		{
			name:         "incorrect-password",
			expectStatus: http.StatusUnauthorized,
			buildRefreshToken: func(t *testing.T, a *app.App) string {
				return ""
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			a := app.New(db, []byte("test-signing-key"))
			refreshToken := tc.buildRefreshToken(t, a)
			refreshTokenJson := fmt.Sprintf(`{"refreshToken":"%s"}`, refreshToken)

			r := httptest.NewRequestWithContext(
				t.Context(),
				http.MethodPost,
				"/api/refresh",
				strings.NewReader(refreshTokenJson),
			)

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

	testcontainers.CleanupContainer(t, container)
}
