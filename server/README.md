# Tribe Tracker

A Go service using SQLite.

## Getting Started

This project uses [Migrate](https://github.com/golang-migrate/migrate) to create and apply migrations, and [sqlc](https://github.com/sqlc-dev/sqlc) to generate queries.

```sh
# Create a migration
migrate create -dir database/migrations -ext sql $MIGRATION_NAME

# Generate database handlers
./scripts/generate.sh

# Start the server
make run

# Build a binary
make build
```
