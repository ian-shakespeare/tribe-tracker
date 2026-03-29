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

	api.Get("/health", getHealth)

	auth := api.Group("auth")
	auth.Post("/register", registerUser)
	auth.Post("/sign-in", signIn)
	auth.Post("/refresh", refreshToken)

	users := api.Group("users", middlewares.Authorize)
	users.Get("/me", getMe)
	users.Patch("/me", updateMe)

	families := api.Group("families", middlewares.Authorize)
	families.Post("/", createFamily)
	families.Get("/:familyId", getFamily)
	families.Post("/:familyId/members", createFamilyMember)
	families.Get("/:familyId/members", getFamilyMembers)
	families.Get("/:familyId/members/locations", getFamilyMemberLocations)

	locations := api.Group("locations", middlewares.Authorize)
	locations.Post("/", createLocation)

	api.Get("/media/:mediaId", getMedia)

	media := api.Group("media", middlewares.Authorize)
	media.Post("/", createMedia)

	sync := api.Group("sync", middlewares.Authorize)
	sync.Get("/", getSyncData)
}

func getUserId(c fiber.Ctx) (uuid.UUID, error) {
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
