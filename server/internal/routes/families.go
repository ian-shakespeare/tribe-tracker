package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/handlers"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/services"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

// createFamily godoc
//
//	@Summary		Create family
//	@Description	Create a new family.
//	@Tags			Family
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.NewFamily	true	"Family details"
//	@Success		201		{object}	models.Family		"Newly created family"
//	@Failure		400		{string}	string				"Bad request"
//	@Failure		401		{string}	string				"Unauthorized"
//	@Failure		500		{string}	string				"Server error"
//	@Router			/api/families [post]
func createFamily(c fiber.Ctx) error {
	var nf models.NewFamily

	if err := json.Unmarshal(c.Body(), &nf); err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid request body.")
	}

	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	userId, err := getUserId(c)
	if err != nil {
		return err
	}

	family, err := handlers.CreateFamily(c.Context(), dbSrv.Queries, userId, nf)
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(family)
}

// createFamily godoc
//
//	@Summary		Create family member
//	@Description	Join a family.
//	@Tags			Family
//	@Produce		json
//	@Param			familyId	path		string				true	"Family ID"
//	@Success		201			{object}	models.FamilyMember	"Newly created family member"
//	@Failure		400			{string}	string				"Bad request"
//	@Failure		401			{string}	string				"Unauthorized"
//	@Failure		404			{string}	string				"Family not found"
//	@Failure		500			{string}	string				"Server error"
//	@Router			/api/families/{familyId}/members [post]
func createFamilyMember(c fiber.Ctx) error {
	var nf models.NewFamily

	if err := json.Unmarshal(c.Body(), &nf); err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid request body.")
	}

	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	familyIdStr := c.Params("familyId")
	familyId, err := uuid.Parse(familyIdStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid family ID.")
	}

	userId, fErr := getUserId(c)
	if fErr != nil {
		return fErr
	}

	familyMember, fErr := handlers.CreateFamilyMember(c.Context(), dbSrv.Queries, familyId, userId)
	if fErr != nil {
		return fErr
	}

	return c.Status(http.StatusCreated).JSON(familyMember)
}
