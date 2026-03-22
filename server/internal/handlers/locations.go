package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

func CreateLocation(ctx context.Context, q *database.Queries, userId uuid.UUID, nl models.NewLocation) (models.Location, *fiber.Error) {
	var l models.Location

	created, err := q.CreateLocation(ctx, database.CreateLocationParams{
		LocationUuid: uuid.New(),
		UserUuid:     userId,
		Lat:          nl.Lat,
		Lon:          nl.Lon,
	})
	if err != nil {
		return l, fiber.NewError(http.StatusInternalServerError, "Failed to create location record.")
	}

	l.ID = created.LocationUuid.String()
	l.User = userId.String()
	l.CreatedAt = time.Unix(created.CreatedAt, 0)
	l.Lat = created.Lat
	l.Lon = created.Lon

	return l, nil
}
