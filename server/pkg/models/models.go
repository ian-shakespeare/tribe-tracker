package models

import "github.com/pocketbase/pocketbase/tools/types"

type User struct {
	ID        string         `db:"id" json:"id"`
	Email     string         `db:"email" json:"email"`
	FirstName string         `db:"firstName" json:"firstName"`
	LastName  string         `db:"lastName" json:"lastName"`
	Avatar    string         `db:"avatar" json:"avatar"`
	CreatedAt types.DateTime `db:"createdAt" json:"createdAt"`
	UpdatedAt types.DateTime `db:"updatedAt" json:"updatedAt"`
	IsDeleted bool           `db:"isDeleted" json:"isDeleted"`
}

type Family struct {
	ID        string         `db:"id" json:"id"`
	Name      string         `db:"name" json:"name"`
	CreatedBy string         `db:"createdBy" json:"createdBy"`
	CreatedAt types.DateTime `db:"createdAt" json:"createdAt"`
	UpdatedAt types.DateTime `db:"updatedAt" json:"updatedAt"`
	IsDeleted bool           `db:"isDeleted" json:"isDeleted"`
}

type FamilyMember struct {
	ID        string         `db:"id" json:"id"`
	User      string         `db:"user" json:"user"`
	Family    string         `db:"family" json:"family"`
	CreatedAt types.DateTime `db:"createdAt" json:"createdAt"`
}

type Invitation struct {
	ID        string         `db:"id" json:"id"`
	Sender    string         `db:"sender" json:"sender"`
	Recipient string         `db:"recipient" json:"recipient"`
	Family    string         `db:"family" json:"family"`
	CreatedAt types.DateTime `db:"createdAt" json:"createdAt"`
}

type Location struct {
	ID          string         `db:"id" json:"id"`
	User        string         `db:"user" json:"user"`
	Coordinates string         `db:"coordinates" json:"coordinates"`
	CreatedAt   types.DateTime `db:"createdAt" json:"createdAt"`
}
