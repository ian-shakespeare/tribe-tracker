package app_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ian-shakespeare/tribe-tracker/server/internal/app"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHealthCheck(t *testing.T) {
	t.Run("ok", func(t *testing.T) {
		t.Parallel()

		r := httptest.NewRequestWithContext(t.Context(), "GET", "/api/healthcheck", http.NoBody)
		h := app.New(nil, []byte(""))

		res, err := h.Test(r)
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, res.StatusCode)
		defer res.Body.Close()

		var body app.HealthCheckResponse
		decoder := json.NewDecoder(res.Body)
		err = decoder.Decode(&body)
		require.NoError(t, err)
		assert.Equal(t, "OK", body.Status)
	})
}
