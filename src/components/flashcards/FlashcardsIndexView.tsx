import { useState } from "react";
import type { FlashcardDTO, FlashcardStatus } from "@/types";
import { useFlashcardsList } from "./hooks/useFlashcardsList";
import { Header } from "./Header";
import { FlashcardsList } from "./FlashcardsList";
import { CreateFlashcardDialog } from "./CreateFlashcardDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { ErrorBoundary } from "./ErrorBoundary";

export interface FlashcardsListFilters {
  status?: FlashcardStatus;
  source?: "ai-full" | "ai-edited" | "manual";
  sort: "created_at" | "updated_at";
  order: "asc" | "desc";
}

export interface FlashcardsListState {
  items: FlashcardDTO[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  filters: FlashcardsListFilters;
  selectedIds: string[];
}

export function FlashcardsIndexView() {
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteFlashcardId, setDeleteFlashcardId] = useState<string | null>(null);

  // Custom hook for managing flashcards list
  const {
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
  } = useFlashcardsList();

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 space-y-6">
        <Header
          onCreateClick={() => setIsCreateDialogOpen(true)}
          onFilterChange={setFilters}
          filters={filters}
        />

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <FlashcardsList
          flashcards={flashcards}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={id => setDeleteFlashcardId(id)}
          onSelect={handleSelect}
          selectedIds={selectedIds}
          isLoading={isLoading}
        />

        <CreateFlashcardDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreate}
        />

        <DeleteConfirmationDialog
          isOpen={!!deleteFlashcardId}
          onClose={() => setDeleteFlashcardId(null)}
          onConfirm={() => {
            if (deleteFlashcardId) {
              handleDelete(deleteFlashcardId);
              setDeleteFlashcardId(null);
            }
          }}
          flashcardId={deleteFlashcardId || ""}
        />
      </div>
    </ErrorBoundary>
  );
}