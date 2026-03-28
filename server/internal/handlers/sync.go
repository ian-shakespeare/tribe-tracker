package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/internal/database"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
	"golang.org/x/sync/errgroup"
)

func GetSyncData(ctx context.Context, q *database.Queries, userId uuid.UUID, after time.Time) (models.SyncData, error) {
	var sd models.SyncData
	var g errgroup.Group

	g.Go(func() error {
		users, err := q.GetRecentUsers(ctx, database.GetRecentUsersParams{
			UserUuid:     userId,
			UpdatedAfter: after.Unix(),
		})
		if err != nil {
			return err
		}

		for _, u := range users {
			sd.Users = append(sd.Users, models.User{
				ID:        u.UserUuid.String(),
				Email:     u.Email,
				FirstName: u.FirstName,
				LastName:  u.LastName,
				Avatar:    u.Avatar,
				CreatedAt: time.Unix(u.CreatedAt, 0),
				UpdatedAt: time.Unix(u.UpdatedAt, 0),
				IsDeleted: &u.IsDeleted,
			})
		}

		return nil
	})

	g.Go(func() error {
		families, err := q.GetRecentFamilies(ctx, database.GetRecentFamiliesParams{
			UserUuid:     userId,
			UpdatedAfter: after.Unix(),
		})
		if err != nil {
			return err
		}

		for _, f := range families {
			sd.Families = append(sd.Families, models.Family{
				ID:        f.FamilyUuid.String(),
				Name:      f.Name,
				CreatedBy: f.CreatedBy.String(),
				CreatedAt: time.Unix(f.CreatedAt, 0),
				UpdatedAt: time.Unix(f.UpdatedAt, 0),
				IsDeleted: &f.IsDeleted,
			})
		}

		return nil
	})

	g.Go(func() error {
		familyMembers, err := q.GetRecentFamilyMembers(ctx, database.GetRecentFamilyMembersParams{
			UserUuid:     userId,
			CreatedAfter: after.Unix(),
		})
		if err != nil {
			return err
		}

		for _, fm := range familyMembers {
			sd.FamilyMembers = append(sd.FamilyMembers, models.FamilyMember{
				User:      fm.UserUuid.String(),
				Family:    fm.FamilyUuid.String(),
				CreatedAt: time.Unix(fm.CreatedAt, 0),
			})
		}

		return nil
	})

	g.Go(func() error {
		locations, err := q.GetRecentLocations(ctx, database.GetRecentLocationsParams{
			UserUuid:     userId,
			CreatedAfter: after.Unix(),
		})
		if err != nil {
			return err
		}

		for _, l := range locations {
			sd.Locations = append(sd.Locations, models.Location{
				ID:        l.LocationUuid.String(),
				User:      l.UserUuid.String(),
				Lat:       l.Lat,
				Lon:       l.Lon,
				CreatedAt: time.Unix(l.CreatedAt, 0),
			})
		}

		return nil
	})

	if err := g.Wait(); err != nil {
		return sd, fiber.NewError(http.StatusInternalServerError, "Failed to get sync data.")
	}

	return sd, nil
}
