API := cmd/api/main.go
BIN := bin/go-app-template
COMPOSE := docker compose
DATA := .data
DOCS := cmd/docs/main.go
GO := go
LINTER := golangci-lint
RUN_FLAGS := -v

all: run

build:
	$(GO) build -o $(BIN) $(API)

clean:
	rm -rf $(BIN) $(DATA)

docs:
	$(GO) run $(DOCS) docs/openapi.yaml

down:
	$(COMPOSE) down --remove-orphans

fmt:
	$(GO) fmt ./...

generate:
	@./scripts/generate.sh

lint: generate
	$(LINTER) run ./...

run:
	$(GO) run $(API) $(RUN_FLAGS)

test: generate
	$(GO) test ./internal/... $(testargs)

.PHONY: docs down lint run test up
