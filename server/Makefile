BIN := bin/tribetrackerserver
CYCLO := gocyclo
DATA := pb_data
GO := go
LINT := golangci-lint
MAIN := cmd/main.go
command := serve
cyclolevel := 15

all: run

run:
	$(GO) run $(MAIN) $(command)

build:
	$(GO) build -o $(BIN) $(MAIN)

clean:
	rm -rf $(BIN) $(DATA)

lint:
	$(LINT) run ./...

fmt:
	$(GO) fmt ./...

cyclo:
	$(CYCLO) -over $(cyclolevel) .

test:
	$(GO) test ./...

migration:
	$(GO) run $(MAIN) migrate create $(migration_name)

migrate:
	$(GO) run $(MAIN) migrate up

.PHONY: clean cyclo fmt lint test migration
