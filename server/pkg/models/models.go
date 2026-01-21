package models

import "github.com/pocketbase/pocketbase/tools/types"

type FamilyInvitation struct {
	InvitationID string         `db:"id" json:"id"`
	FamilyName   string         `db:"familyName" json:"familyName"`
	CreatedAt    types.DateTime `db:"createdAt" json:"createdAt"`
}

type FamilyMember struct {
	ID        string         `db:"id" json:"id"`
	Email     string         `db:"email" json:"email"`
	FirstName string         `db:"firstName" json:"firstName"`
	LastName  string         `db:"lastName" json:"lastName"`
	JoinedAt  types.DateTime `db:"joinedAt" json:"joinedAt"`
}

type FamilyModel struct {
	ID        string                  `db:"id" json:"id"`
	Name      string                  `db:"name" json:"name"`
	CreatedBy string                  `db:"createdBy" json:"createdBy"`
	Members   types.JSONArray[string] `db:"members" json:"members"`
	CreatedAt types.DateTime          `db:"createdAt" json:"createdAt"`
	UpdatedAt types.DateTime          `db:"updatedAt" json:"updatedAt"`
	IsDeleted bool                    `db:"isDeleted" json:"isDeleted"`
}

type LocationModel struct {
	ID          string         `db:"id" json:"id"`
	User        string         `db:"user" json:"user"`
	Coordinates types.GeoPoint `db:"coordinates" json:"coordinates"`
	CreatedAt   types.DateTime `db:"createdAt" json:"createdAt"`
}

type MemberLocation struct {
	UserID      string         `db:"userId" json:"userId"`
	FirstName   string         `db:"firstName" json:"firstName"`
	LastName    string         `db:"lastName" json:"lastName"`
	Coordinates types.GeoPoint `db:"coordinates" json:"coordinates"`
	RecordedAt  types.DateTime `db:"recordedAt" json:"recordedAt"`
}

type UserModel struct {
	ID        string         `db:"id" json:"id"`
	Email     string         `db:"email" json:"email"`
	FirstName string         `db:"firstName" json:"firstName"`
	LastName  string         `db:"lastName" json:"lastName"`
	Avatar    string         `db:"avatar" json:"avatar"`
	CreatedAt types.DateTime `db:"created" json:"createdAt"`
	UpdatedAt types.DateTime `db:"updated" json:"updatedAt"`
	IsDeleted bool           `db:"isDeleted" json:"isDeleted"`
}
