package app

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humafiber"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
)

type Request[T any] struct {
	Body T
}

type Response[T any] struct {
	Status int
	Body   T
}

func NewResponse[T any](status int, body T) *Response[T] {
	return &Response[T]{
		Status: status,
		Body:   body,
	}
}

type Empty struct{}

type App struct {
	server     *fiber.App
	db         *database.Queries
	signingKey []byte
}

func New(db *sql.DB, signingKey []byte) *App {
	server := fiber.New()
	router := humafiber.New(server, huma.DefaultConfig("Tribe Tracker API", "1.0.0"))

	a := &App{
		db:         database.New(db),
		signingKey: signingKey,
	}

	api := huma.NewGroup(router, "/api")

	authMiddleware := func(ctx huma.Context, next func(huma.Context)) {
		bearer := ctx.Header("Authorization")
		tokenParts := strings.Split(bearer, "Bearer ")
		if len(tokenParts) < 2 {
			huma.WriteErr(api, ctx, http.StatusUnauthorized, "Invalid token header.")
			return
		}
		token := tokenParts[1]

		var claims jwt.RegisteredClaims
		_, err := jwt.ParseWithClaims(token, &claims, func(t *jwt.Token) (any, error) {
			return a.signingKey, nil
		}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

		if err != nil {
			huma.WriteErr(api, ctx, http.StatusUnauthorized, "Invalid token.")
			return
		}

		userId, err := uuid.Parse(claims.Subject)
		if err != nil {
			huma.WriteErr(api, ctx, http.StatusBadRequest, "Invalid user ID.")
			return
		}

		user, err := a.db.GetUser(ctx.Context(), userId)
		if err != nil {
			huma.WriteErr(api, ctx, http.StatusUnauthorized, "User not found.")
			return
		}

		ctx.SetHeader("UserId", user.UserUuid.String())

		next(ctx)
	}

	huma.Get(api, "/healthcheck", a.HealthCheck)

	huma.Register(api, huma.Operation{
		Method:      http.MethodPost,
		Path:        "/register",
		Summary:     "Register user",
		Description: "Register a new user.",
		Tags:        []string{"Auth"},
	}, a.RegisterUser)

	huma.Register(api, huma.Operation{
		Method:      http.MethodPost,
		Path:        "/sign-in",
		Summary:     "Sign in",
		Description: "Sign in to an existing account.",
		Tags:        []string{"Auth"},
	}, a.SignIn)

	huma.Register(api, huma.Operation{
		Method:      http.MethodPost,
		Path:        "/refresh",
		Summary:     "Refresh token",
		Description: "Refresh an existing token.",
		Tags:        []string{"Auth"},
	}, a.RefreshToken)

	huma.Register(api, huma.Operation{
		Method:      http.MethodGet,
		Path:        "/sync",
		Summary:     "Get sync data",
		Description: "Get sync data from after the given date.",
		Middlewares: huma.Middlewares{authMiddleware},
		Tags:        []string{"Sync"},
	}, a.GetSyncData)

	a.server = server
	return a
}

func (a *App) Listen(addr string) error {
	return a.server.Listen(addr)
}

func (a *App) Test(req *http.Request, msTimeout ...int) (*http.Response, error) {
	return a.server.Test(req, msTimeout...)
}
