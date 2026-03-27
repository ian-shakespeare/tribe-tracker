package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
)

const StorageName = "file-storage"

type FileMetaData struct {
	ContentType string    `json:"contentType"`
	Size        int64     `json:"size"`
	CreatedAt   time.Time `json:"createdAt"`
}

type File struct {
	FileMetaData
	Content io.ReadCloser
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

	state := fmt.Sprintf("File count: %d\nDirectory size: %d", fileCount, dirSize)
	return state, nil
}

func (s *Storage) Terminate(ctx context.Context) error {
	return nil
}

func (s *Storage) CreateFile(r io.Reader) (uuid.UUID, error) {
	id := uuid.New()

	b := make([]byte, 512)
	if _, err := r.Read(b); err != nil && !errors.Is(err, io.EOF) {
		return id, err
	}

	contentType := http.DetectContentType(b)

	fout, err := os.Create(id.String())
	if err != nil {
		return id, err
	}

	n, err := io.Copy(fout, io.MultiReader(bytes.NewReader(b), r))
	_ = fout.Close()
	if err != nil {
		_ = os.Remove(id.String())
		return id, err
	}

	meta := FileMetaData{
		ContentType: contentType,
		Size:        n,
		CreatedAt:   time.Now(),
	}

	mb, err := json.Marshal(meta)
	if err != nil {
		_ = os.Remove(id.String())
		return id, err
	}

	if err := os.WriteFile(id.String()+".meta.json", mb, 0o666); err != nil {
		_ = os.Remove(id.String())
		return id, err
	}

	return id, err
}

func (s *Storage) GetFile(id uuid.UUID) (File, error) {
	var f File

	mb, err := os.ReadFile(id.String() + ".meta.json")
	if err != nil {
		return f, err
	}

	if err := json.Unmarshal(mb, &f.FileMetaData); err != nil {
		return f, err
	}

	f.Content, err = os.Open(id.String())
	return f, err
}
