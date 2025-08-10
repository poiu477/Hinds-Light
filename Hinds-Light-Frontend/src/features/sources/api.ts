import { apiClient } from "@/lib/apiClient";
import type { 
  GetSourcesResponse, 
  GetCategoriesResponse, 
  CreateSourceRequest, 
  Source 
} from "@/types/api";

export interface GetSourcesParams {
  category?: string;
  active?: boolean;
}

// Type for what the API client actually returns (unwrapped data)
type SourcesApiResponse = import("@/types/api").Source[];
type CategoriesApiResponse = string[];

export const sourcesApi = {
  list: (params: GetSourcesParams = {}) =>
    apiClient.get<SourcesApiResponse>("/v1/sources", params),

  getCategories: () =>
    apiClient.get<CategoriesApiResponse>("/v1/sources/categories"),

  create: (data: CreateSourceRequest) =>
    apiClient.post<Source>("/v1/sources", data),

  getById: (id: string) =>
    apiClient.get<Source>(`/v1/sources/${id}`),

  update: (id: string, data: Partial<CreateSourceRequest>) =>
    apiClient.put<Source>(`/v1/sources/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/v1/sources/${id}`),
};
