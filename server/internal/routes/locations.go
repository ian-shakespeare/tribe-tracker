package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

// createLocation godoc
//
//	@Summary		Create location
//	@Description	Create a new location.
//	@Tags			Location
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.NewFamily	true	"Family details"
//	@Success		201		{object}	models.Family		"Newly created family"
//	@Failure		400		{string}	string				"Bad request"
//	@Failure		401		{string}	string				"Unauthorized"
//	@Failure		500		{string}	string				"Server error"
//	@Router			/api/locations [post]
func createLocation(c fiber.Ctx) error {
	var nl models.NewLocation

	if err := json.Unmarshal(c.Body(), &nl); err != nil {
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

	location, err := handlers.CreateLocation(c.Context(), dbSrv.Queries, userId, nl)
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(location)
}
