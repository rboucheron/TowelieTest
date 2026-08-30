package fs

import (
	"os"
	"path/filepath"
)

func Create(src string) error {

	os.RemoveAll(src)

	return os.MkdirAll(src, 0755)
}

func CopyDir(src, dst string) error {

	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {

		if err != nil {
			return err
		}

		relative, _ := filepath.Rel(src, path)

		target := filepath.Join(dst, relative)

		if info.IsDir() {
			return os.MkdirAll(target, info.Mode())
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		return os.WriteFile(target, data, info.Mode())
	})
}
