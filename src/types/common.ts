
/**
 * Common type definitions used across the application
 */

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
}

export interface FilterParams {
  searchTerm?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ComponentWithLoading {
  isLoading?: boolean;
  error?: string | null;
}
