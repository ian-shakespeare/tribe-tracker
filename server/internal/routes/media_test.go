package routes_test

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/ian-shakespeare/tribe-tracker/server/testdata"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateMedia(t *testing.T) {
	testCases := []struct {
		name               string
		inputFile          string
		expectStatus       int
		expectBodyContains []string
		buildAccess        func(*testing.T, *fiber.App) models.Access
	}{
		{
			name:               "ok large jpg",
			inputFile:          `large.jpg`,
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"id", "contentType", "size", "createdAt"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-ok@email.com", "password", "john", "doe")
			},
		},
		{
			name:               "ok large png",
			inputFile:          `large.png`,
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"id", "contentType", "size", "createdAt"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-ok@email.com", "password", "john", "doe")
			},
		},
		{
			name:               "ok large heic",
			inputFile:          `large.heic`,
			expectStatus:       http.StatusCreated,
			expectBodyContains: []string{"id", "contentType", "size", "createdAt"},
			buildAccess: func(t *testing.T, a *fiber.App) models.Access {
				return registerUser(t, a, "create-family-ok@email.com", "password", "john", "doe")
			},
		},
		{
			name:         "unauthorized",
			inputFile:    "large.jpg",
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

			b := new(bytes.Buffer)
			writer := multipart.NewWriter(b)

			filePart, err := writer.CreateFormFile("file", tc.inputFile)
			require.NoError(t, err)

			fin, err := testdata.FS.Open(tc.inputFile)
			require.NoError(t, err)
			defer fin.Close()

			_, err = io.Copy(filePart, fin)
			require.NoError(t, err)
			_ = writer.Close()

			r := httptest.NewRequestWithContext(
				t.Context(),
				http.MethodPost,
				"/api/media",
				b,
			)
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))
			r.Header.Set("Content-Type", writer.FormDataContentType())

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
