# Tribe Tracker

A template Go web application using PostgreSQL.

## Getting Started

This project uses [Migrate](https://github.com/golang-migrate/migrate) to create and apply migrations, and [sqlc](https://github.com/sqlc-dev/sqlc) to generate queries.

```sh
# Create a migration
migrate create -dir database/migrations -ext sql $MIGRATION_NAME

# Generate database handlers
sqlc generate

# Start the server
make run

# Build a binary
make build
```
