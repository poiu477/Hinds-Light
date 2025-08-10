import { apiClient } from "@/lib/apiClient";
import type { GetItemsParams } from "@/types/api";

// Type for what the API client actually returns (unwrapped data)
type ItemsApiResponse = {
  items: import("@/types/api").NewsItem[];
  nextCursor: string | null;
};

export const itemsApi = {
  list: (params: GetItemsParams = {}) => {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.before) queryParams.before = params.before;
    if (params.sourceId) queryParams.sourceId = params.sourceId;
    if (params.sourceIds && params.sourceIds.length > 0) {
      queryParams.sourceIds = params.sourceIds.join(',');
    }
    if (params.tags && params.tags.length > 0) {
      queryParams.tags = params.tags.join(',');
    }
    if (params.lang) queryParams.lang = params.lang;
    
    return apiClient.get<ItemsApiResponse>("/v1/items", queryParams);
  }
};
