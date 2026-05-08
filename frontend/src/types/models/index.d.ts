// Shared models can be extended as needed
export interface BaseModel {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterListItem extends BaseModel {
  title: string;
  isFree: boolean;
  wordCount: number;
  isRead?: boolean;
}

export interface BookBrief extends BaseModel {
  title: string;
  author: string;
  cover: string;
  rating?: number;
}

// Re-export browse types using reference
export type { BrowseFilters } from './browse'



