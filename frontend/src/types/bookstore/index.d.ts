export interface Category {
  id: string;
  name: string;
  bookCount?: number;
  icon?: string;
  children?: Category[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  wordCount?: number;
  status?: 'ongoing' | 'completed';
  rating?: number;
  viewCount?: number;
  likeCount?: number;
  updatedAt?: string;
}

export interface RankingItem {
  book: Book;
  score: number;
  change?: number;
}

export interface SearchParams {
  keyword?: string;
  categoryId?: string;
  status?: string;
  minWordCount?: number;
  maxWordCount?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

