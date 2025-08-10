import { useInfiniteQuery } from "@tanstack/react-query";
import { itemsApi } from "./api";
import type { GetItemsParams } from "@/types/api";
import { useMemo } from "react";

export function useItems(params: GetItemsParams = {}, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["items", params],
    queryFn: ({ pageParam }) => 
      itemsApi.list({ 
        ...params,
        before: pageParam as string | undefined
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // API client unwraps the response to just the data: { items: [], nextCursor: "" }
      return lastPage.nextCursor || undefined;
    },
    select: (data) => {
      const items = data.pages.flatMap(page => {
        // API client unwraps to the data object: { items: [], nextCursor: "..." }
        return page.items ?? [];
      });
      return {
        pages: data.pages,
        pageParams: data.pageParams,
        items,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFilteredItems(sourceIds: string[], tags: string[], lang: 'en' | 'he' = 'en') {
  // Simplified approach: Let the backend handle filtering logic
  const params = useMemo((): GetItemsParams => {
    const result: GetItemsParams = {
      lang,
      limit: 20,
    };
    
    // Add filters if they exist
    if (sourceIds.length > 0) {
      result.sourceIds = [...sourceIds].sort();
    }
    
    if (tags.length > 0) {
      result.tags = [...tags].sort();
    }
    

    
    return result;
  }, [
    lang, 
    sourceIds.length,
    tags.length,
    sourceIds.sort().join(','),
    tags.sort().join(',')
  ]);
  
  return useItems(params);
}
