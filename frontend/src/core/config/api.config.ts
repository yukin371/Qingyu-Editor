/**
 * API Configuration
 * Configuration for API endpoints and HTTP client
 */

export interface APIConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

export const apiConfig: APIConfig = {
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
}

// API Endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },

  // Bookstore endpoints
  bookstore: {
    homepage: '/bookstore/homepage',
    books: '/bookstore/books',
    categories: '/bookstore/categories',
    rankings: '/bookstore/rankings',
    banners: '/bookstore/banners',
    search: '/bookstore/books/search',
  },

  // Reader endpoints
  reader: {
    bookshelf: '/reader/bookshelf',
    history: '/reader/history',
    bookmarks: '/reader/bookmarks',
    comments: '/reader/comments',
    rating: '/reader/rating',
  },

  // User endpoints
  user: {
    profile: '/user/profile',
    wallet: '/user/wallet',
    settings: '/user/settings',
  },

  // Writer endpoints
  writer: {
    projects: '/writer/projects',
    documents: '/writer/documents',
    statistics: '/writer/statistics',
    revenue: '/writer/revenue',
  },
}

export default apiConfig
