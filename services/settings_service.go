package services

import (
	"database/sql"
	"errors"
)

type SettingsService struct {
	db *sql.DB
}

func NewSettingsService(db *sql.DB) *SettingsService {
	return &SettingsService{db: db}
}

func (s *SettingsService) Get(key string) (string, error) {
	var value string
	err := s.db.QueryRow(`SELECT value FROM settings WHERE key = ?`, key).Scan(&value)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return value, nil
}

func (s *SettingsService) Set(key string, value string) error {
	_, err := s.db.Exec(`
INSERT INTO settings(key, value)
VALUES(?, ?)
ON CONFLICT(key) DO UPDATE SET value = excluded.value
`, key, value)
	return err
}

func (s *SettingsService) Delete(key string) error {
	_, err := s.db.Exec(`DELETE FROM settings WHERE key = ?`, key)
	return err
}
