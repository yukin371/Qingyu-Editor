package services

import (
	"errors"

	secretkeyring "github.com/zalando/go-keyring"
)

type secretBackend interface {
	Get(service, user string) (string, error)
	Set(service, user, password string) error
	Delete(service, user string) error
}

type systemSecretBackend struct{}

func (systemSecretBackend) Get(service, user string) (string, error) {
	return secretkeyring.Get(service, user)
}

func (systemSecretBackend) Set(service, user, password string) error {
	return secretkeyring.Set(service, user, password)
}

func (systemSecretBackend) Delete(service, user string) error {
	return secretkeyring.Delete(service, user)
}

type SecretStoreService struct {
	serviceName string
	backend     secretBackend
}

func NewSecretStoreService(serviceName string) *SecretStoreService {
	return newSecretStoreService(serviceName, systemSecretBackend{})
}

func newSecretStoreService(serviceName string, backend secretBackend) *SecretStoreService {
	return &SecretStoreService{
		serviceName: serviceName,
		backend:     backend,
	}
}

func (s *SecretStoreService) Get(key string) (string, error) {
	value, err := s.backend.Get(s.serviceName, key)
	if errors.Is(err, secretkeyring.ErrNotFound) {
		return "", nil
	}
	return value, err
}

func (s *SecretStoreService) Set(key string, value string) error {
	return s.backend.Set(s.serviceName, key, value)
}

func (s *SecretStoreService) Delete(key string) error {
	err := s.backend.Delete(s.serviceName, key)
	if errors.Is(err, secretkeyring.ErrNotFound) {
		return nil
	}
	return err
}
