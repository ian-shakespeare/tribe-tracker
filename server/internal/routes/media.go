package routes

import (
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	_ "github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

// createMedia godoc
//
//	@Summary		Create media
//	@Description	Create a new media file.
//	@Tags			Media
//	@Accept			multipart/form-data
//	@Produce		json
//	@Param			file	formData		file	true	"File"
//	@Success		201		{object}	models.Media			"Created media"
//	@Failure		400		{string}	string				"Bad request"
//	@Failure		401		{string}	string				"Unauthorized"
//	@Failure		500		{string}	string				"Server error"
//	@Router			/api/media [post]
func createMedia(c fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid request body." + err.Error())
	}

	files, ok := form.File["file"]
	if !ok || len(files) != 1 {
		return c.Status(http.StatusBadRequest).SendString("Request must contain exactly one file.")
	}

	file, err := files[0].Open()
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Failed to open form file.")
	}

	storageSrv, ok := fiber.GetService[*services.Storage](c.App().State(), services.StorageName)
	if !ok {
		_ = file.Close()
		return c.Status(http.StatusInternalServerError).SendString("Failed to get storage service.")
	}

	media, err := handlers.CreateMedia(c.Context(), storageSrv, file)
	_ = file.Close()
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(media)
}
