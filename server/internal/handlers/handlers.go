package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func Bind(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		mobile := se.Router.Group("/mobile")

		mobile.Bind(apis.RequireAuth())
		mobile.GET("/sync", getSyncData)
		mobile.POST("/families", createFamily)

		return se.Next()
	})
}

func getSyncData(e *core.RequestEvent) error {
	userId := e.Auth.Id

	params := e.Request.URL.Query()
	afterStr := params.Get("after")
	after, err := time.Parse(time.RFC3339, afterStr)
	if err != nil {
		return e.String(http.StatusBadRequest, "Invalid time. Expected RFC3339 format.")
	}

	users, err := database.GetRecentUsers(e.App.DB(), userId, after)
	if err != nil {
		message := "Failed to get user data."
		return e.String(http.StatusInternalServerError, message)
	}

	families, err := database.GetRecentFamilies(e.App.DB(), userId, after)
	if err != nil {
		message := "Failed to get family data."
		return e.String(http.StatusInternalServerError, message)
	}

	familyMembers, err := database.GetRecentFamilyMembers(e.App.DB(), userId, after)
	if err != nil {
		message := "Failed to get family member data."
		return e.String(http.StatusInternalServerError, message)
	}

	locations, err := database.GetRecentLocations(e.App.DB(), userId, after)
	if err != nil {
		message := "Failed to get location data."
		return e.String(http.StatusInternalServerError, message)
	}

	var res struct {
		Users         []models.User         `json:"users"`
		Families      []models.Family       `json:"families"`
		FamilyMembers []models.FamilyMember `json:"familyMembers"`
		Locations     []models.Location     `json:"locations"`
	}
	res.Users = users
	res.Families = families
	res.FamilyMembers = familyMembers
	res.Locations = locations

	return e.JSON(http.StatusOK, res)
}

func createFamily(e *core.RequestEvent) error {
	userId := e.Auth.Id

	body := e.Request.Body
	defer body.Close()

	var req struct {
		Name string `json:"name"`
		Code string `json:"code"`
	}
	if err := json.NewDecoder(body).Decode(&req); err != nil {
		return e.String(http.StatusBadRequest, "Invalid request body.")
	}

	family, err := database.CreateFamily(e.App.DB(), userId, req.Name, req.Code)
	if err != nil {
		message := "Failed to create family."
		return e.String(http.StatusInternalServerError, message)
	}

	familyMember, err := database.CreateFamilyMember(e.App.DB(), family.ID, userId)
	if err != nil {
		message := "Failed to join family."
		return e.String(http.StatusInternalServerError, message)
	}

	var res struct {
		Family       models.Family       `json:"family"`
		FamilyMember models.FamilyMember `json:"familyMember"`
	}
	res.Family = family
	res.FamilyMember = familyMember

	return e.JSON(http.StatusCreated, res)
}
