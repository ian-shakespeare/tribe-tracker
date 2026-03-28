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

func UpdateMe(ctx context.Context, q *database.Queries, userId uuid.UUID, uu models.UpdateUser) (models.User, error) {
	var u models.User
	var firstName, lastName *string

	if uu.FirstName != nil {
		firstName = uu.FirstName

		if len(*firstName) < 2 {
			return u, fiber.NewError(http.StatusBadRequest, "First name must be at least 2 characters.")
		}

		if len(*firstName) > 64 {
			return u, fiber.NewError(http.StatusBadRequest, "First name must be less than 64 characters.")
		}
	}

	if uu.LastName != nil {
		lastName = uu.LastName

		if len(*lastName) < 2 {
			return u, fiber.NewError(http.StatusBadRequest, "Last name must be at least 2 characters.")
		}

		if len(*lastName) > 64 {
			return u, fiber.NewError(http.StatusBadRequest, "Last name must be less than 64 characters.")
		}
	}

	user, err := q.UpdateUser(ctx, database.UpdateUserParams{
		UserUuid:  userId,
		FirstName: firstName,
		LastName:  lastName,
	})
	if err != nil {
		return u, fiber.NewError(http.StatusInternalServerError, "Failed to update database record.")
	}

	u.ID = user.UserUuid.String()
	u.Email = user.Email
	u.FirstName = user.FirstName
	u.LastName = user.LastName
	u.CreatedAt = time.Unix(user.CreatedAt, 0)
	u.UpdatedAt = time.Unix(user.UpdatedAt, 0)
	u.Avatar = user.Avatar

	return u, nil
}
