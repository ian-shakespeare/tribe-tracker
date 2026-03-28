package routes

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	_ "github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

// getSyncData godoc
//
//	@Summary		Get sync data
//	@Description	Get recent sync data.
//	@Tags			Location
//	@Produce		json
//	@Param			after	query		string	true	"After"
//	@Success		200		{object}	models.SyncData		"Sync data"
//	@Failure		400		{string}	string				"Bad request"
//	@Failure		401		{string}	string				"Unauthorized"
//	@Failure		500		{string}	string				"Server error"
//	@Router			/api/families [post]
func getSyncData(c fiber.Ctx) error {
	afterStr := c.Query("after")
	after, err := time.Parse(afterStr, time.RFC3339)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid after date.")
	}

	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	userId, err := getUserId(c)
	if err != nil {
		return err
	}

	sd, err := handlers.GetSyncData(c.Context(), dbSrv.Queries, userId, after)
	if err != nil {
		return err
	}

	return c.JSON(sd)
}
