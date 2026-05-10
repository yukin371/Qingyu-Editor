package database

import (
	"database/sql"
	_ "embed"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	_ "github.com/mattn/go-sqlite3"
)

// DB 全局数据库实例
var DB *sql.DB
var dbMu sync.Mutex

//go:embed schema.sql
var schemaSQL string

// Init 初始化 SQLite 数据库，执行迁移
func Init(appName string) error {
	dbMu.Lock()
	defer dbMu.Unlock()

	if DB != nil {
		return nil
	}

	dataDir, err := userDataDir(appName)
	if err != nil {
		return fmt.Errorf("获取数据目录失败: %w", err)
	}

	dbPath := filepath.Join(dataDir, "qingyu-editor.db")
	DB, err = sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_foreign_keys=on&_loc=auto")
	if err != nil {
		return fmt.Errorf("打开数据库失败: %w", err)
	}

	if err := DB.Ping(); err != nil {
		DB.Close()
		DB = nil
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	if err := migrate(); err != nil {
		DB.Close()
		DB = nil
		return fmt.Errorf("数据库迁移失败: %w", err)
	}

	return nil
}

func Ensure(appName string) error {
	return Init(appName)
}

func Get() (*sql.DB, error) {
	if DB == nil {
		return nil, fmt.Errorf("数据库尚未初始化")
	}
	return DB, nil
}

// Close 关闭数据库连接
func Close() error {
	dbMu.Lock()
	defer dbMu.Unlock()

	if DB != nil {
		err := DB.Close()
		DB = nil
		return err
	}
	return nil
}

// userDataDir 获取用户数据目录
func userDataDir(appName string) (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(configDir, appName)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	return dir, nil
}

// migrate 执行数据库迁移
func migrate() error {
	_, err := DB.Exec(schemaSQL)
	return err
}
