package services

import (
	"fmt"
	"os"
	"testing"
	"time"
)

func TestSecretStoreServiceSystemBackendRoundTrip(t *testing.T) {
	if os.Getenv("QINGYU_RUN_SECRET_STORE_INTEGRATION") != "1" {
		t.Skip("skip system secret store integration; set QINGYU_RUN_SECRET_STORE_INTEGRATION=1 to enable")
	}

	serviceName := fmt.Sprintf("Qingyu-Editor-Test-%d", time.Now().UnixNano())
	key := "ai.provider.api-key"
	value := "sk-integration-test-value-123456"

	writer := NewSecretStoreService(serviceName)
	if err := writer.Delete(key); err != nil {
		t.Fatalf("cleanup before set failed: %v", err)
	}
	t.Cleanup(func() {
		_ = writer.Delete(key)
	})

	if err := writer.Set(key, value); err != nil {
		t.Fatalf("set secret failed: %v", err)
	}

	reader := NewSecretStoreService(serviceName)
	got, err := reader.Get(key)
	if err != nil {
		t.Fatalf("get secret failed: %v", err)
	}
	if got != value {
		t.Fatalf("expected %q, got %q", value, got)
	}

	if err := reader.Delete(key); err != nil {
		t.Fatalf("delete secret failed: %v", err)
	}

	afterDelete, err := NewSecretStoreService(serviceName).Get(key)
	if err != nil {
		t.Fatalf("get after delete failed: %v", err)
	}
	if afterDelete != "" {
		t.Fatalf("expected empty value after delete, got %q", afterDelete)
	}
}
