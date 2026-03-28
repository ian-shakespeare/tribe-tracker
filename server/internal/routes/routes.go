package routes

import (
	"net/http"

	"github.com/gofiber/fiber/v3"
	recoverer "github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/middlewares"
)

func Register(r fiber.Router) {
	api := r.Group("/api")
	api.Use(recoverer.New())

	auth := api.Group("auth")
	auth.Post("/register", registerUser)
	auth.Post("/sign-in", signIn)
	auth.Post("/refresh", refreshToken)

	users := api.Group("users", middlewares.Authorize)
	users.Patch("/me", updateMe)

	families := api.Group("families", middlewares.Authorize)
	families.Post("/", createFamily)
	families.Post("/:familyId/members", createFamilyMember)

	locations := api.Group("locations", middlewares.Authorize)
	locations.Post("/", createLocation)

	media := api.Group("media", middlewares.Authorize)
	// media.Get("/:mediaId", nil)
	media.Post("/", createMedia)
}

func getUserId(c fiber.Ctx) (uuid.UUID, *fiber.Error) {
	userIdStr, ok := c.Locals("User-Id").(string)
	if !ok || userIdStr == "" {
		return uuid.Nil, fiber.NewError(http.StatusUnauthorized, "Must be signed in to access this route.")
	}

	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		return uuid.Nil, fiber.NewError(http.StatusUnauthorized, "Invalid user ID.")
	}

	return userId, nil
}
