import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sourcesApi, type GetSourcesParams } from "./api";
import type { CreateSourceRequest } from "@/types/api";

export function useSources(params: GetSourcesParams = {}) {
  return useQuery({
    queryKey: ["sources", params],
    queryFn: () => sourcesApi.list(params),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["sources", "categories"],
    queryFn: () => sourcesApi.getCategories(),
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: ["sources", id],
    queryFn: () => sourcesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSourceRequest) => sourcesApi.create(data),
    onSuccess: () => {
      // Invalidate sources queries to refetch
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}

export function useUpdateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSourceRequest> }) =>
      sourcesApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific source and sources list
      queryClient.invalidateQueries({ queryKey: ["sources", id] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sourcesApi.delete(id),
    onSuccess: () => {
      // Invalidate sources queries to refetch
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}
