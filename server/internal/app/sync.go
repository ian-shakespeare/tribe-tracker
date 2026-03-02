package app

import (
	"context"
	"time"
)

type GetSyncDataRequest struct {
	After time.Time `query:"after"`
}

type GetSyncDataResponse struct {
	Body string
}

func (a *App) GetSyncData(ctx context.Context, req *GetSyncDataRequest) (*GetSyncDataResponse, error) {
	return &GetSyncDataResponse{Body: "Hello!"}, nil
}
