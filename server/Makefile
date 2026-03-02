API := cmd/api/main.go
BIN := bin/go-app-template
COMPOSE := docker compose
DOCS := cmd/docs/main.go
GO := go
LINTER := golangci-lint
RUN_FLAGS := -v

all: run

build:
	$(GO) build -o $(BIN) $(API)

clean:
	rm -rf $(BIN)

docs:
	$(GO) run $(DOCS) docs/openapi.yaml

down:
	$(COMPOSE) down --remove-orphans

fmt:
	$(GO) fmt ./...

lint:
	$(LINTER) run ./...

run:
	$(GO) run $(API) $(RUN_FLAGS)

test:
	$(GO) test ./internal/... -failfast

up:
	$(COMPOSE) up -d

.PHONY: docs down lint run test up
