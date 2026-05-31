package main

import (
	"context"
	"database/sql"
	"sync"

	"Qingyu-Editor/ai"
	"Qingyu-Editor/database"
	"Qingyu-Editor/services"
	"Qingyu-Editor/services/agent"
)

type appServices struct {
	project          *services.ProjectService
	volume           *services.VolumeService
	chapter          *services.ChapterService
	character        *services.CharacterService
	location         *services.LocationService
	secretStore      *services.SecretStoreService
	settings         *services.SettingsService
	template         *services.TemplateService
	creativeWorkflow *services.CreativeWorkflowService
	inspiration      *services.InspirationService
	timeline         *services.TimelineService
	storyHarness     *services.StoryHarnessService
	agent            *agent.AgentService
	review           *agent.ReviewService
	conversation     *agent.ConversationService
}

// App 主应用结构
type App struct {
	ctx       context.Context
	appName   string
	dbMu      sync.Mutex
	serviceMu sync.Mutex
	db        *sql.DB
	services  appServices
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
	a.dbMu.Lock()
	defer a.dbMu.Unlock()
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	database.Close()
	a.db = nil
	a.services = appServices{}
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

func (a *App) GetAppSetting(key string) (string, error) {
	settingsService, err := a.settingsService()
	if err != nil {
		return "", err
	}
	return settingsService.Get(key)
}

func (a *App) SetAppSetting(key string, value string) error {
	settingsService, err := a.settingsService()
	if err != nil {
		return err
	}
	return settingsService.Set(key, value)
}

func (a *App) DeleteAppSetting(key string) error {
	settingsService, err := a.settingsService()
	if err != nil {
		return err
	}
	return settingsService.Delete(key)
}

func (a *App) GetAppSecret(key string) (string, error) {
	secretStoreService, err := a.secretStoreService()
	if err != nil {
		return "", err
	}
	return secretStoreService.Get(key)
}

func (a *App) SetAppSecret(key string, value string) error {
	secretStoreService, err := a.secretStoreService()
	if err != nil {
		return err
	}
	return secretStoreService.Set(key, value)
}

func (a *App) DeleteAppSecret(key string) error {
	secretStoreService, err := a.secretStoreService()
	if err != nil {
		return err
	}
	return secretStoreService.Delete(key)
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

func (a *App) CreateCharacter(input database.CreateCharacterInput) (database.Character, error) {
	characterService, err := a.characterService()
	if err != nil {
		return database.Character{}, err
	}
	return characterService.Create(input)
}

func (a *App) GetCharacter(id string) (database.Character, error) {
	characterService, err := a.characterService()
	if err != nil {
		return database.Character{}, err
	}
	return characterService.Get(id)
}

func (a *App) ListCharacters(projectID string) ([]database.Character, error) {
	characterService, err := a.characterService()
	if err != nil {
		return nil, err
	}
	return characterService.List(projectID)
}

func (a *App) UpdateCharacter(id string, update database.CharacterUpdate) (database.Character, error) {
	characterService, err := a.characterService()
	if err != nil {
		return database.Character{}, err
	}
	return characterService.Update(id, update)
}

func (a *App) DeleteCharacter(id string) error {
	characterService, err := a.characterService()
	if err != nil {
		return err
	}
	return characterService.Delete(id)
}

func (a *App) CreateCharacterRelation(input database.CreateCharacterRelationInput) (database.CharacterRelation, error) {
	characterService, err := a.characterService()
	if err != nil {
		return database.CharacterRelation{}, err
	}
	return characterService.CreateRelation(input)
}

func (a *App) ListCharacterRelations(projectID string, characterID string) ([]database.CharacterRelation, error) {
	characterService, err := a.characterService()
	if err != nil {
		return nil, err
	}
	return characterService.ListRelations(projectID, characterID)
}

func (a *App) DeleteCharacterRelation(id string) error {
	characterService, err := a.characterService()
	if err != nil {
		return err
	}
	return characterService.DeleteRelation(id)
}

func (a *App) CreateLocation(input database.CreateLocationInput) (database.Location, error) {
	locationService, err := a.locationService()
	if err != nil {
		return database.Location{}, err
	}
	return locationService.Create(input)
}

func (a *App) GetLocation(id string) (database.Location, error) {
	locationService, err := a.locationService()
	if err != nil {
		return database.Location{}, err
	}
	return locationService.Get(id)
}

func (a *App) ListLocations(projectID string) ([]database.Location, error) {
	locationService, err := a.locationService()
	if err != nil {
		return nil, err
	}
	return locationService.List(projectID)
}

func (a *App) UpdateLocation(id string, update database.LocationUpdate) (database.Location, error) {
	locationService, err := a.locationService()
	if err != nil {
		return database.Location{}, err
	}
	return locationService.Update(id, update)
}

func (a *App) DeleteLocation(id string) error {
	locationService, err := a.locationService()
	if err != nil {
		return err
	}
	return locationService.Delete(id)
}

func (a *App) CreateLocationRelation(input database.CreateLocationRelationInput) (database.LocationRelation, error) {
	locationService, err := a.locationService()
	if err != nil {
		return database.LocationRelation{}, err
	}
	return locationService.CreateRelation(input)
}

func (a *App) ListLocationRelations(projectID string, locationID string) ([]database.LocationRelation, error) {
	locationService, err := a.locationService()
	if err != nil {
		return nil, err
	}
	return locationService.ListRelations(projectID, locationID)
}

func (a *App) DeleteLocationRelation(id string) error {
	locationService, err := a.locationService()
	if err != nil {
		return err
	}
	return locationService.DeleteRelation(id)
}

func (a *App) ListWorkbenchTemplates() ([]database.CreativeWorkflowTemplate, error) {
	templateService, err := a.templateService()
	if err != nil {
		return nil, err
	}
	return templateService.List(), nil
}

func (a *App) GetWorkbenchTemplateDetail(templateID string) (database.CreativeWorkflowTemplate, error) {
	templateService, err := a.templateService()
	if err != nil {
		return database.CreativeWorkflowTemplate{}, err
	}
	return templateService.Get(templateID)
}

func (a *App) GetCreativeWorkflow(projectID string) (database.CreativeWorkflowRecord, error) {
	creativeWorkflowService, err := a.creativeWorkflowService()
	if err != nil {
		return database.CreativeWorkflowRecord{}, err
	}
	return creativeWorkflowService.Get(projectID)
}

func (a *App) SaveCreativeWorkflow(
	projectID string,
	update database.CreativeWorkflowUpdate,
) (database.CreativeWorkflowRecord, error) {
	creativeWorkflowService, err := a.creativeWorkflowService()
	if err != nil {
		return database.CreativeWorkflowRecord{}, err
	}
	return creativeWorkflowService.Save(projectID, update)
}

func (a *App) ListInspirationNotes(projectID string) ([]database.InspirationNote, error) {
	inspirationService, err := a.inspirationService()
	if err != nil {
		return nil, err
	}
	return inspirationService.List(projectID)
}

func (a *App) CreateInspirationNote(
	input database.CreateInspirationNoteInput,
) (database.InspirationNote, error) {
	inspirationService, err := a.inspirationService()
	if err != nil {
		return database.InspirationNote{}, err
	}
	return inspirationService.Create(input)
}

func (a *App) DeleteInspirationNote(id string) error {
	inspirationService, err := a.inspirationService()
	if err != nil {
		return err
	}
	return inspirationService.Delete(id)
}

func (a *App) CreateTimeline(input database.CreateTimelineInput) (database.Timeline, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return database.Timeline{}, err
	}
	return timelineService.Create(input)
}

func (a *App) GetTimeline(id string) (database.Timeline, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return database.Timeline{}, err
	}
	return timelineService.Get(id)
}

func (a *App) ListTimelines(projectID string) ([]database.Timeline, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return nil, err
	}
	return timelineService.List(projectID)
}

func (a *App) UpdateTimeline(id string, update database.TimelineUpdate) (database.Timeline, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return database.Timeline{}, err
	}
	return timelineService.Update(id, update)
}

func (a *App) DeleteTimeline(id string) error {
	timelineService, err := a.timelineService()
	if err != nil {
		return err
	}
	return timelineService.Delete(id)
}

func (a *App) GetTimelineVisualization(
	timelineID string,
) (database.TimelineVisualization, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return database.TimelineVisualization{}, err
	}
	return timelineService.GetVisualization(timelineID)
}

func (a *App) CreateTimelineEvent(
	input database.CreateTimelineEventInput,
) (database.TimelineEvent, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return database.TimelineEvent{}, err
	}
	return timelineService.CreateEvent(input)
}

func (a *App) GetTimelineEvent(id string) (database.TimelineEvent, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return database.TimelineEvent{}, err
	}
	return timelineService.GetEvent(id)
}

func (a *App) ListTimelineEvents(timelineID string) ([]database.TimelineEvent, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return nil, err
	}
	return timelineService.ListEvents(timelineID)
}

func (a *App) UpdateTimelineEvent(
	id string,
	update database.TimelineEventUpdate,
) (database.TimelineEvent, error) {
	timelineService, err := a.timelineService()
	if err != nil {
		return database.TimelineEvent{}, err
	}
	return timelineService.UpdateEvent(id, update)
}

func (a *App) DeleteTimelineEvent(id string) error {
	timelineService, err := a.timelineService()
	if err != nil {
		return err
	}
	return timelineService.DeleteEvent(id)
}

func (a *App) CreateStoryHarnessBatch(
	input database.CreateStoryHarnessBatchInput,
) (database.StoryHarnessBatch, error) {
	storyHarnessService, err := a.storyHarnessService()
	if err != nil {
		return database.StoryHarnessBatch{}, err
	}
	return storyHarnessService.CreateBatch(input)
}

func (a *App) GetLatestStoryHarnessBatch(
	projectID string,
	chapterID string,
) (*database.StoryHarnessBatch, error) {
	storyHarnessService, err := a.storyHarnessService()
	if err != nil {
		return nil, err
	}
	return storyHarnessService.GetLatestBatch(projectID, chapterID)
}

func (a *App) GetStoryHarnessChapterContext(
	projectID string,
	chapterID string,
) (database.StoryHarnessChapterContext, error) {
	storyHarnessService, err := a.storyHarnessService()
	if err != nil {
		return database.StoryHarnessChapterContext{}, err
	}
	return storyHarnessService.GetChapterContext(projectID, chapterID)
}

func (a *App) ListStoryHarnessChangeRequests(
	projectID string,
	chapterID string,
	status string,
) ([]database.StoryHarnessChangeRequest, error) {
	storyHarnessService, err := a.storyHarnessService()
	if err != nil {
		return nil, err
	}
	return storyHarnessService.ListChangeRequests(projectID, chapterID, status)
}

func (a *App) ProcessStoryHarnessChangeRequest(
	requestID string,
	update database.StoryHarnessChangeRequestStatusUpdate,
) (database.StoryHarnessChangeRequest, error) {
	storyHarnessService, err := a.storyHarnessService()
	if err != nil {
		return database.StoryHarnessChangeRequest{}, err
	}
	return storyHarnessService.ProcessChangeRequest(requestID, update)
}

func (a *App) TriggerStoryHarnessIndex(
	projectID string,
	chapterID string,
) (database.StoryHarnessTriggerIndexResult, error) {
	storyHarnessService, err := a.storyHarnessService()
	if err != nil {
		return database.StoryHarnessTriggerIndexResult{}, err
	}
	return storyHarnessService.TriggerIndex(projectID, chapterID)
}

func (a *App) RebuildStoryHarnessProjection(
	projectID string,
	chapterID string,
) (database.StoryHarnessRebuildProjectionResult, error) {
	storyHarnessService, err := a.storyHarnessService()
	if err != nil {
		return database.StoryHarnessRebuildProjectionResult{}, err
	}
	return storyHarnessService.RebuildProjection(projectID, chapterID)
}

func (a *App) ensureDatabase() error {
	return database.Ensure(a.appName)
}

// --- Agent 智能体 ---

func (a *App) AgentProcessIntent(
	cfg ai.Config,
	projectID string,
	intent string,
	editorCtx agent.EditorContext,
) (*agent.AgentResult, error) {
	agentSvc, err := a.agentService(cfg)
	if err != nil {
		return nil, err
	}
	return agentSvc.ProcessIntent(a.ctx, projectID, intent, editorCtx)
}

// --- Agent 对话持久化 ---

func (a *App) CreateAgentConversation(projectID string) (*agent.Conversation, error) {
	svc, err := a.conversationService()
	if err != nil {
		return nil, err
	}
	return svc.Create(projectID)
}

func (a *App) ListAgentConversations(projectID string) ([]agent.Conversation, error) {
	svc, err := a.conversationService()
	if err != nil {
		return nil, err
	}
	return svc.ListByProject(projectID)
}

func (a *App) GetAgentConversation(id string) (*agent.Conversation, error) {
	svc, err := a.conversationService()
	if err != nil {
		return nil, err
	}
	return svc.GetWithMessages(id)
}

func (a *App) DeleteAgentConversation(id string) error {
	svc, err := a.conversationService()
	if err != nil {
		return err
	}
	return svc.Delete(id)
}

func (a *App) SaveAgentMessage(conversationID string, msg agent.ConversationMessage) (*agent.ConversationMessage, error) {
	svc, err := a.conversationService()
	if err != nil {
		return nil, err
	}
	return svc.SaveMessage(conversationID, msg)
}

func (a *App) UpdateAgentConversationTitle(id string, title string) error {
	svc, err := a.conversationService()
	if err != nil {
		return err
	}
	return svc.UpdateTitle(id, title)
}

// --- Agent 审查智能体 ---

func (a *App) ReviewChapter(
	cfg ai.Config,
	projectID string,
	chapterID string,
	chapterTitle string,
) (*agent.ReviewResult, error) {
	reviewSvc, err := a.reviewService(cfg)
	if err != nil {
		return nil, err
	}
	return reviewSvc.ReviewChapter(a.ctx, projectID, chapterID, chapterTitle)
}

func (a *App) ReviewFullProject(
	cfg ai.Config,
	projectID string,
) (*agent.ReviewResult, error) {
	reviewSvc, err := a.reviewService(cfg)
	if err != nil {
		return nil, err
	}
	return reviewSvc.ReviewFullProject(a.ctx, projectID)
}

func (a *App) reviewService(cfg ai.Config) (*agent.ReviewService, error) {
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.review != nil {
		return a.services.review, nil
	}

	chatProvider := ai.NewOpenAIChatProvider(cfg)

	charSvc, err := a.characterService()
	if err != nil {
		return nil, err
	}
	volSvc, err := a.volumeService()
	if err != nil {
		return nil, err
	}
	chSvc, err := a.chapterService()
	if err != nil {
		return nil, err
	}

	router := agent.NewToolRouter()
	router.Register(agent.NewListCharactersTool(charSvc))
	router.Register(agent.NewGetCharacterTool(charSvc))
	router.Register(agent.NewGetCharacterRelationsTool(charSvc))
	router.Register(agent.NewListVolumesChaptersTool(volSvc, chSvc))
	router.Register(agent.NewGetChapterContentTool(chSvc))

	a.services.review = agent.NewReviewService(chatProvider, router)
	return a.services.review, nil
}

func (a *App) agentService(cfg ai.Config) (*agent.AgentService, error) {
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.agent != nil {
		return a.services.agent, nil
	}

	chatProvider := ai.NewOpenAIChatProvider(cfg)

	charSvc, err := a.characterService()
	if err != nil {
		return nil, err
	}
	volSvc, err := a.volumeService()
	if err != nil {
		return nil, err
	}
	chSvc, err := a.chapterService()
	if err != nil {
		return nil, err
	}

	router := agent.NewToolRouter()
	router.Register(agent.NewListCharactersTool(charSvc))
	router.Register(agent.NewGetCharacterTool(charSvc))
	router.Register(agent.NewGetCharacterRelationsTool(charSvc))
	router.Register(agent.NewListVolumesChaptersTool(volSvc, chSvc))
	router.Register(agent.NewGetChapterContentTool(chSvc))
	router.Register(agent.NewSuggestChapterContentTool(chSvc))
	router.Register(agent.NewSuggestCharacterTool())
	router.Register(agent.NewSuggestOutlineTool())
	router.Register(agent.NewSuggestRevisionTool(chSvc))

	a.services.agent = agent.NewAgentService(chatProvider, router)
	return a.services.agent, nil
}

func (a *App) conversationService() (*agent.ConversationService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.conversation == nil {
		a.services.conversation = agent.NewConversationService(db)
	}
	return a.services.conversation, nil
}

func (a *App) projectService() (*services.ProjectService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.project == nil {
		a.services.project = services.NewProjectService(db)
	}
	return a.services.project, nil
}

func (a *App) volumeService() (*services.VolumeService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.volume == nil {
		a.services.volume = services.NewVolumeService(db)
	}
	return a.services.volume, nil
}

func (a *App) chapterService() (*services.ChapterService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.chapter == nil {
		a.services.chapter = services.NewChapterService(db)
	}
	return a.services.chapter, nil
}

func (a *App) characterService() (*services.CharacterService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.character == nil {
		a.services.character = services.NewCharacterService(db)
	}
	return a.services.character, nil
}

func (a *App) locationService() (*services.LocationService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.location == nil {
		a.services.location = services.NewLocationService(db)
	}
	return a.services.location, nil
}

func (a *App) settingsService() (*services.SettingsService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.settings == nil {
		a.services.settings = services.NewSettingsService(db)
	}
	return a.services.settings, nil
}

func (a *App) secretStoreService() (*services.SecretStoreService, error) {
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.secretStore == nil {
		a.services.secretStore = services.NewSecretStoreService(a.appName)
	}
	return a.services.secretStore, nil
}

func (a *App) templateService() (*services.TemplateService, error) {
	_, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.template == nil {
		a.services.template = services.NewTemplateService()
	}
	return a.services.template, nil
}

func (a *App) creativeWorkflowService() (*services.CreativeWorkflowService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.creativeWorkflow == nil {
		a.services.creativeWorkflow = services.NewCreativeWorkflowService(db)
	}
	return a.services.creativeWorkflow, nil
}

func (a *App) inspirationService() (*services.InspirationService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.inspiration == nil {
		a.services.inspiration = services.NewInspirationService(db)
	}
	return a.services.inspiration, nil
}

func (a *App) timelineService() (*services.TimelineService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.timeline == nil {
		a.services.timeline = services.NewTimelineService(db)
	}
	return a.services.timeline, nil
}

func (a *App) storyHarnessService() (*services.StoryHarnessService, error) {
	db, err := a.serviceDB()
	if err != nil {
		return nil, err
	}
	a.serviceMu.Lock()
	defer a.serviceMu.Unlock()
	if a.services.storyHarness == nil {
		a.services.storyHarness = services.NewStoryHarnessService(db)
	}
	return a.services.storyHarness, nil
}

func (a *App) serviceDB() (*sql.DB, error) {
	a.dbMu.Lock()
	defer a.dbMu.Unlock()
	if a.db != nil {
		return a.db, nil
	}

	if err := a.ensureDatabase(); err != nil {
		return nil, err
	}

	db, err := database.Get()
	if err != nil {
		return nil, err
	}
	a.db = db
	return a.db, nil
}
