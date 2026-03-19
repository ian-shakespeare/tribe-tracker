package app

import (
	"context"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/models"
)

type CreateLocationRequest struct {
	Body struct {
		Lat float64 `json:"lat"`
		Lon float64 `json:"lon"`
	}
}

type CreateLocationResponse struct {
	Body models.Location
}

func (a *App) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*CreateLocationResponse, error) {
	userId := ctxToUserId(ctx)

	created, err := a.db.CreateLocation(ctx, database.CreateLocationParams{
		LocationUuid: uuid.New(),
		UserUuid:     userId,
		Lat:          req.Body.Lat,
		Lon:          req.Body.Lon,
	})
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to create location record.")
	}

	var res CreateLocationResponse
	res.Body.ID = created.LocationUuid.String()
	res.Body.User = userId.String()
	res.Body.CreatedAt = time.Unix(created.CreatedAt, 0)
	res.Body.Lat = created.Lat
	res.Body.Lon = created.Lon

	return &res, nil
}
