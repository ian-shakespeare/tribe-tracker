package routes

import (
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/middlewares"
)

func Register(r fiber.Router) {
	api := r.Group("/api")

	auth := api.Group("auth")
	auth.Post("/register", registerUser)
	auth.Post("/sign-in", signIn)
	auth.Post("/refresh", refreshToken)

	users := api.Group("users")
	users.Use(middlewares.Authorize)
	users.Patch("/me", updateMe)

	families := api.Group("families")
	families.Use(middlewares.Authorize)
	families.Post("/", createFamily)
	families.Post("/:familyId/members", createFamilyMember)

	locations := api.Group("locations")
	locations.Use(middlewares.Authorize)
	locations.Post("/", createLocation)
}

func getUserId(c fiber.Ctx) (uuid.UUID, *fiber.Error) {
	userIdStr := c.Get("User-Id")
	if userIdStr == "" {
		return uuid.Nil, fiber.NewError(http.StatusUnauthorized, "Must be signed in to access this route.")
	}

	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		return uuid.Nil, fiber.NewError(http.StatusUnauthorized, "Invalid user ID.")
	}

	return userId, nil
}
