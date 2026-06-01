export namespace ai {

	export class Config {
	    provider: string;
	    apiKey: string;
	    baseUrl: string;
	    model: string;

	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.provider = source["provider"];
	        this.apiKey = source["apiKey"];
	        this.baseUrl = source["baseUrl"];
	        this.model = source["model"];
	    }
	}

}

export namespace agent {

	export class EditorContext {
	    currentChapterId: string;
	    cursorPosition: number;
	    selectedText: string;
	    nearbyCharacters: string[];

	    static createFrom(source: any = {}) {
	        return new EditorContext(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.currentChapterId = source["currentChapterId"] || source["current_chapter_id"];
	        this.cursorPosition = source["cursorPosition"] || source["cursor_position"];
	        this.selectedText = source["selectedText"] || source["selected_text"];
	        this.nearbyCharacters = source["nearbyCharacters"] || source["nearby_characters"] || [];
	    }
	}

	export class Suggestion {
	    id: string;
	    type: string;
	    action: string;
	    targetEntity: string;
	    targetId: string;
	    content: string;
	    originalContent: string;
	    summary: string;

	    static createFrom(source: any = {}) {
	        return new Suggestion(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.action = source["action"];
	        this.targetEntity = source["targetEntity"] || source["target_entity"];
	        this.targetId = source["targetId"] || source["target_id"];
	        this.content = source["content"];
	        this.originalContent = source["originalContent"] || source["original_content"];
	        this.summary = source["summary"];
	    }
	}

	export class AgentResult {
	    content: string;
	    suggestions: Suggestion[] = [];

	    static createFrom(source: any = {}) {
	        return new AgentResult(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.content = source["content"];
	        if (source["suggestions"]) {
	            this.suggestions = source["suggestions"].map((i: any) => new Suggestion(i));
	        }
	    }
	}
	export class ConversationMessage {
	    id: string;
	    role: string;
	    content: string;
	    suggestions!: Suggestion[];
	    timestamp: string;

	    static createFrom(source: any = {}) {
	        return new ConversationMessage(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.role = source["role"];
	        this.content = source["content"];
	        if (source["suggestions"]) {
	            this.suggestions = source["suggestions"].map((i: any) => new Suggestion(i));
	        }
	        this.timestamp = source["timestamp"];
	    }
	}
	export class Conversation {
	    id: string;
	    projectId: string;
	    title: string;
	    createdAt: string;
	    updatedAt: string;
	    messages!: ConversationMessage[];

	    static createFrom(source: any = {}) {
	        return new Conversation(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"] || source["project_id"];
	        this.title = source["title"];
	        this.createdAt = source["createdAt"] || source["created_at"];
	        this.updatedAt = source["updatedAt"] || source["updated_at"];
	        if (source["messages"]) {
	            this.messages = source["messages"].map((i: any) => new ConversationMessage(i));
	        }
	    }
	}

	export class ReviewResult {
	    content: string;
	    type: string;

	    static createFrom(source: any = {}) {
	        return new ReviewResult(source);
	    }

	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.content = source["content"];
	        this.type = source["type"];
	    }
	}

}

export namespace database {
	
	export class Chapter {
	    id: string;
	    projectId: string;
	    volumeId: string;
	    title: string;
	    content: string;
	    plainText: string;
	    wordCount: number;
	    sortOrder: number;
	    status: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Chapter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.volumeId = source["volumeId"];
	        this.title = source["title"];
	        this.content = source["content"];
	        this.plainText = source["plainText"];
	        this.wordCount = source["wordCount"];
	        this.sortOrder = source["sortOrder"];
	        this.status = source["status"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class ChapterUpdate {
	    title?: string;
	    content?: string;
	    plainText?: string;
	    wordCount?: number;
	    sortOrder?: number;
	    status?: string;
	    volumeId?: string;
	
	    static createFrom(source: any = {}) {
	        return new ChapterUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.content = source["content"];
	        this.plainText = source["plainText"];
	        this.wordCount = source["wordCount"];
	        this.sortOrder = source["sortOrder"];
	        this.status = source["status"];
	        this.volumeId = source["volumeId"];
	    }
	}
	export class Character {
	    id: string;
	    projectId: string;
	    name: string;
	    alias: string[];
	    summary: string;
	    traits: string[];
	    background: string;
	    avatarUrl: string;
	    personalityPrompt: string;
	    speechPattern: string;
	    currentState: string;
	    customStatus: Record<string, any>;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Character(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.name = source["name"];
	        this.alias = source["alias"];
	        this.summary = source["summary"];
	        this.traits = source["traits"];
	        this.background = source["background"];
	        this.avatarUrl = source["avatarUrl"];
	        this.personalityPrompt = source["personalityPrompt"];
	        this.speechPattern = source["speechPattern"];
	        this.currentState = source["currentState"];
	        this.customStatus = source["customStatus"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class CharacterRelation {
	    id: string;
	    projectId: string;
	    fromId: string;
	    toId: string;
	    type: string;
	    strength: number;
	    notes: string;
	    validFromChapterId: string;
	    validUntilChapterId: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new CharacterRelation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.fromId = source["fromId"];
	        this.toId = source["toId"];
	        this.type = source["type"];
	        this.strength = source["strength"];
	        this.notes = source["notes"];
	        this.validFromChapterId = source["validFromChapterId"];
	        this.validUntilChapterId = source["validUntilChapterId"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class CharacterUpdate {
	    name?: string;
	    alias?: string[];
	    summary?: string;
	    traits?: string[];
	    background?: string;
	    avatarUrl?: string;
	    personalityPrompt?: string;
	    speechPattern?: string;
	    currentState?: string;
	    customStatus?: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new CharacterUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.alias = source["alias"];
	        this.summary = source["summary"];
	        this.traits = source["traits"];
	        this.background = source["background"];
	        this.avatarUrl = source["avatarUrl"];
	        this.personalityPrompt = source["personalityPrompt"];
	        this.speechPattern = source["speechPattern"];
	        this.currentState = source["currentState"];
	        this.customStatus = source["customStatus"];
	    }
	}
	export class CreateChapterInput {
	    projectId: string;
	    volumeId: string;
	    title: string;
	    content: string;
	    plainText: string;
	    wordCount?: number;
	    sortOrder?: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateChapterInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.volumeId = source["volumeId"];
	        this.title = source["title"];
	        this.content = source["content"];
	        this.plainText = source["plainText"];
	        this.wordCount = source["wordCount"];
	        this.sortOrder = source["sortOrder"];
	        this.status = source["status"];
	    }
	}
	export class CreateCharacterInput {
	    projectId: string;
	    name: string;
	    alias: string[];
	    summary: string;
	    traits: string[];
	    background: string;
	    avatarUrl: string;
	    personalityPrompt: string;
	    speechPattern: string;
	    currentState: string;
	    customStatus: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new CreateCharacterInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.name = source["name"];
	        this.alias = source["alias"];
	        this.summary = source["summary"];
	        this.traits = source["traits"];
	        this.background = source["background"];
	        this.avatarUrl = source["avatarUrl"];
	        this.personalityPrompt = source["personalityPrompt"];
	        this.speechPattern = source["speechPattern"];
	        this.currentState = source["currentState"];
	        this.customStatus = source["customStatus"];
	    }
	}
	export class CreateCharacterRelationInput {
	    projectId: string;
	    fromId: string;
	    toId: string;
	    type: string;
	    strength?: number;
	    notes: string;
	    validFromChapterId: string;
	    validUntilChapterId: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateCharacterRelationInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.fromId = source["fromId"];
	        this.toId = source["toId"];
	        this.type = source["type"];
	        this.strength = source["strength"];
	        this.notes = source["notes"];
	        this.validFromChapterId = source["validFromChapterId"];
	        this.validUntilChapterId = source["validUntilChapterId"];
	    }
	}
	export class CreateInspirationNoteInput {
	    projectId: string;
	    chapterId: string;
	    chapterTitle: string;
	    title: string;
	    content: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateInspirationNoteInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.chapterId = source["chapterId"];
	        this.chapterTitle = source["chapterTitle"];
	        this.title = source["title"];
	        this.content = source["content"];
	    }
	}
	export class CreateLocationInput {
	    projectId: string;
	    name: string;
	    description: string;
	    climate: string;
	    culture: string;
	    geography: string;
	    atmosphere: string;
	    parentId: string;
	    imageUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateLocationInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.climate = source["climate"];
	        this.culture = source["culture"];
	        this.geography = source["geography"];
	        this.atmosphere = source["atmosphere"];
	        this.parentId = source["parentId"];
	        this.imageUrl = source["imageUrl"];
	    }
	}
	export class CreateLocationRelationInput {
	    projectId: string;
	    fromId: string;
	    toId: string;
	    type: string;
	    distance: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateLocationRelationInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.fromId = source["fromId"];
	        this.toId = source["toId"];
	        this.type = source["type"];
	        this.distance = source["distance"];
	        this.notes = source["notes"];
	    }
	}
	export class CreateProjectInput {
	    title: string;
	    description: string;
	    coverPath: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateProjectInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.description = source["description"];
	        this.coverPath = source["coverPath"];
	        this.status = source["status"];
	    }
	}
	export class StoryHarnessChangeRequestPreview {
	    id: string;
	    source: string;
	    type: string;
	    title: string;
	    summary: string;
	    reason: string;
	    evidence: string;
	    severity: string;
	    sourceTimestamp?: number;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessChangeRequestPreview(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.source = source["source"];
	        this.type = source["type"];
	        this.title = source["title"];
	        this.summary = source["summary"];
	        this.reason = source["reason"];
	        this.evidence = source["evidence"];
	        this.severity = source["severity"];
	        this.sourceTimestamp = source["sourceTimestamp"];
	    }
	}
	export class CreateStoryHarnessBatchInput {
	    projectId: string;
	    chapterId: string;
	    chapterTitle: string;
	    source: string;
	    changeRequests: StoryHarnessChangeRequestPreview[];
	
	    static createFrom(source: any = {}) {
	        return new CreateStoryHarnessBatchInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.chapterId = source["chapterId"];
	        this.chapterTitle = source["chapterTitle"];
	        this.source = source["source"];
	        this.changeRequests = this.convertValues(source["changeRequests"], StoryHarnessChangeRequestPreview);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StoryTime {
	    year?: number;
	    month?: number;
	    day?: number;
	    hour?: number;
	    minute?: number;
	    era?: string;
	    season?: string;
	    description?: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryTime(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.year = source["year"];
	        this.month = source["month"];
	        this.day = source["day"];
	        this.hour = source["hour"];
	        this.minute = source["minute"];
	        this.era = source["era"];
	        this.season = source["season"];
	        this.description = source["description"];
	    }
	}
	export class CreateTimelineEventInput {
	    projectId: string;
	    timelineId: string;
	    title: string;
	    description: string;
	    storyTime: StoryTime;
	    duration: string;
	    impact: string;
	    participants: string[];
	    locationIds: string[];
	    chapterIds: string[];
	    eventType: string;
	    importance?: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateTimelineEventInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.timelineId = source["timelineId"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.storyTime = this.convertValues(source["storyTime"], StoryTime);
	        this.duration = source["duration"];
	        this.impact = source["impact"];
	        this.participants = source["participants"];
	        this.locationIds = source["locationIds"];
	        this.chapterIds = source["chapterIds"];
	        this.eventType = source["eventType"];
	        this.importance = source["importance"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CreateTimelineInput {
	    projectId: string;
	    name: string;
	    description: string;
	    startTime: StoryTime;
	    endTime: StoryTime;
	
	    static createFrom(source: any = {}) {
	        return new CreateTimelineInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.startTime = this.convertValues(source["startTime"], StoryTime);
	        this.endTime = this.convertValues(source["endTime"], StoryTime);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CreateVolumeInput {
	    projectId: string;
	    title: string;
	    sortOrder?: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateVolumeInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.title = source["title"];
	        this.sortOrder = source["sortOrder"];
	    }
	}
	export class GoldenChapterPlan {
	    chapterNumber: number;
	    title: string;
	    summary: string;
	    hook: string;
	    payoff: string;
	
	    static createFrom(source: any = {}) {
	        return new GoldenChapterPlan(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chapterNumber = source["chapterNumber"];
	        this.title = source["title"];
	        this.summary = source["summary"];
	        this.hook = source["hook"];
	        this.payoff = source["payoff"];
	    }
	}
	export class CreativeWorkflowRecord {
	    version: number;
	    projectId: string;
	    templateId: string;
	    pitchLine: string;
	    targetAudience: string[];
	    corePromises: string[];
	    paceContract: string;
	    goldenChapters: GoldenChapterPlan[];
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new CreativeWorkflowRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.projectId = source["projectId"];
	        this.templateId = source["templateId"];
	        this.pitchLine = source["pitchLine"];
	        this.targetAudience = source["targetAudience"];
	        this.corePromises = source["corePromises"];
	        this.paceContract = source["paceContract"];
	        this.goldenChapters = this.convertValues(source["goldenChapters"], GoldenChapterPlan);
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TemplateDetailSection {
	    id: string;
	    title: string;
	    summary: string;
	    bullets: string[];
	
	    static createFrom(source: any = {}) {
	        return new TemplateDetailSection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.summary = source["summary"];
	        this.bullets = source["bullets"];
	    }
	}
	export class CreativeWorkflowTemplate {
	    id: string;
	    name: string;
	    tagline: string;
	    category: string;
	    templateType: string;
	    recommendedLabel: string;
	    applicableTo: string[];
	    emotionCurve: string;
	    payoffFocus: string[];
	    defaultAudience: string[];
	    defaultPromises: string[];
	    defaultPaceContract: string;
	    blueprintHints: string[];
	    goldenChapterSeeds: GoldenChapterPlan[];
	    characters: TemplateDetailSection[];
	    settings: TemplateDetailSection[];
	    projectCategory: string;
	    volumeTitle: string;
	    openingLine: string;
	
	    static createFrom(source: any = {}) {
	        return new CreativeWorkflowTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.tagline = source["tagline"];
	        this.category = source["category"];
	        this.templateType = source["templateType"];
	        this.recommendedLabel = source["recommendedLabel"];
	        this.applicableTo = source["applicableTo"];
	        this.emotionCurve = source["emotionCurve"];
	        this.payoffFocus = source["payoffFocus"];
	        this.defaultAudience = source["defaultAudience"];
	        this.defaultPromises = source["defaultPromises"];
	        this.defaultPaceContract = source["defaultPaceContract"];
	        this.blueprintHints = source["blueprintHints"];
	        this.goldenChapterSeeds = this.convertValues(source["goldenChapterSeeds"], GoldenChapterPlan);
	        this.characters = this.convertValues(source["characters"], TemplateDetailSection);
	        this.settings = this.convertValues(source["settings"], TemplateDetailSection);
	        this.projectCategory = source["projectCategory"];
	        this.volumeTitle = source["volumeTitle"];
	        this.openingLine = source["openingLine"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CreativeWorkflowUpdate {
	    templateId?: string;
	    pitchLine?: string;
	    targetAudience?: string[];
	    corePromises?: string[];
	    paceContract?: string;
	    goldenChapters?: GoldenChapterPlan[];
	
	    static createFrom(source: any = {}) {
	        return new CreativeWorkflowUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.templateId = source["templateId"];
	        this.pitchLine = source["pitchLine"];
	        this.targetAudience = source["targetAudience"];
	        this.corePromises = source["corePromises"];
	        this.paceContract = source["paceContract"];
	        this.goldenChapters = this.convertValues(source["goldenChapters"], GoldenChapterPlan);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class InspirationNote {
	    id: string;
	    projectId: string;
	    chapterId: string;
	    chapterTitle: string;
	    title: string;
	    content: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new InspirationNote(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.chapterId = source["chapterId"];
	        this.chapterTitle = source["chapterTitle"];
	        this.title = source["title"];
	        this.content = source["content"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class Location {
	    id: string;
	    projectId: string;
	    name: string;
	    description: string;
	    climate: string;
	    culture: string;
	    geography: string;
	    atmosphere: string;
	    parentId: string;
	    imageUrl: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Location(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.climate = source["climate"];
	        this.culture = source["culture"];
	        this.geography = source["geography"];
	        this.atmosphere = source["atmosphere"];
	        this.parentId = source["parentId"];
	        this.imageUrl = source["imageUrl"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class LocationRelation {
	    id: string;
	    projectId: string;
	    fromId: string;
	    toId: string;
	    type: string;
	    distance: string;
	    notes: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new LocationRelation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.fromId = source["fromId"];
	        this.toId = source["toId"];
	        this.type = source["type"];
	        this.distance = source["distance"];
	        this.notes = source["notes"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class LocationUpdate {
	    name?: string;
	    description?: string;
	    climate?: string;
	    culture?: string;
	    geography?: string;
	    atmosphere?: string;
	    parentId?: string;
	    imageUrl?: string;
	
	    static createFrom(source: any = {}) {
	        return new LocationUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.climate = source["climate"];
	        this.culture = source["culture"];
	        this.geography = source["geography"];
	        this.atmosphere = source["atmosphere"];
	        this.parentId = source["parentId"];
	        this.imageUrl = source["imageUrl"];
	    }
	}
	export class MoveChapterInput {
	    chapterId: string;
	    targetVolumeId?: string;
	    targetIndex: number;
	
	    static createFrom(source: any = {}) {
	        return new MoveChapterInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chapterId = source["chapterId"];
	        this.targetVolumeId = source["targetVolumeId"];
	        this.targetIndex = source["targetIndex"];
	    }
	}
	export class Project {
	    id: string;
	    title: string;
	    description: string;
	    coverPath: string;
	    wordCount: number;
	    status: string;
	    chapterCount: number;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.coverPath = source["coverPath"];
	        this.wordCount = source["wordCount"];
	        this.status = source["status"];
	        this.chapterCount = source["chapterCount"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class ProjectUpdate {
	    title?: string;
	    description?: string;
	    coverPath?: string;
	    status?: string;
	
	    static createFrom(source: any = {}) {
	        return new ProjectUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.description = source["description"];
	        this.coverPath = source["coverPath"];
	        this.status = source["status"];
	    }
	}
	export class ReorderChaptersInput {
	    projectId: string;
	    volumeId?: string;
	    orderedIds: string[];
	
	    static createFrom(source: any = {}) {
	        return new ReorderChaptersInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.volumeId = source["volumeId"];
	        this.orderedIds = source["orderedIds"];
	    }
	}
	export class ReorderVolumesInput {
	    projectId: string;
	    orderedIds: string[];
	
	    static createFrom(source: any = {}) {
	        return new ReorderVolumesInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.orderedIds = source["orderedIds"];
	    }
	}
	export class StoryHarnessBatch {
	    batchId: string;
	    projectId: string;
	    chapterId: string;
	    chapterTitle: string;
	    committedAt: number;
	    source: string;
	    changeRequests: StoryHarnessChangeRequestPreview[];
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessBatch(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.batchId = source["batchId"];
	        this.projectId = source["projectId"];
	        this.chapterId = source["chapterId"];
	        this.chapterTitle = source["chapterTitle"];
	        this.committedAt = source["committedAt"];
	        this.source = source["source"];
	        this.changeRequests = this.convertValues(source["changeRequests"], StoryHarnessChangeRequestPreview);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StoryHarnessEvidence {
	    documentId: string;
	    paragraphIdx: number;
	    quoteText: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessEvidence(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.documentId = source["documentId"];
	        this.paragraphIdx = source["paragraphIdx"];
	        this.quoteText = source["quoteText"];
	    }
	}
	export class StoryHarnessChangeRequest {
	    id: string;
	    batchId: string;
	    projectId: string;
	    chapterId: string;
	    category: string;
	    priority: string;
	    status: string;
	    title: string;
	    description: string;
	    suggestedChange: Record<string, any>;
	    evidence: StoryHarnessEvidence[];
	    source: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessChangeRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.batchId = source["batchId"];
	        this.projectId = source["projectId"];
	        this.chapterId = source["chapterId"];
	        this.category = source["category"];
	        this.priority = source["priority"];
	        this.status = source["status"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.suggestedChange = source["suggestedChange"];
	        this.evidence = this.convertValues(source["evidence"], StoryHarnessEvidence);
	        this.source = source["source"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class StoryHarnessChangeRequestStatusUpdate {
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessChangeRequestStatusUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status = source["status"];
	    }
	}
	export class StoryHarnessRelationContext {
	    id: string;
	    fromId: string;
	    toId: string;
	    fromName: string;
	    toName: string;
	    type: string;
	    strength: number;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessRelationContext(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.fromId = source["fromId"];
	        this.toId = source["toId"];
	        this.fromName = source["fromName"];
	        this.toName = source["toName"];
	        this.type = source["type"];
	        this.strength = source["strength"];
	        this.notes = source["notes"];
	    }
	}
	export class StoryHarnessCharacterContext {
	    id: string;
	    name: string;
	    alias: string[];
	    traits: string[];
	    currentState: string;
	    shortDescription: string;
	    avatarUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessCharacterContext(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.alias = source["alias"];
	        this.traits = source["traits"];
	        this.currentState = source["currentState"];
	        this.shortDescription = source["shortDescription"];
	        this.avatarUrl = source["avatarUrl"];
	    }
	}
	export class StoryHarnessChapterContext {
	    characters: StoryHarnessCharacterContext[];
	    relations: StoryHarnessRelationContext[];
	    pendingCRs: number;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessChapterContext(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.characters = this.convertValues(source["characters"], StoryHarnessCharacterContext);
	        this.relations = this.convertValues(source["relations"], StoryHarnessRelationContext);
	        this.pendingCRs = source["pendingCRs"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class StoryHarnessRebuildProjectionResult {
	    projectId: string;
	    chapterId: string;
	    replayedCount: number;
	    lastRequestId: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessRebuildProjectionResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.chapterId = source["chapterId"];
	        this.replayedCount = source["replayedCount"];
	        this.lastRequestId = source["lastRequestId"];
	    }
	}
	
	export class StoryHarnessTriggerIndexResult {
	    batchId: string;
	    generated: number;
	    pending: number;
	    deduplicated: number;
	    source: string;
	
	    static createFrom(source: any = {}) {
	        return new StoryHarnessTriggerIndexResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.batchId = source["batchId"];
	        this.generated = source["generated"];
	        this.pending = source["pending"];
	        this.deduplicated = source["deduplicated"];
	        this.source = source["source"];
	    }
	}
	
	
	export class Timeline {
	    id: string;
	    projectId: string;
	    name: string;
	    description: string;
	    startTime: StoryTime;
	    endTime: StoryTime;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Timeline(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.startTime = this.convertValues(source["startTime"], StoryTime);
	        this.endTime = this.convertValues(source["endTime"], StoryTime);
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TimelineEvent {
	    id: string;
	    projectId: string;
	    timelineId: string;
	    title: string;
	    description: string;
	    storyTime: StoryTime;
	    duration: string;
	    impact: string;
	    participants: string[];
	    locationIds: string[];
	    chapterIds: string[];
	    eventType: string;
	    importance: number;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new TimelineEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.timelineId = source["timelineId"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.storyTime = this.convertValues(source["storyTime"], StoryTime);
	        this.duration = source["duration"];
	        this.impact = source["impact"];
	        this.participants = source["participants"];
	        this.locationIds = source["locationIds"];
	        this.chapterIds = source["chapterIds"];
	        this.eventType = source["eventType"];
	        this.importance = source["importance"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TimelineEventUpdate {
	    title?: string;
	    description?: string;
	    storyTime?: StoryTime;
	    duration?: string;
	    impact?: string;
	    participants?: string[];
	    locationIds?: string[];
	    chapterIds?: string[];
	    eventType?: string;
	    importance?: number;
	
	    static createFrom(source: any = {}) {
	        return new TimelineEventUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.description = source["description"];
	        this.storyTime = this.convertValues(source["storyTime"], StoryTime);
	        this.duration = source["duration"];
	        this.impact = source["impact"];
	        this.participants = source["participants"];
	        this.locationIds = source["locationIds"];
	        this.chapterIds = source["chapterIds"];
	        this.eventType = source["eventType"];
	        this.importance = source["importance"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TimelineUpdate {
	    name?: string;
	    description?: string;
	    startTime?: StoryTime;
	    endTime?: StoryTime;
	
	    static createFrom(source: any = {}) {
	        return new TimelineUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.startTime = this.convertValues(source["startTime"], StoryTime);
	        this.endTime = this.convertValues(source["endTime"], StoryTime);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TimelineVisualization {
	    timeline: Timeline;
	    events: TimelineEvent[];
	
	    static createFrom(source: any = {}) {
	        return new TimelineVisualization(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.timeline = this.convertValues(source["timeline"], Timeline);
	        this.events = this.convertValues(source["events"], TimelineEvent);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Volume {
	    id: string;
	    projectId: string;
	    title: string;
	    sortOrder: number;
	    createdAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Volume(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.title = source["title"];
	        this.sortOrder = source["sortOrder"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class VolumeUpdate {
	    title?: string;
	    sortOrder?: number;
	
	    static createFrom(source: any = {}) {
	        return new VolumeUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.sortOrder = source["sortOrder"];
	    }
	}

}

