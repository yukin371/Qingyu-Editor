package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"Qingyu-Editor/database/sqlc"
)

const sqliteTimestampLayout = "2006-01-02 15:04:05"

func formatSQLiteTime(value time.Time) string {
	if value.IsZero() {
		return ""
	}
	return value.UTC().Format(sqliteTimestampLayout)
}

func toNullString(value string) sql.NullString {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: trimmed, Valid: true}
}

func toOptionalNullString(value string) sql.NullString {
	if strings.TrimSpace(value) == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: value, Valid: true}
}

func toNullInt64(value int) sql.NullInt64 {
	return sql.NullInt64{Int64: int64(value), Valid: true}
}

func ensureProjectExists(ctx context.Context, queries *sqlc.Queries, projectID string) error {
	exists, err := queries.ProjectExists(ctx, projectID)
	if err != nil {
		return fmt.Errorf("查询项目失败: %w", err)
	}
	if exists == 0 {
		return errors.New("项目不存在")
	}
	return nil
}
