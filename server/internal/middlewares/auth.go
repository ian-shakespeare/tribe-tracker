package middlewares

import (
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
)

func Authorize(c fiber.Ctx) error {
	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	signingKey, ok := fiber.GetState[[]byte](c.App().State(), "signingKey")
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve signing key.")
	}

	bearer := c.Get("Authorization")
	tokenParts := strings.Split(bearer, "Bearer ")
	if len(tokenParts) < 2 {
		return c.Status(http.StatusUnauthorized).SendString("Invalid token header.")
	}
	token := tokenParts[1]

	var claims jwt.RegisteredClaims
	_, err := jwt.ParseWithClaims(token, &claims, func(t *jwt.Token) (any, error) {
		return signingKey, nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	if err != nil {
		return c.Status(http.StatusUnauthorized).SendString("Invalid token.")
	}

	userId, err := uuid.Parse(claims.Subject)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid user ID.")
	}

	user, err := dbSrv.Queries.GetUser(c.Context(), userId)
	if err != nil {
		return c.Status(http.StatusUnauthorized).SendString("User not found.")
	}

	c.Set("User-Id", user.UserUuid.String())

	return c.Next()
}
