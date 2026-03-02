#!/usr/bin/env bash

OPENAPI_GENERATOR="cmd/docs/main.go"
OPENAPI_OUTPUT="docs/openapi.yaml"

sqlc generate
go run $OPENAPI_GENERATOR $OPENAPI_OUTPUT
