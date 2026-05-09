package main

import (
	"context"
	"database/sql"

	"Qingyu-Editor/ai"
	"Qingyu-Editor/database"
	"Qingyu-Editor/services"
)

// App 主应用结构
type App struct {
	ctx     context.Context
	appName string
}

// NewApp 创建应用实例
func NewApp() *App {
	return &App{
		appName: "Qingyu-Editor",
	}
}

// startup 应用启动时调用
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	_ = a.ensureDatabase()
}

// shutdown 应用关闭时调用
func (a *App) shutdown(ctx context.Context) {
	database.Close()
}

// InitDatabase 初始化数据库（前端可调用）
func (a *App) InitDatabase() error {
	return a.ensureDatabase()
}

// --- AI 相关 ---

// AICall 调用 AI 提供商
func (a *App) AICall(cfg ai.Config, prompt string, context string) (string, error) {
	provider, err := ai.NewProvider(cfg)
	if err != nil {
		return "", err
	}
	return provider.Call(prompt, context)
}

func (a *App) CreateProject(input database.CreateProjectInput) (database.Project, error) {
	projectService, err := a.projectService()
	if err != nil {
		return database.Project{}, err
	}
	return projectService.Create(input)
}

func (a *App) GetProject(id string) (database.Project, error) {
	projectService, err := a.projectService()
	if err != nil {
		return database.Project{}, err
	}
	return projectService.Get(id)
}

func (a *App) ListProjects() ([]database.Project, error) {
	projectService, err := a.projectService()
	if err != nil {
		return nil, err
	}
	return projectService.List()
}

func (a *App) UpdateProject(id string, update database.ProjectUpdate) (database.Project, error) {
	projectService, err := a.projectService()
	if err != nil {
		return database.Project{}, err
	}
	return projectService.Update(id, update)
}

func (a *App) DeleteProject(id string) error {
	projectService, err := a.projectService()
	if err != nil {
		return err
	}
	return projectService.Delete(id)
}

func (a *App) CreateVolume(input database.CreateVolumeInput) (database.Volume, error) {
	volumeService, err := a.volumeService()
	if err != nil {
		return database.Volume{}, err
	}
	return volumeService.Create(input)
}

func (a *App) ListVolumes(projectID string) ([]database.Volume, error) {
	volumeService, err := a.volumeService()
	if err != nil {
		return nil, err
	}
	return volumeService.List(projectID)
}

func (a *App) UpdateVolume(id string, update database.VolumeUpdate) error {
	volumeService, err := a.volumeService()
	if err != nil {
		return err
	}
	return volumeService.Update(id, update)
}

func (a *App) DeleteVolume(id string) error {
	volumeService, err := a.volumeService()
	if err != nil {
		return err
	}
	return volumeService.Delete(id)
}

func (a *App) ReorderVolumes(input database.ReorderVolumesInput) error {
	volumeService, err := a.volumeService()
	if err != nil {
		return err
	}
	return volumeService.Reorder(input)
}

func (a *App) CreateChapter(input database.CreateChapterInput) (database.Chapter, error) {
	chapterService, err := a.chapterService()
	if err != nil {
		return database.Chapter{}, err
	}
	return chapterService.Create(input)
}

func (a *App) GetChapter(id string) (database.Chapter, error) {
	chapterService, err := a.chapterService()
	if err != nil {
		return database.Chapter{}, err
	}
	return chapterService.Get(id)
}

func (a *App) ListChapters(projectID string) ([]database.Chapter, error) {
	chapterService, err := a.chapterService()
	if err != nil {
		return nil, err
	}
	return chapterService.List(projectID)
}

func (a *App) UpdateChapter(id string, update database.ChapterUpdate) (database.Chapter, error) {
	chapterService, err := a.chapterService()
	if err != nil {
		return database.Chapter{}, err
	}
	return chapterService.Update(id, update)
}

func (a *App) DeleteChapter(id string) error {
	chapterService, err := a.chapterService()
	if err != nil {
		return err
	}
	return chapterService.Delete(id)
}

func (a *App) ReorderChapters(input database.ReorderChaptersInput) error {
	chapterService, err := a.chapterService()
	if err != nil {
		return err
	}
	return chapterService.Reorder(input)
}

func (a *App) MoveChapter(input database.MoveChapterInput) error {
	chapterService, err := a.chapterService()
	if err != nil {
		return err
	}
	return chapterService.Move(input)
}

func (a *App) ensureDatabase() error {
	return database.Ensure(a.appName)
}

func (a *App) projectService() (*services.ProjectService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	return services.NewProjectService(db), nil
}

func (a *App) volumeService() (*services.VolumeService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	return services.NewVolumeService(db), nil
}

func (a *App) chapterService() (*services.ChapterService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	return services.NewChapterService(db), nil
}

func (a *App) serviceDB() (*sql.DB, error) {
	if err := a.ensureDatabase(); err != nil {
		return nil, err
	}
	return database.Get()
}
