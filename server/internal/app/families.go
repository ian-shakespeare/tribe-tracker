package app

import (
	"context"
	"database/sql"
	"errors"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/models"
	"github.com/lib/pq"
)

type CreateFamilyRequest struct {
	Body struct {
		Name string `json:"name"`
	}
}

type CreateFamilyResponse struct {
	Body models.Family
}

func (a *App) CreateFamily(ctx context.Context, req *CreateFamilyRequest) (*CreateFamilyResponse, error) {
	if len(req.Body.Name) < 2 {
		return nil, huma.Error400BadRequest("Name must be at least 2 characters.")
	}

	if len(req.Body.Name) > 64 {
		return nil, huma.Error400BadRequest("Name must be less than 64 characters.")
	}

	family, err := a.db.CreateFamily(ctx, database.CreateFamilyParams{
		UserUuid: ctxToUserId(ctx),
		Name:     req.Body.Name,
	})
	if err != nil {
		pqErr := new(pq.Error)
		if errors.As(err, &pqErr) {
			if pqErr.Code.Name() == "foreign_key_violation" {
				return nil, huma.Error404NotFound("User not found.")
			}
		}

		return nil, huma.Error500InternalServerError("Failed to create family record.")
	}

	var res CreateFamilyResponse
	res.Body.ID = family.FamilyUuid.String()
	res.Body.Name = family.Name
	res.Body.CreatedBy = family.UserUuid.String()
	res.Body.CreatedAt = family.CreatedAt
	res.Body.UpdatedAt = family.UpdatedAt

	return &res, nil
}

type CreateFamilyMemberRequest struct {
	FamilyID string `path:"familyId"`
}

type CreateFamilyMemberResponse struct {
	Body models.FamilyMember
}

func (a *App) CreateFamilyMember(ctx context.Context, req *CreateFamilyMemberRequest) (*CreateFamilyMemberResponse, error) {
	familyId, err := uuid.Parse(req.FamilyID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid family ID.")
	}

	familyMember, err := a.db.CreateFamilyMember(ctx, database.CreateFamilyMemberParams{
		UserUuid:   ctxToUserId(ctx),
		FamilyUuid: familyId,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, huma.Error404NotFound("Family not found.")
		}

		return nil, huma.Error500InternalServerError("Failed to create family member record." + err.Error())
	}

	var res CreateFamilyMemberResponse
	res.Body.User = familyMember.UserUuid.String()
	res.Body.Family = familyMember.FamilyUuid.String()
	res.Body.CreatedAt = familyMember.CreatedAt

	return &res, nil
}
