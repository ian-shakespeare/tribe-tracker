package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

// getHealth godoc
//
//	@Summary		Get service health
//	@Description	Get service health state.
//	@Tags			Meta
//	@Produce		text/plain
//	@Success		200	{object}	models.Health	"Service health"
//	@Failure		404	{string}	string	"Router failed"
//	@Failure		500	{string}	string	"Server error"
//	@Router			/api/health [get]
func getHealth(c fiber.Ctx) error {
	var h models.Health
	h.Status = "OK"

	return c.JSON(h)
}
