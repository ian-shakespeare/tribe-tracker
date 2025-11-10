BIN := bin/tribetrackerserver
DATA := pb_data
GO := go
MAIN := main.go
SERVE := serve

all: run

run:
	$(GO) run $(MAIN) $(SERVE)

build:
	$(GO) build -o $(BIN) $(MAIN)

clean:
	rm -rf $(BIN) $(DATA)

.PHONY: clean
