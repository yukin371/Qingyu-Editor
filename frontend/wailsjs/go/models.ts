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

