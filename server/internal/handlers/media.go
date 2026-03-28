package handlers

import (
	"bytes"
	"context"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"

	"github.com/gabriel-vasile/mimetype"
	"github.com/gen2brain/heic"
	"github.com/gofiber/fiber/v3"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/resize"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

func CreateMedia(ctx context.Context, s *services.Storage, r io.Reader) (models.Media, error) {
	var m models.Media

	b := new(bytes.Buffer)
	tr := io.TeeReader(r, b)

	mt, err := mimetype.DetectReader(tr)
	if err != nil {
		return m, fiber.NewError(http.StatusBadRequest, "Failed to detect content type.")
	}

	mr := io.MultiReader(b, r)

	var img image.Image
	switch {
	case mt.Is("image/jpeg"):
		img, err = jpeg.Decode(mr)
	case mt.Is("image/png"):
		img, err = png.Decode(mr)
	case mt.Is("image/heic"), mt.Is("image/heif"):
		img, err = heic.Decode(mr)
	default:
		return m, fiber.NewError(http.StatusUnsupportedMediaType, "Must be a JPEG, PNG, or HEIC file.")
	}
	if err != nil {
		return m, fiber.NewError(http.StatusBadRequest, "Invalid image file.")
	}

	resized := resize.NearestNeighbor(img)

	b.Reset()
	if err := png.Encode(b, resized); err != nil {
		return m, fiber.NewError(http.StatusInternalServerError, "Failed to convert image.")
	}

	m, err = s.CreateFile("image/png", b)
	if err != nil {
		return m, fiber.NewError(http.StatusInternalServerError, "Failed to save image.")
	}

	return m, nil
}
