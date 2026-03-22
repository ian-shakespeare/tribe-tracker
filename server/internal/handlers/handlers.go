package handlers

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func createAndSignToken(signingKey []byte, expiry time.Time, userId uuid.UUID) (string, error) {
	claims := jwt.RegisteredClaims{
		Issuer:    "tribe-tracker-server",
		Subject:   userId.String(),
		ExpiresAt: jwt.NewNumericDate(expiry),
		NotBefore: jwt.NewNumericDate(time.Now().UTC()),
		IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(signingKey)
}
