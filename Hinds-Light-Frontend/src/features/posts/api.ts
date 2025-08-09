import { apiClient } from "@/lib/apiClient";
import type { GetPostsRequest, GetPostsResponse, GetPostResponse } from "@/types/api";

export const postsApi = {
  list: (params: GetPostsRequest = {}) =>
    apiClient.get<GetPostsResponse>("/api/posts", params),

  getById: (id: string) => apiClient.get<GetPostResponse>(`/api/posts/${id}`),
};


