package services

import (
	"errors"

	secretkeyring "github.com/zalando/go-keyring"
)

type SecretStoreService struct {
	serviceName string
}

func NewSecretStoreService(serviceName string) *SecretStoreService {
	return &SecretStoreService{serviceName: serviceName}
}

func (s *SecretStoreService) Get(key string) (string, error) {
	value, err := secretkeyring.Get(s.serviceName, key)
	if errors.Is(err, secretkeyring.ErrNotFound) {
		return "", nil
	}
	return value, err
}

func (s *SecretStoreService) Set(key string, value string) error {
	return secretkeyring.Set(s.serviceName, key, value)
}

func (s *SecretStoreService) Delete(key string) error {
	err := secretkeyring.Delete(s.serviceName, key)
	if errors.Is(err, secretkeyring.ErrNotFound) {
		return nil
	}
	return err
}
