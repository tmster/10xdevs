import { useState, useEffect } from "react";
import type { FlashcardStatus } from "@/types";
import { useFlashcardsList } from "./hooks/useFlashcardsList";
import { Header } from "./Header";
import { FlashcardsList } from "./FlashcardsList";
import { CreateFlashcardDialog } from "./CreateFlashcardDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { ErrorBoundary } from "./ErrorBoundary";

interface Filters {
  status?: string;
  source?: string;
  sort: string;
  order: string;
}

interface FlashcardsIndexViewProps {
  initialFilters?: Filters;
}

export interface FlashcardsListFilters {
  status?: FlashcardStatus;
  source?: "ai-full" | "ai-edited" | "manual";
  sort: "created_at" | "updated_at";
  order: "asc" | "desc";
}

export function FlashcardsIndexView({ initialFilters }: FlashcardsIndexViewProps) {
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteFlashcardId, setDeleteFlashcardId] = useState<string | null>(null);

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

  // Initialize filters from URL parameters
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        status: initialFilters.status as FlashcardStatus | undefined,
        source: initialFilters.source as "ai-full" | "ai-edited" | "manual" | undefined,
        sort: (initialFilters.sort || "created_at") as "created_at" | "updated_at",
        order: (initialFilters.order || "desc") as "asc" | "desc",
      });
    }
  }, [initialFilters, setFilters]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 space-y-6">
        <Header onCreateClick={() => setIsCreateDialogOpen(true)} onFilterChange={setFilters} filters={filters} />

        {error && <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">{error}</div>}

        <FlashcardsList
          flashcards={flashcards}
          pagination={pagination}
          selectedIds={selectedIds}
          isLoading={isLoading}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteFlashcardId(id)}
          onSelect={handleSelect}
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
