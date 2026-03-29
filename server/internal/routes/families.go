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

// getFamily godoc
//
//	@Summary		Get family
//	@Description	Get family details.
//	@Tags			Family
//	@Produce		json
//	@Param			familyId	path		string				true	"Family ID"
//	@Success		200			{object}	models.Family	"Family details"
//	@Failure		400			{string}	string				"Bad request"
//	@Failure		401			{string}	string				"Unauthorized"
//	@Failure		404			{string}	string				"Family not found"
//	@Failure		500			{string}	string				"Server error"
//	@Router			/api/families/{familyId} [get]
func getFamily(c fiber.Ctx) error {
	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	familyIdStr := c.Params("familyId")
	familyId, err := uuid.Parse(familyIdStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid family ID.")
	}

	userId, err := getUserId(c)
	if err != nil {
		return err
	}

	family, err := handlers.GetFamily(c.Context(), dbSrv.Queries, userId, familyId)
	if err != nil {
		return err
	}

	return c.JSON(family)
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
	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	familyIdStr := c.Params("familyId")
	familyId, err := uuid.Parse(familyIdStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid family ID.")
	}

	userId, err := getUserId(c)
	if err != nil {
		return err
	}

	familyMember, err := handlers.CreateFamilyMember(c.Context(), dbSrv.Queries, familyId, userId)
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(familyMember)
}

// getFamilyMembers godoc
//
//	@Summary		Get family members
//	@Description	Get all members of a family.
//	@Tags			Family
//	@Produce		json
//	@Param			familyId	path		string				true	"Family ID"
//	@Success		200			{object}	[]models.FamilyMember	"Family members"
//	@Failure		400			{string}	string				"Bad request"
//	@Failure		401			{string}	string				"Unauthorized"
//	@Failure		404			{string}	string				"Family not found"
//	@Failure		500			{string}	string				"Server error"
//	@Router			/api/families/{familyId}/members [get]
func getFamilyMembers(c fiber.Ctx) error {
	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	familyIdStr := c.Params("familyId")
	familyId, err := uuid.Parse(familyIdStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid family ID.")
	}

	userId, err := getUserId(c)
	if err != nil {
		return err
	}

	familyMembers, err := handlers.GetFamilyMembers(c.Context(), dbSrv.Queries, userId, familyId)
	if err != nil {
		return err
	}

	return c.JSON(familyMembers)
}

// getFamilyMemberLocations godoc
//
//	@Summary		Get family member locations
//	@Description	Get all member locations for a family.
//	@Tags			Family
//	@Produce		json
//	@Param			familyId	path		string				true	"Family ID"
//	@Success		200			{object}	[]models.Locations	"Family member locations"
//	@Failure		400			{string}	string				"Bad request"
//	@Failure		401			{string}	string				"Unauthorized"
//	@Failure		404			{string}	string				"Family not found"
//	@Failure		500			{string}	string				"Server error"
//	@Router			/api/families/{familyId}/members/locations [get]
func getFamilyMemberLocations(c fiber.Ctx) error {
	dbSrv, ok := fiber.GetService[*services.DB](c.App().State(), services.DBName)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Unable to retrieve database service.")
	}

	familyIdStr := c.Params("familyId")
	familyId, err := uuid.Parse(familyIdStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid family ID.")
	}

	userId, err := getUserId(c)
	if err != nil {
		return err
	}

	locations, err := handlers.GetFamilyMemberLocations(c.Context(), dbSrv.Queries, userId, familyId)
	if err != nil {
		return err
	}

	return c.JSON(locations)
}
