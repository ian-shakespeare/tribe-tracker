package models

import "time"

type Access struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	Expiry       time.Time `json:"expiry"`
}

type Family struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedBy string    `json:"createdBy"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	IsDeleted *bool     `json:"isDeleted,omitempty"`
}

type FamilyMember struct {
	User      string    `json:"user"`
	Family    string    `json:"family"`
	CreatedAt time.Time `json:"createdAt"`
}

type Health struct {
	Status string `json:"status"`
}

type Location struct {
	ID        string    `json:"id"`
	User      string    `json:"user"`
	Lat       float64   `json:"lat"`
	Lon       float64   `json:"lon"`
	CreatedAt time.Time `json:"createdAt"`
}

type Media struct {
	ID          string    `json:"id"`
	ContentType string    `json:"contentType"`
	Size        int64     `json:"size"`
	CreatedAt   time.Time `json:"createdAt"`
}

type NewFamily struct {
	Name string `json:"name"`
}

type NewLocation struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

type NewUser struct {
	Email           string `json:"email"`
	FirstName       string `json:"firstName"`
	LastName        string `json:"lastName"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}

type Refresh struct {
	RefreshToken string `json:"refreshToken"`
}

type SignIn struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SyncData struct {
	Users         []User         `json:"users"`
	Families      []Family       `json:"families"`
	FamilyMembers []FamilyMember `json:"familyMembers"`
	Locations     []Location     `json:"locations"`
}

type UpdateUser struct {
	FirstName *string `json:"firstName,omitempty"`
	LastName  *string `json:"lastName,omitempty"`
	Avatar    *string `json:"avatar,omitempty"`
}

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Avatar    *string   `json:"avatar"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	IsDeleted *bool     `json:"isDeleted,omitempty"`
}
