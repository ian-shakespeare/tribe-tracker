package migrations

import (
	"errors"
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

var ErrInvalidFieldType = errors.New("invalid field type")

func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		avatar := users.Fields.GetByName("avatar")

		avatarField, ok := avatar.(*core.FileField)
		if !ok {
			return fmt.Errorf("%w: expected file field", ErrInvalidFieldType)
		}

		avatarField.MimeTypes = []string{
			"image/jpeg",
			"image/png",
			"image/svg+xml",
			"image/gif",
			"image/webp",
			"image/heic",
			"image/heif",
		}

		return app.Save(users)
	}, func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(UsersId)
		if err != nil {
			return err
		}

		avatar := users.Fields.GetByName("avatar")

		avatarField, ok := avatar.(*core.FileField)
		if !ok {
			return fmt.Errorf("%w: expected file field", ErrInvalidFieldType)
		}

		avatarField.MimeTypes = []string{
			"image/jpeg",
			"image/png",
			"image/svg+xml",
			"image/gif",
			"image/webp",
		}

		return app.Save(users)
	})
}
