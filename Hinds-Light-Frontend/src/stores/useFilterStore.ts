"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FilterState {
  // Selected sources for filtering
  selectedSources: string[];
  
  // Selected tags for filtering  
  selectedTags: string[];
  
  // Actions
  toggleSource: (sourceId: string) => void;
  toggleTag: (tag: string) => void;
  clearSourceFilters: () => void;
  clearTagFilters: () => void;
  clearAllFilters: () => void;
  setSelectedSources: (sourceIds: string[]) => void;
  setSelectedTags: (tags: string[]) => void;
  
  // Computed getters
  hasActiveFilters: () => boolean;
  getFilterSummary: () => string;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      selectedSources: [],
      selectedTags: [],

      toggleSource: (sourceId: string) =>
        set((state) => ({
          selectedSources: state.selectedSources.includes(sourceId)
            ? state.selectedSources.filter((id) => id !== sourceId)
            : [...state.selectedSources, sourceId],
        })),

      toggleTag: (tag: string) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter((t) => t !== tag)
            : [...state.selectedTags, tag],
        })),

      clearSourceFilters: () => set({ selectedSources: [] }),
      
      clearTagFilters: () => set({ selectedTags: [] }),
      
      clearAllFilters: () => set({ selectedSources: [], selectedTags: [] }),
      
      setSelectedSources: (sourceIds: string[]) => set({ selectedSources: sourceIds }),
      
      setSelectedTags: (tags: string[]) => set({ selectedTags: tags }),

      hasActiveFilters: () => {
        const state = get();
        return state.selectedSources.length > 0 || state.selectedTags.length > 0;
      },

      getFilterSummary: () => {
        const state = get();
        const parts: string[] = [];
        
        if (state.selectedSources.length > 0) {
          parts.push(`${state.selectedSources.length} source${state.selectedSources.length === 1 ? '' : 's'}`);
        }
        
        if (state.selectedTags.length > 0) {
          parts.push(`${state.selectedTags.length} tag${state.selectedTags.length === 1 ? '' : 's'}`);
        }
        
        return parts.length > 0 ? `Filtered by ${parts.join(' and ')}` : 'No filters active';
      },
    }),
    {
      name: "news-filters",
      storage: createJSONStorage(() => localStorage),
      // Only persist the filter selections, not the computed functions
      partialize: (state) => ({
        selectedSources: state.selectedSources,
        selectedTags: state.selectedTags,
      }),
    }
  )
);
