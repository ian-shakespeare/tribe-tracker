package app

import (
	"context"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/models"
)

type UpdateMeRequest struct {
	Body struct {
		FirstName *string `json:"firstName,omitempty"`
		LastName  *string `json:"lastName,omitempty"`
	}
}

type UpdateMeResponse struct {
	Body models.User
}

func (a *App) UpdateMe(ctx context.Context, req *UpdateMeRequest) (*UpdateMeResponse, error) {
	var firstName, lastName *string

	if req.Body.FirstName != nil {
		firstName = req.Body.FirstName

		if len(*firstName) < 2 {
			return nil, huma.Error400BadRequest("First name must be at least 2 characters.")
		}

		if len(*firstName) > 64 {
			return nil, huma.Error400BadRequest("First name must be less than 64 characters.")
		}
	}

	if req.Body.LastName != nil {
		lastName = req.Body.LastName

		if len(*lastName) < 2 {
			return nil, huma.Error400BadRequest("Last name must be at least 2 characters.")
		}

		if len(*lastName) > 64 {
			return nil, huma.Error400BadRequest("Last name must be less than 64 characters.")
		}
	}

	userId := ctxToUserId(ctx)

	user, err := a.db.UpdateUser(ctx, database.UpdateUserParams{
		UserUuid:  userId,
		FirstName: firstName,
		LastName:  lastName,
	})
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to update database record.")
	}

	var res UpdateMeResponse
	res.Body.ID = user.UserUuid.String()
	res.Body.Email = user.Email
	res.Body.FirstName = user.FirstName
	res.Body.LastName = user.LastName
	res.Body.CreatedAt = time.Unix(user.CreatedAt, 0)
	res.Body.UpdatedAt = time.Unix(user.UpdatedAt, 0)
	res.Body.Avatar = user.Avatar

	return &res, nil
}
