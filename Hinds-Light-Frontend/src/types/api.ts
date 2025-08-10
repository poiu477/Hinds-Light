export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Post {
  id: string;
  sourceId: string;
  sourcePlatform: "x" | "news" | "court" | "political";
  originalText: string;
  translatedText: string;
  author: {
    username: string;
    displayName: string;
    verified: boolean;
    followerCount?: number;
  };
  url: string;
  timestamp: Date;
  sentiment: "positive" | "negative" | "neutral" | null;
  tags: string[];
  keywords: string[];
  metrics: {
    likes: number;
    shares: number;
    replies: number;
  };
  translationConfidence: number;
  flagged: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query?: string;
  sentiment?: "positive" | "negative" | "neutral";
  platform?: "x" | "news" | "court" | "political";
  dateFrom?: string;
  dateTo?: string;
  author?: string;
  tags?: string[];
  verified?: boolean;
  minEngagement?: number;
}

export interface GetPostsRequest {
  page?: number;
  limit?: number;
  filters?: SearchFilters;
  sortBy?: "timestamp" | "engagement" | "sentiment";
  sortOrder?: "asc" | "desc";
}

export interface GetPostsResponse extends APIResponse<Post[]> {
  pagination: PaginationMeta;
}

export type GetPostResponse = APIResponse<Post>;

export interface SearchRequest {
  query: string;
  page?: number;
  limit?: number;
  filters?: SearchFilters;
  highlight?: boolean;
}

export interface SearchResponse extends APIResponse<Post[]> {
  pagination: PaginationMeta;
  facets: {
    platforms: Array<{ platform: string; count: number }>;
    sentiments: Array<{ sentiment: string; count: number }>;
    authors: Array<{ author: string; count: number }>;
    tags: Array<{ tag: string; count: number }>;
  };
  suggestions?: string[];
}

export interface AutocompleteRequest {
  query: string;
  type?: "all" | "authors" | "tags" | "keywords";
}

export type AutocompleteResponse = APIResponse<string[]>;

export type OverviewResponse = APIResponse<{
  totalPosts: number;
  postsToday: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topAuthors: Array<{
    username: string;
    postCount: number;
    avgSentiment: number;
  }>;
  platformBreakdown: Array<{
    platform: string;
    count: number;
  }>;
  trendsOver30Days: Array<{
    date: string;
    count: number;
    sentiment: number;
  }>;
}>;

export interface SentimentTrendsRequest {
  period?: "day" | "week" | "month";
  dateFrom?: string;
  dateTo?: string;
}

export type SentimentTrendsResponse = APIResponse<
  Array<{
    date: string;
    positive: number;
    negative: number;
    neutral: number;
  }>
>;

export type TopKeywordsResponse = APIResponse<
  Array<{
    keyword: string;
    count: number;
    sentiment: number;
  }>
>;

export interface TranslateRequest {
  text: string;
  from?: string; // Default: 'he'
  to?: string; // Default: 'en'
}

export type TranslateResponse = APIResponse<{
  originalText: string;
  translatedText: string;
  confidence: number;
  detectedLanguage: string;
}>;

export interface UpdateTranslationRequest {
  translatedText: string;
  verified: boolean;
}

export type SourceType = 'RSS' | 'X' | 'TELEGRAM' | 'YOUTUBE' | 'WEBSITE';

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  url?: string;
  displayName?: string;
  alignment?: string; // Manual alignment field (legacy)
  language: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: string[]; // RSS feed categories extracted from content
  _count?: {
    items: number;
  };
}

export type GetSourcesResponse = APIResponse<Source[]>;

export interface CreateSourceRequest {
  type: SourceType;
  name: string;
  url: string;
  displayName?: string;
  alignment?: string;
  language?: string;
  active?: boolean;
}

export type GetCategoriesResponse = APIResponse<string[]>;

export type ToggleSourceResponse = APIResponse<{ active: boolean }>;

export type CollectionStatusResponse = APIResponse<{
  isRunning: boolean;
  lastRun: Date;
  nextRun: Date;
  stats: {
    postsCollectedToday: number;
    translationsQueued: number;
    errors: number;
  };
  recentErrors: Array<{
    timestamp: Date;
    source: string;
    error: string;
  }>;
}>;

export interface TriggerCollectionRequest {
  sources?: string[];
}

export type CollectionLogsResponse = APIResponse<
  Array<{
    timestamp: Date;
    level: "info" | "warn" | "error";
    message: string;
    source?: string;
    metadata?: unknown;
  }>
>;

export interface FlagPostRequest {
  reason: "spam" | "misinformation" | "inappropriate" | "translation_error" | "other";
  note?: string;
}

export type ModerationQueueResponse = APIResponse<
  Array<
    Post & {
      flagReason: string;
      flagNote?: string;
      flaggedAt: Date;
    }
  >
>;

export interface ResolveFlagRequest {
  action: "approve" | "hide" | "delete" | "correct_translation";
  note?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export type LoginResponse = APIResponse<{
  token: string;
  user: {
    id: string;
    username: string;
    role: "admin" | "moderator" | "viewer";
  };
}>;

export interface RateLimitHeaders {
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
}

export interface NewsItem {
  id: string;
  sourceId: string;
  type: string;
  title: string | null;
  url: string | null;
  publishedAt: string | null;
  language: string;
  text: string;
  originalLanguage: string;
  originalText: string;
  translatedLanguage: string | null;
  translatedText: string | null;
  translationStatus: string;
  tags: string[];
  translatedTags: string[];
}

export interface GetItemsResponse {
  success: boolean;
  data: {
    items: NewsItem[];
    nextCursor: string | null;
  };
}

export interface GetItemsParams {
  limit?: number;
  before?: string;
  sourceId?: string;
  sourceIds?: string[];
  tags?: string[];
  lang?: 'en' | 'he';
}


