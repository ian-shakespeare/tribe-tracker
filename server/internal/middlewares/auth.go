package middlewares

import (
	"net/http"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
)

func Authorize(g *huma.Group, q *database.Queries, signingKey []byte) func(ctx huma.Context, next func(huma.Context)) {
	return func(ctx huma.Context, next func(huma.Context)) {
		bearer := ctx.Header("Authorization")
		tokenParts := strings.Split(bearer, "Bearer ")
		if len(tokenParts) < 2 {
			huma.WriteErr(g, ctx, http.StatusUnauthorized, "Invalid token header.")
			return
		}
		token := tokenParts[1]

		var claims jwt.RegisteredClaims
		_, err := jwt.ParseWithClaims(token, &claims, func(t *jwt.Token) (any, error) {
			return signingKey, nil
		}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

		if err != nil {
			huma.WriteErr(g, ctx, http.StatusUnauthorized, "Invalid token.")
			return
		}

		userId, err := uuid.Parse(claims.Subject)
		if err != nil {
			huma.WriteErr(g, ctx, http.StatusBadRequest, "Invalid user ID.")
			return
		}

		user, err := q.GetUser(ctx.Context(), userId)
		if err != nil {
			huma.WriteErr(g, ctx, http.StatusUnauthorized, "User not found.")
			return
		}

		ctx = huma.WithValue(ctx, "user-id", user.UserUuid.String())
		next(ctx)
	}
}
