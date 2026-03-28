package routes_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
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

func uploadMedia(t *testing.T, a *fiber.App, access models.Access, filename string) models.Media {
	t.Helper()

	b := new(bytes.Buffer)
	writer := multipart.NewWriter(b)

	filePart, err := writer.CreateFormFile("file", filename)
	require.NoError(t, err)

	fin, err := testdata.FS.Open(filename)
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
	require.Equal(t, http.StatusCreated, res.StatusCode)
	defer res.Body.Close()

	var m models.Media
	err = json.NewDecoder(res.Body).Decode(&m)
	require.NoError(t, err)

	return m
}

func TestGetMedia(t *testing.T) {
	testCases := []struct {
		name         string
		mediaId      func(t *testing.T, a *fiber.App) string
		withAuth     bool
		expectStatus int
	}{
		{
			name: "ok",
			mediaId: func(t *testing.T, a *fiber.App) string {
				access := registerUser(t, a, "get-media-ok@email.com", "password", "john", "doe")
				m := uploadMedia(t, a, access, "small.jpg")
				return m.ID
			},
			withAuth:     true,
			expectStatus: http.StatusOK,
		},
		{
			name: "not found",
			mediaId: func(_ *testing.T, _ *fiber.App) string {
				return uuid.New().String()
			},
			expectStatus: http.StatusNotFound,
		},
		{
			name: "ok without auth",
			mediaId: func(t *testing.T, a *fiber.App) string {
				access := registerUser(t, a, "get-media-no-auth@email.com", "password", "john", "doe")
				m := uploadMedia(t, a, access, "small.jpg")
				return m.ID
			},
			withAuth:     false,
			expectStatus: http.StatusOK,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			a := createServer(t)
			mediaId := tc.mediaId(t, a)

			r := httptest.NewRequestWithContext(
				t.Context(),
				http.MethodGet,
				fmt.Sprintf("/api/media/%s", mediaId),
				http.NoBody,
			)

			if tc.withAuth {
				access := registerUser(t, a, "get-media-auth@email.com", "password", "john", "doe")
				r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", access.AccessToken))
			}

			res, err := a.Test(r)
			require.NoError(t, err)
			assert.Equal(t, tc.expectStatus, res.StatusCode)
			defer res.Body.Close()
		})
	}
}
