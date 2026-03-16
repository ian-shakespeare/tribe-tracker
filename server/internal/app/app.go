package app

import (
	"context"
	"database/sql"
	"net/http"
	"strings"
	"time"

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
	server        *fiber.App
	db            *database.Queries
	signingKey    []byte
	accessExpiry  time.Duration
	refreshExpiry time.Duration
}

type AppOption func(a *App)

func WithSigningKey(k string) AppOption {
	return func(a *App) {
		a.signingKey = []byte(k)
	}
}

func WithAccessExpiry(t time.Duration) AppOption {
	return func(a *App) {
		a.accessExpiry = t
	}
}

func WithRefreshExpiry(t time.Duration) AppOption {
	return func(a *App) {
		a.refreshExpiry = t
	}
}

func New(db *sql.DB, opts ...AppOption) *App {
	server := fiber.New()
	router := humafiber.New(server, huma.DefaultConfig("Tribe Tracker API", "1.0.0"))

	a := &App{
		db:            database.New(db),
		signingKey:    []byte("dummy-signing-key"),
		accessExpiry:  time.Hour,
		refreshExpiry: 60 * 24 * time.Hour, // 60 days default
	}

	for _, opt := range opts {
		opt(a)
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

		ctx = huma.WithValue(ctx, "user-id", user.UserUuid.String())
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
		Method:      http.MethodPatch,
		Path:        "/users/me",
		Summary:     "Update me",
		Description: "Updates the caller's user.",
		Tags:        []string{"User"},
		Middlewares: huma.Middlewares{authMiddleware},
	}, a.UpdateMe)

	huma.Register(api, huma.Operation{
		Method:        http.MethodPost,
		Path:          "/families",
		DefaultStatus: http.StatusCreated,
		Summary:       "Create family",
		Description:   "Create a new family.",
		Middlewares:   huma.Middlewares{authMiddleware},
		Tags:          []string{"Family"},
	}, a.CreateFamily)

	huma.Register(api, huma.Operation{
		Method:        http.MethodPost,
		Path:          "/families/{familyId}/members",
		DefaultStatus: http.StatusCreated,
		Summary:       "Join family",
		Description:   "Join a new family.",
		Middlewares:   huma.Middlewares{authMiddleware},
		Tags:          []string{"Family"},
	}, a.CreateFamilyMember)

	huma.Register(api, huma.Operation{
		Method:        http.MethodPost,
		Path:          "/locations",
		DefaultStatus: http.StatusCreated,
		Summary:       "Create location",
		Description:   "Create a new location.",
		Middlewares:   huma.Middlewares{authMiddleware},
		Tags:          []string{"Location"},
	}, a.CreateLocation)

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

func ctxToUserId(ctx context.Context) uuid.UUID {
	userId := ctx.Value("user-id")

	userIdStr, ok := userId.(string)
	if !ok {
		panic("failed to get userId from context")
	}

	return uuid.MustParse(userIdStr)
}
