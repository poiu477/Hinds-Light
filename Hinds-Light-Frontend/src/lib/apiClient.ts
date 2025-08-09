import { APIResponse } from "@/types/api";

export class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export class APIClient {
  private baseURL: string;
  private token?: string;
  private tokenProvider?: () => string | undefined;

  constructor(baseURL?: string) {
    // Prefer same-origin proxy by default; fall back to env
    this.baseURL = baseURL ?? (process.env.NEXT_PUBLIC_API_URL || "/api");
  }

  setToken(token?: string) {
    this.token = token;
  }

  setTokenProvider(provider?: () => string | undefined) {
    this.tokenProvider = provider;
  }

  async get<T>(endpoint: string, params?: object): Promise<T> {
    const url = this.composeUrl(endpoint, params);
    const response = await fetch(url, { headers: this.getHeaders() });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(this.composeUrl(endpoint), {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(this.composeUrl(endpoint), {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(this.composeUrl(endpoint), {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  private composeUrl(endpoint: string, params?: object): string {
    const base = this.baseURL.endsWith("/") ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${base}${path}`, typeof window === "undefined" ? "http://localhost" : undefined);
    if (params) {
      for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const v of value) url.searchParams.append(key, String(v));
          continue;
        }
        if (typeof value === 'object') {
          url.searchParams.set(key, JSON.stringify(value));
          continue;
        }
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString().replace(/^http:\/\/localhost\//, "/");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const dynamicToken = this.tokenProvider ? this.tokenProvider() : undefined;
    const token = dynamicToken ?? this.token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const parsed: unknown = await response.json();
    if (!response.ok) {
      const message = this.extractErrorMessage(parsed) ?? "Request failed";
      throw new APIError(message, response.status);
    }
    // Support both wrapped and unwrapped responses
    if (this.isApiResponse(parsed)) {
      return (parsed.data as T) ?? (parsed as T);
    }
    return parsed as T;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isApiResponse(value: unknown): value is APIResponse<unknown> {
    return this.isRecord(value) && ("data" in value || "error" in value || "success" in value);
  }

  private extractErrorMessage(value: unknown): string | null {
    if (this.isApiResponse(value) && typeof value.error === 'string') return value.error;
    if (this.isRecord(value) && typeof (value as { message?: unknown }).message === 'string') {
      return (value as { message: string }).message;
    }
    return null;
  }
}

export const apiClient = new APIClient();


