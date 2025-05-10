import { useState, useCallback, useEffect } from "react";
import type { FlashcardDTO, CreateFlashcardCommand, UpdateFlashcardCommand } from "@/types";
import type { FlashcardsListFilters } from "../FlashcardsIndexView";

interface UseFlashcardsListReturn {
  flashcards: FlashcardDTO[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  filters: FlashcardsListFilters;
  selectedIds: string[];
  isLoading: boolean;
  error: string | null;
  setFilters: (filters: FlashcardsListFilters) => void;
  setPage: (page: number) => void;
  handleCreate: (data: CreateFlashcardCommand) => Promise<void>;
  handleEdit: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleSelect: (id: string) => void;
}

const DEFAULT_FILTERS: FlashcardsListFilters = {
  sort: "created_at",
  order: "desc",
  status: "accepted"
};

const PER_PAGE = 10;

export function useFlashcardsList(): UseFlashcardsListReturn {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: PER_PAGE,
    total: 0,
  });
  const [filters, setFilters] = useState<FlashcardsListFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch flashcards
  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        limit: String(pagination.perPage),
        offset: String((pagination.page - 1) * pagination.perPage),
        sort: filters.sort,
        order: filters.order,
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),
      });

      const response = await fetch(`/api/flashcards?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch flashcards");

      const data = await response.json();
      setFlashcards(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleCreate = async (data: CreateFlashcardCommand) => {
    try {
      setError(null);
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create flashcard");
      await fetchFlashcards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flashcard");
      throw err;
    }
  };

  const handleEdit = async (id: string, data: UpdateFlashcardCommand) => {
    try {
      setError(null);
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update flashcard");

      // Optimistic update
      setFlashcards((prev) => prev.map((card) => (card.id === id ? { ...card, ...data } : card)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update flashcard");
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete flashcard");

      // Optimistic update
      setFlashcards((prev) => prev.filter((card) => card.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete flashcard");
      throw err;
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      return isSelected ? prev.filter((selectedId) => selectedId !== id) : [...prev, id];
    });
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return {
    flashcards,
    pagination,
    filters,
    selectedIds,
    isLoading,
    error,
    setFilters,
    setPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSelect,
  };
}
