package app

import (
	"context"
	"encoding/json"

	"github.com/danielgtaylor/huma/v2"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/models"
)

type CreateLocationRequest struct {
	Body struct {
		Lat float32 `json:"lat"`
		Lon float32 `json:"lon"`
	}
}

type CreateLocationResponse struct {
	Body models.Location
}

func (a *App) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*CreateLocationResponse, error) {
	created, err := a.db.CreateLocation(ctx, database.CreateLocationParams{
		UserUuid: ctxToUserId(ctx),
		Lat:      req.Body.Lat,
		Lon:      req.Body.Lon,
	})
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to create location record." + err.Error())
	}

	var res CreateLocationResponse
	res.Body.ID = created.LocationUuid.String()
	res.Body.User = created.UserUuid.String()
	res.Body.CreatedAt = created.CreatedAt

	if err := json.Unmarshal(created.Coordinates, &res.Body.Coordinates); err != nil {
		return nil, huma.Error500InternalServerError("Created invalid coordinates.")
	}

	return &res, nil
}
