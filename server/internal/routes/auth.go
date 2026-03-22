package routes

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	_ "github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

// registerUser godoc
//
//	@Summary		Register user
//	@Description	Register a new user.
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.NewUser	true	"User details"
//	@Success		201		{object}	models.Access	"Newly created user access and refresh tokens"
//	@Failure		400		{string}	string			"Bad request"
//	@Failure		409		{string}	string			"Email already in use"
//	@Failure		500		{string}	string			"Server error"
//	@Router			/api/auth/register [post]
func registerUser(c fiber.Ctx) error {
	var nu models.NewUser

	if err := json.Unmarshal(c.Body(), &nu); err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid request body.")
	}

	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	signingKey, ok := fiber.GetState[[]byte](c.App().State(), "signingKey")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve signing key.")
	}

	accessExpiry, ok := fiber.GetState[time.Duration](c.App().State(), "accessExpiry")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve access expiry.")
	}

	refreshExpiry, ok := fiber.GetState[time.Duration](c.App().State(), "refreshExpiry")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve refresh expiry.")
	}

	access, err := handlers.RegisterUser(c.Context(), dbSrv.Queries, signingKey, accessExpiry, refreshExpiry, nu)
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(access)
}

// signIn godoc
//
//	@Summary		Sign in
//	@Description	Sign in to an existing account.
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.SignIn	true	"User details"
//	@Success		201		{object}	models.Access	"User access and refresh tokens"
//	@Failure		400		{string}	string			"Bad request"
//	@Failure		404		{string}	string			"User not found"
//	@Failure		500		{string}	string			"Server error"
//	@Router			/api/auth/sign-in [post]
func signIn(c fiber.Ctx) error {
	var si models.SignIn

	if err := json.Unmarshal(c.Body(), &si); err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid request body.")
	}

	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	signingKey, ok := fiber.GetState[[]byte](c.App().State(), "signingKey")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve signing key.")
	}

	accessExpiry, ok := fiber.GetState[time.Duration](c.App().State(), "accessExpiry")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve access expiry.")
	}

	refreshExpiry, ok := fiber.GetState[time.Duration](c.App().State(), "refreshExpiry")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve refresh expiry.")
	}

	access, err := handlers.SignIn(c.Context(), dbSrv.Queries, signingKey, accessExpiry, refreshExpiry, si)
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(access)
}

// refreshToken godoc
//
//	@Summary		RefreshToken
//	@Description	Refresh an existing token.
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.SignIn	true	"User details"
//	@Success		201		{object}	models.Access	"User access and refresh tokens"
//	@Failure		400		{string}	string			"Bad request"
//	@Failure		404		{string}	string			"User not found"
//	@Failure		500		{string}	string			"Server error"
//	@Router			/api/auth/refresh [post]
func refreshToken(c fiber.Ctx) error {
	var r models.Refresh

	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid request body.")
	}

	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	signingKey, ok := fiber.GetState[[]byte](c.App().State(), "signingKey")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve signing key.")
	}

	accessExpiry, ok := fiber.GetState[time.Duration](c.App().State(), "accessExpiry")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve access expiry.")
	}

	refreshExpiry, ok := fiber.GetState[time.Duration](c.App().State(), "refreshExpiry")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve refresh expiry.")
	}

	access, err := handlers.RefreshToken(c.Context(), dbSrv.Queries, signingKey, accessExpiry, refreshExpiry, r)
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(access)
}
