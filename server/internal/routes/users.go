package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

// updateMe godoc
//
//	@Summary		Update me
//	@Description	Update the calling user.
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.UpdateUser	true	"User details"
//	@Success		200		{object}	models.User			"Updated user"
//	@Failure		400		{string}	string				"Bad request"
//	@Failure		401		{string}	string				"Unauthorized"
//	@Failure		409		{string}	string				"Email already in use"
//	@Failure		500		{string}	string				"Server error"
//	@Router			/api/users/me [patch]
func updateMe(c fiber.Ctx) error {
	var uu models.UpdateUser

	if err := json.Unmarshal(c.Body(), &uu); err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid request body.")
	}

	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	userId, err := getUserId(c)
	if err != nil {
		return err
	}

	user, err := handlers.UpdateMe(c.Context(), dbSrv.Queries, userId, uu)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(user)
}
