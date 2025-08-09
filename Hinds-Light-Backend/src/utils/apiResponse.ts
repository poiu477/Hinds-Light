export interface APIResponse<T = any> {
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

export function ok<T>(data: T, pagination?: PaginationMeta): APIResponse<T> {
  return { success: true, data, ...(pagination ? { pagination } : {}) };
}

export function fail(error: string, message?: string): APIResponse<never> {
  return { success: false, error, ...(message ? { message } : {}) };
}


