package models

import "time"

type Coordinates struct {
	Lat float32 `json:"lat"`
	Lon float32 `json:"lon"`
}

type Family struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedBy string    `json:"createdBy"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type FamilyMember struct {
	User      string    `json:"user"`
	Family    string    `json:"family"`
	CreatedAt time.Time `json:"createdAt"`
}

type Location struct {
	ID          string      `json:"id"`
	User        string      `json:"user"`
	Coordinates Coordinates `json:"coordinates"`
	CreatedAt   time.Time   `json:"createdAt"`
}

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:""`
	LastName  string    `json:""`
	Avatar    *string   `json:"avatar"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
