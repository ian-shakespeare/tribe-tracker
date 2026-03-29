package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/ian-shakespeare/tribe-tracker/server/pkg/models"
)

const StorageName = "file-storage"

type File struct {
	models.Media
	Content io.ReadCloser
}

func (f File) Read(p []byte) (n int, err error) {
	return f.Content.Read(p)
}

func (f File) Close() error {
	return f.Content.Close()
}

type Storage struct {
	dir string
}

func NewStorage(dir string) *Storage {
	return &Storage{dir}
}

func (s *Storage) Start(ctx context.Context) error {
	return nil
}

func (s *Storage) String() string {
	return StorageName
}

func (s *Storage) State(ctx context.Context) (string, error) {
	entries, err := os.ReadDir(s.dir)
	if err != nil {
		return "", err
	}

	fileCount := len(entries)
	dirSize := int64(0)
	for _, e := range entries {
		info, err := e.Info()
		if err != nil {
			return "", err
		}

		dirSize += info.Size()
	}

	state := fmt.Sprintf("File count: %d, Directory size: %d", fileCount, dirSize)
	return state, nil
}

func (s *Storage) Terminate(ctx context.Context) error {
	return nil
}

func (s *Storage) CreateFile(contentType string, r io.Reader) (models.Media, error) {
	var meta models.Media
	meta.ID = uuid.NewString()
	meta.ContentType = contentType

	b := make([]byte, 512)
	if _, err := r.Read(b); err != nil && !errors.Is(err, io.EOF) {
		return meta, err
	}

	p := filepath.Join(s.dir, meta.ID)
	fout, err := os.Create(p)
	if err != nil {
		return meta, err
	}

	n, err := io.Copy(fout, io.MultiReader(bytes.NewReader(b), r))
	_ = fout.Close()
	if err != nil {
		_ = os.Remove(p)
		return meta, err
	}

	meta.Size = n
	meta.CreatedAt = time.Now()

	mb, err := json.Marshal(meta)
	if err != nil {
		_ = os.Remove(p)
		return meta, err
	}

	if err := os.WriteFile(p+".meta.json", mb, 0o666); err != nil {
		_ = os.Remove(p)
		return meta, err
	}

	return meta, err
}

func (s *Storage) GetFile(id uuid.UUID) (File, error) {
	var f File

	p := filepath.Join(s.dir, id.String())
	mb, err := os.ReadFile(p + ".meta.json")
	if err != nil {
		return f, err
	}

	if err := json.Unmarshal(mb, &f.Media); err != nil {
		return f, err
	}

	f.Content, err = os.Open(p)
	return f, err
}
