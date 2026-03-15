package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/ian-shakespeare/tribe-tracker/server/internal/app"
)

const TIMEOUT int = 10_000

func main() {
	args := os.Args

	if len(args) < 2 {
		message := fmt.Appendf([]byte{}, "usage: %s [output path]", args[0])
		_, _ = os.Stdout.Write(message)
		os.Exit(1)
	}

	outputPath := args[1]

	a := app.New(nil)

	req, err := http.NewRequest(http.MethodGet, "/openapi.yaml", http.NoBody)
	if err != nil {
		log.Fatalf("failed to create request: %v", err)
	}

	res, err := a.Test(req, TIMEOUT)
	if err != nil {
		log.Fatalf("failed to get open api spec: %v", err)
	}
	defer res.Body.Close()

	fout, err := os.Create(outputPath)
	if err != nil {
		log.Fatalf("failed to create output file: %v", err)
	}
	defer fout.Close()

	_, err = io.Copy(fout, res.Body)
	if err != nil {
		log.Fatalf("failed to save open api spec: %v", err)
	}
}
