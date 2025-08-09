import { useQuery } from "@tanstack/react-query";
import { postsApi } from "./api";
import type { GetPostsRequest, GetPostsResponse } from "@/types/api";

export function usePosts(params: GetPostsRequest = {}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => postsApi.list(params),
    staleTime: 30_000,
  });
}

export type UsePostsResult = ReturnType<typeof usePosts> & {
  data: GetPostsResponse | undefined;
};


