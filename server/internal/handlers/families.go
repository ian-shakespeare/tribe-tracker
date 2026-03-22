package handlers

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"modernc.org/sqlite"
	sqlite3 "modernc.org/sqlite/lib"
)

func CreateFamily(ctx context.Context, q *database.Queries, userId uuid.UUID, nf models.NewFamily) (models.Family, *fiber.Error) {
	var f models.Family

	if len(nf.Name) < 2 {
		return f, fiber.NewError(http.StatusBadRequest, "Name must be at least 2 characters.")
	}

	if len(nf.Name) > 64 {
		return f, fiber.NewError(http.StatusBadRequest, "Name must be less than 64 characters.")
	}

	family, err := q.CreateFamily(ctx, database.CreateFamilyParams{
		FamilyUuid: uuid.New(),
		UserUuid:   userId,
		Name:       nf.Name,
	})
	if err != nil {
		sqlErr := new(sqlite.Error)
		if errors.As(err, &sqlErr) {
			if sqlErr.Code() == sqlite3.SQLITE_CONSTRAINT_FOREIGNKEY {
				return f, fiber.NewError(http.StatusNotFound, "User not found.")
			}
		}

		return f, fiber.NewError(http.StatusInternalServerError, "Failed to create family record.")
	}

	f.ID = family.FamilyUuid.String()
	f.Name = family.Name
	f.CreatedBy = userId.String()
	f.CreatedAt = time.Unix(family.CreatedAt, 0)
	f.UpdatedAt = time.Unix(family.UpdatedAt, 0)

	return f, nil
}

func CreateFamilyMember(ctx context.Context, q *database.Queries, familyId, userId uuid.UUID) (models.FamilyMember, *fiber.Error) {
	var fm models.FamilyMember

	created, err := q.CreateFamilyMember(ctx, database.CreateFamilyMemberParams{
		UserUuid:   userId,
		FamilyUuid: familyId,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fm, fiber.NewError(http.StatusNotFound, "Family not found.")
		}

		return fm, fiber.NewError(http.StatusInternalServerError, "Failed to create family member record.")
	}

	fm.User = userId.String()
	fm.Family = familyId.String()
	fm.CreatedAt = time.Unix(created.CreatedAt, 0)

	return fm, nil
}
