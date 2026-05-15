package services

import (
	"errors"
	"testing"

	secretkeyring "github.com/zalando/go-keyring"
)

type fakeSecretBackend struct {
	getValue   string
	getErr     error
	setErr     error
	deleteErr  error
	lastGetKey string
	lastSetKey string
	lastSetVal string
	lastDelKey string
}

func (f *fakeSecretBackend) Get(service, user string) (string, error) {
	f.lastGetKey = service + ":" + user
	return f.getValue, f.getErr
}

func (f *fakeSecretBackend) Set(service, user, password string) error {
	f.lastSetKey = service + ":" + user
	f.lastSetVal = password
	return f.setErr
}

func (f *fakeSecretBackend) Delete(service, user string) error {
	f.lastDelKey = service + ":" + user
	return f.deleteErr
}

func TestSecretStoreServiceGetReturnsEmptyWhenSecretMissing(t *testing.T) {
	backend := &fakeSecretBackend{getErr: secretkeyring.ErrNotFound}
	service := newSecretStoreService("Qingyu-Editor", backend)

	value, err := service.Get("ai.provider.api-key")
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if value != "" {
		t.Fatalf("expected empty value, got %q", value)
	}
}

func TestSecretStoreServiceGetPassesThroughUnexpectedError(t *testing.T) {
	expectedErr := errors.New("boom")
	backend := &fakeSecretBackend{getErr: expectedErr}
	service := newSecretStoreService("Qingyu-Editor", backend)

	_, err := service.Get("ai.provider.api-key")
	if !errors.Is(err, expectedErr) {
		t.Fatalf("expected %v, got %v", expectedErr, err)
	}
}

func TestSecretStoreServiceSetDelegatesToBackend(t *testing.T) {
	backend := &fakeSecretBackend{}
	service := newSecretStoreService("Qingyu-Editor", backend)

	if err := service.Set("ai.provider.api-key", "sk-123"); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if backend.lastSetKey != "Qingyu-Editor:ai.provider.api-key" {
		t.Fatalf("unexpected set key: %s", backend.lastSetKey)
	}
	if backend.lastSetVal != "sk-123" {
		t.Fatalf("unexpected set value: %s", backend.lastSetVal)
	}
}

func TestSecretStoreServiceDeleteIgnoresMissingSecret(t *testing.T) {
	backend := &fakeSecretBackend{deleteErr: secretkeyring.ErrNotFound}
	service := newSecretStoreService("Qingyu-Editor", backend)

	if err := service.Delete("ai.provider.api-key"); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
}

func TestSecretStoreServiceDeletePassesThroughUnexpectedError(t *testing.T) {
	expectedErr := errors.New("boom")
	backend := &fakeSecretBackend{deleteErr: expectedErr}
	service := newSecretStoreService("Qingyu-Editor", backend)

	err := service.Delete("ai.provider.api-key")
	if !errors.Is(err, expectedErr) {
		t.Fatalf("expected %v, got %v", expectedErr, err)
	}
}
