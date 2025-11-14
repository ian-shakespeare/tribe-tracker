BIN := bin/tribetrackerserver
DATA := pb_data
GO := go
LINT := golangci-lint
MAIN := cmd/main.go
command := serve

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

.PHONY: clean fmt lint
