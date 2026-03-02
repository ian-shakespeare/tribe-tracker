package app

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type Access struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	Expiry       time.Time `json:"expiry"`
}

type RegisterUserRequest struct {
	Body struct {
		Email     string `json:"email"`
		Password  string `json:"password"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
	}
}

type AuthResponse struct {
	Status int
	Body   Access
}

func (a *App) RegisterUser(ctx context.Context, req *RegisterUserRequest) (*AuthResponse, error) {
	if len(req.Body.Email) < 5 {
		return nil, huma.Error400BadRequest("Email must be at least 5 characters.")
	}

	if len(req.Body.Email) > 255 {
		return nil, huma.Error400BadRequest("Email must be less than 255 characters.")
	}

	if len(req.Body.Password) < 8 {
		return nil, huma.Error400BadRequest("Password must be at least 8 characters.")
	}

	if len(req.Body.FirstName) < 2 {
		return nil, huma.Error400BadRequest("First name must be at least 2 characters.")
	}

	if len(req.Body.FirstName) > 64 {
		return nil, huma.Error400BadRequest("First name must be less than 64 characters.")
	}

	if len(req.Body.LastName) < 2 {
		return nil, huma.Error400BadRequest("Last name must be at least 2 characters.")
	}

	if len(req.Body.LastName) > 64 {
		return nil, huma.Error400BadRequest("Last name must be less than 64 characters.")
	}

	passwordDigest, err := bcrypt.GenerateFromPassword([]byte(req.Body.Password), 12)
	if err != nil {
		return nil, huma.Error400BadRequest("Password must be less than 72 characters.")
	}

	user, err := a.db.CreateUser(ctx, database.CreateUserParams{
		Email:          req.Body.Email,
		PasswordDigest: string(passwordDigest),
		FirstName:      req.Body.FirstName,
		LastName:       req.Body.LastName,
	})
	if err != nil {
		pqErr := new(pq.Error)
		if errors.As(err, &pqErr) {
			if pqErr.Code.Name() == "unique_violation" {
				return nil, huma.Error409Conflict("Email already in use.")
			}
		}

		return nil, huma.Error500InternalServerError("Failed to create user record.")
	}

	session, err := a.db.CreateSession(ctx, user.UserUuid)
	if err != nil {
		fmt.Printf("Error: %s", err.Error())
		return nil, huma.Error500InternalServerError("Failed to create session.")
	}

	expiry := getExpiry()
	signed, err := createAndSignToken(a.signingKey, expiry, user.UserUuid)
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to sign access token.")
	}

	return &AuthResponse{
		Status: http.StatusCreated,
		Body: Access{
			AccessToken:  signed,
			RefreshToken: session.RefreshToken.String(),
			Expiry:       expiry,
		},
	}, nil
}

type SignInRequest struct {
	Body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
}

func (a *App) SignIn(ctx context.Context, req *SignInRequest) (*AuthResponse, error) {
	user, err := a.db.GetUserByEmail(ctx, req.Body.Email)
	if err != nil {
		return nil, huma.Error404NotFound("User not found.")
	}

	passwordDigest, err := a.db.GetUserPasswordDigest(ctx, user.UserUuid)
	if err != nil {
		return nil, huma.Error404NotFound("User not found.")
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordDigest), []byte(req.Body.Password))
	if err != nil {
		return nil, huma.Error404NotFound("User not found.")
	}

	session, err := a.db.CreateSession(ctx, user.UserUuid)
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to create session.")
	}

	expiry := getExpiry()
	signed, err := createAndSignToken(a.signingKey, expiry, user.UserUuid)
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to sign access token.")
	}

	return &AuthResponse{
		Status: http.StatusCreated,
		Body: Access{
			AccessToken:  signed,
			RefreshToken: session.RefreshToken.String(),
			Expiry:       expiry,
		},
	}, nil
}

type RefreshRequest struct {
	Body struct {
		RefreshToken string `json:"refreshToken"`
	}
}

func (a *App) RefreshToken(ctx context.Context, req *RefreshRequest) (*AuthResponse, error) {
	refreshToken, err := uuid.Parse(req.Body.RefreshToken)
	if err != nil {
		return nil, huma.Error401Unauthorized("Invalid refresh token.")
	}

	session, err := a.db.RefreshSession(ctx, refreshToken)
	if err != nil {
		return nil, huma.Error404NotFound("User not found.")
	}

	user, err := a.db.GetSessionUser(ctx, session.RefreshToken)
	if err != nil {
		return nil, huma.Error404NotFound("User not found.")
	}

	expiry := getExpiry()
	signed, err := createAndSignToken(a.signingKey, expiry, user.UserUuid)
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to sign access token.")
	}

	return &AuthResponse{
		Status: http.StatusCreated,
		Body: Access{
			AccessToken:  signed,
			RefreshToken: session.RefreshToken.String(),
			Expiry:       expiry,
		},
	}, nil
}

func getExpiry() time.Time {
	return time.Now().Add(time.Hour).UTC()
}

func createAndSignToken(signingKey []byte, expiry time.Time, userId uuid.UUID) (string, error) {
	claims := jwt.RegisteredClaims{
		Issuer:    "tribe-tracker-server",
		Subject:   userId.String(),
		ExpiresAt: jwt.NewNumericDate(expiry),
		NotBefore: jwt.NewNumericDate(time.Now().UTC()),
		IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(signingKey)
}
