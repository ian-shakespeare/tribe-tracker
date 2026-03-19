package app

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"modernc.org/sqlite"
	"modernc.org/sqlite/lib"
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

	userId := ctxToUserId(ctx)
	family, err := a.db.CreateFamily(ctx, database.CreateFamilyParams{
		FamilyUuid: uuid.New(),
		UserUuid:   userId,
		Name:       req.Body.Name,
	})
	if err != nil {
		sqlErr := new(sqlite.Error)
		if errors.As(err, &sqlErr) {
			if sqlErr.Code() == sqlite3.SQLITE_CONSTRAINT_FOREIGNKEY {
				return nil, huma.Error404NotFound("User not found.")
			}
		}

		return nil, huma.Error500InternalServerError("Failed to create family record.")
	}

	var res CreateFamilyResponse
	res.Body.ID = family.FamilyUuid.String()
	res.Body.Name = family.Name
	res.Body.CreatedBy = userId.String()
	res.Body.CreatedAt = time.Unix(family.CreatedAt, 0)
	res.Body.UpdatedAt = time.Unix(family.UpdatedAt, 0)

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

	userId := ctxToUserId(ctx)
	familyMember, err := a.db.CreateFamilyMember(ctx, database.CreateFamilyMemberParams{
		UserUuid:   userId,
		FamilyUuid: familyId,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, huma.Error404NotFound("Family not found.")
		}

		return nil, huma.Error500InternalServerError("Failed to create family member record.")
	}

	var res CreateFamilyMemberResponse
	res.Body.User = userId.String()
	res.Body.Family = familyId.String()
	res.Body.CreatedAt = time.Unix(familyMember.CreatedAt, 0)

	return &res, nil
}
