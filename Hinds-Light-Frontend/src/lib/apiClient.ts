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

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
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

  private composeUrl(endpoint: string, params?: Record<string, unknown>): string {
    const base = this.baseURL.endsWith("/") ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${base}${path}`, typeof window === "undefined" ? "http://localhost" : undefined);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
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
    const data = (await response.json()) as APIResponse<T> | T;
    if (!response.ok) {
      const message = (data as APIResponse)?.error || (data as any)?.message || "Request failed";
      throw new APIError(message, response.status);
    }
    // Support both wrapped and unwrapped responses
    return (data as APIResponse<T>)?.data ?? (data as T);
  }
}

export const apiClient = new APIClient();


