export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  location?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  birthday?: string;
  location?: string;
  role?: 'admin' | 'writer' | 'user';
  createdAt?: string;
  stats?: {
    booksCount?: number;
    wordsCount?: number;
    followersCount?: number;
    collectCount?: number;
  };
}

