package handlers

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"golang.org/x/crypto/bcrypt"
	"modernc.org/sqlite"
	sqlite3 "modernc.org/sqlite/lib"
)

func RegisterUser(
	ctx context.Context,
	q *database.Queries,
	signingKey []byte,
	accessExpiry, refreshExpiry time.Duration,
	nu models.NewUser,
) (models.Access, *fiber.Error) {
	var a models.Access

	if len(nu.Email) < 5 {
		return a, fiber.NewError(http.StatusBadRequest, "Email must be at least 5 characters.")
	}

	if len(nu.Email) > 255 {
		return a, fiber.NewError(http.StatusBadRequest, "Email must be less than 255 characters.")
	}

	if len(nu.Password) < 8 {
		return a, fiber.NewError(http.StatusBadRequest, "Password must be at least 8 characters.")
	}

	if len(nu.FirstName) < 2 {
		return a, fiber.NewError(http.StatusBadRequest, "First name must be at least 2 characters.")
	}

	if len(nu.FirstName) > 64 {
		return a, fiber.NewError(http.StatusBadRequest, "First name must be less than 64 characters.")
	}

	if len(nu.LastName) < 2 {
		return a, fiber.NewError(http.StatusBadRequest, "Last name must be at least 2 characters.")
	}

	if len(nu.LastName) > 64 {
		return a, fiber.NewError(http.StatusBadRequest, "Last name must be less than 64 characters.")
	}

	passwordDigest, err := bcrypt.GenerateFromPassword([]byte(nu.Password), 12)
	if err != nil {
		return a, fiber.NewError(http.StatusBadRequest, "Password must be less than 72 characters.")
	}

	user, err := q.CreateUser(ctx, database.CreateUserParams{
		UserUuid:       uuid.New(),
		Email:          nu.Email,
		PasswordDigest: string(passwordDigest),
		FirstName:      nu.FirstName,
		LastName:       nu.LastName,
	})
	if err != nil {
		sqlErr := new(sqlite.Error)
		if errors.As(err, &sqlErr) {
			if sqlErr.Code() == sqlite3.SQLITE_CONSTRAINT_UNIQUE {
				return a, fiber.NewError(http.StatusConflict, "Email already in use.")
			}
		}

		return a, fiber.NewError(http.StatusInternalServerError, "Failed to create user record.")
	}

	session, err := q.CreateSession(ctx, database.CreateSessionParams{
		UserUuid:     user.UserUuid,
		RefreshToken: uuid.New(),
		ExpiresAt:    time.Now().Add(refreshExpiry).Unix(),
	})
	if err != nil {
		return a, fiber.NewError(http.StatusInternalServerError, "Failed to create session.")
	}

	expiry := time.Now().Add(accessExpiry)
	signed, err := createAndSignToken(signingKey, expiry, user.UserUuid)
	if err != nil {
		return a, fiber.NewError(http.StatusInternalServerError, "Failed to sign access token.")
	}

	return models.Access{
		AccessToken:  signed,
		RefreshToken: session.RefreshToken.String(),
		Expiry:       expiry,
	}, nil
}

func SignIn(
	ctx context.Context,
	q *database.Queries,
	signingKey []byte,
	accessExpiry, refreshExpiry time.Duration,
	si models.SignIn,
) (models.Access, *fiber.Error) {
	var a models.Access

	user, err := q.GetUserByEmail(ctx, si.Email)
	if err != nil {
		return a, fiber.NewError(http.StatusNotFound, "User not found.")
	}

	passwordDigest, err := q.GetUserPasswordDigest(ctx, user.UserUuid)
	if err != nil {
		return a, fiber.NewError(http.StatusNotFound, "User not found.")
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordDigest), []byte(si.Password))
	if err != nil {
		return a, fiber.NewError(http.StatusNotFound, "User not found.")
	}

	session, err := q.CreateSession(ctx, database.CreateSessionParams{
		UserUuid:     user.UserUuid,
		RefreshToken: uuid.New(),
		ExpiresAt:    time.Now().Add(refreshExpiry).Unix(),
	})
	if err != nil {
		return a, fiber.NewError(http.StatusInternalServerError, "Failed to create session.")
	}

	expiry := time.Now().Add(accessExpiry)
	signed, err := createAndSignToken(signingKey, expiry, user.UserUuid)
	if err != nil {
		return a, fiber.NewError(http.StatusInternalServerError, "Failed to sign access token.")
	}

	return models.Access{
		AccessToken:  signed,
		RefreshToken: session.RefreshToken.String(),
		Expiry:       expiry,
	}, nil
}

func RefreshToken(
	ctx context.Context,
	q *database.Queries,
	signingKey []byte,
	accessExpiry, refreshExpiry time.Duration,
	r models.Refresh,
) (models.Access, *fiber.Error) {
	var a models.Access

	refreshToken, err := uuid.Parse(r.RefreshToken)
	if err != nil {
		return a, fiber.NewError(http.StatusBadRequest, "Invalid refresh token.")
	}

	session, err := q.RefreshSession(ctx, database.RefreshSessionParams{
		RefreshToken:    refreshToken,
		ExpiresAt:       time.Now().Add(refreshExpiry).Unix(),
		NewRefreshToken: uuid.New(),
	})
	if err != nil {
		return a, fiber.NewError(http.StatusNotFound, "User not found.")
	}

	user, err := q.GetSessionUser(ctx, session.RefreshToken)
	if err != nil {
		return a, fiber.NewError(http.StatusNotFound, "User not found.")
	}

	expiry := time.Now().Add(accessExpiry)
	signed, err := createAndSignToken(signingKey, expiry, user.UserUuid)
	if err != nil {
		return a, fiber.NewError(http.StatusInternalServerError, "Failed to sign access token.")
	}

	return models.Access{
		AccessToken:  signed,
		RefreshToken: session.RefreshToken.String(),
		Expiry:       expiry,
	}, nil
}
