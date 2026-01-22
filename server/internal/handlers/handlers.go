package handlers

import (
	"net/http"
	"time"

	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func Bind(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		mobile := se.Router.Group("/mobile")

		mobile.Bind(apis.RequireAuth())
		mobile.GET("/families/{familyId}/members", getFamilyMembers)
		mobile.GET("/families/{familyId}/members/locations", getFamilyMemberLocations)
		mobile.GET("/invitations", getInvitations)
		mobile.PUT("/invitations/{invitationId}", acceptInvitation)
		mobile.GET("/sync", getSyncData)

		return se.Next()
	})
}

func getFamilyMembers(e *core.RequestEvent) error {
	familyId := e.Request.PathValue("familyId")
	userId := e.Auth.Id

	query := `
    select u.id as id,
      u.email as email,
      u.firstName as firstName,
      u.lastName as lastName,
      ifnull(i.updatedAt, f.createdAt) as joinedAt
    from families f
    join json_each(f.members) members
    join users u
      on members.value = u.id
    left join invitations i
      on u.id = i.recipient
      and i.accepted = 1
    where f.id = {:familyId}
      and exists (
        select 1
        from json_each(f.members) m
        where m.value = {:userId}
      )
    order by firstName
    `

	var fm []models.FamilyMember

	err := e.App.DB().NewQuery(query).Bind(dbx.Params{"familyId": familyId, "userId": userId}).All(&fm)
	if err != nil {
		message := "Failed to get family members."
		return e.String(http.StatusInternalServerError, message)
	}

	return e.JSON(http.StatusOK, fm)
}

func getFamilyMemberLocations(e *core.RequestEvent) error {
	familyId := e.Request.PathValue("familyId")
	userId := e.Auth.Id

	query := `
    select u.id as userId,
      u.firstName as firstName,
      u.lastName as lastName,
      l.coordinates as coordinates,
      max(l.createdAt) as recordedAt
    from families f
    join json_each(f.members) members
    join users u
      on members.value = u.id
    join locations l
      on u.id = l.user
    where f.id = {:familyId}
      and exists (
        select 1
        from json_each(f.members) m
        where m.value = {:userId}
      )
    group by u.id
    order by recordedAt desc
    `

	var ml []models.MemberLocation

	err := e.App.DB().NewQuery(query).Bind(dbx.Params{"familyId": familyId, "userId": userId}).All(&ml)
	if err != nil {
		message := "Failed to get member locations."
		return e.String(http.StatusInternalServerError, message)
	}

	return e.JSON(http.StatusOK, ml)
}

func getInvitations(e *core.RequestEvent) error {
	userId := e.Auth.Id

	query := `
    select i.id as id,
      f.name as familyName,
      i.createdAt as createdAt
    from invitations i
    join families f
      on i.family = f.id
    where i.recipient = {:userId}
      and i.accepted = 0
    order by createdAt desc
    `

	var fi []models.FamilyInvitation

	err := e.App.DB().NewQuery(query).Bind(dbx.Params{"userId": userId}).All(&fi)
	if err != nil {
		message := "Failed to get family invitations."
		return e.String(http.StatusInternalServerError, message)
	}

	return e.JSON(http.StatusOK, fi)
}

func acceptInvitation(e *core.RequestEvent) error {
	invitationId := e.Request.PathValue("invitationId")
	userId := e.Auth.Id

	query := `
    update invitations
    set accepted = 1
    where id = {:invitationId}
    and recipient = {:userId}
    returning family as familyId
    `

	var family struct {
		FamilyId string `db:"familyId" json:"familyId"`
	}

	err := e.App.DB().NewQuery(query).Bind(dbx.Params{"invitationId": invitationId, "userId": userId}).One(&family)
	if err != nil {
		message := "Failed to accept family invite."
		return e.String(http.StatusInternalServerError, message)
	}

	query = `
    update families
    set members = json_insert(members, '$[#]', {:userId})
    where id = {:familyId}
    `

	_, err = e.App.DB().NewQuery(query).Bind(dbx.Params{"userId": userId, "familyId": family.FamilyId}).Execute()
	if err != nil {
		message := "Failed to join family."
		return e.String(http.StatusInternalServerError, message)
	}

	return e.JSON(http.StatusOK, family)
}

func getSyncData(e *core.RequestEvent) error {
	userId := e.Auth.Id

	afterStr := e.Request.PathValue("after")
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

	locations, err := database.GetRecentLocations(e.App.DB(), userId, after)
	if err != nil {
		message := "Failed to get location data."
		return e.String(http.StatusInternalServerError, message)
	}

	var res struct {
		Users     []models.UserModel     `json:"users"`
		Families  []models.FamilyModel   `json:"families"`
		Locations []models.LocationModel `json:"locations"`
	}
	res.Users = users
	res.Families = families
	res.Locations = locations

	return e.JSON(http.StatusOK, res)
}
