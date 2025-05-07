import { useState, useRef, useEffect } from "react";
import type { FlashcardDTO, UpdateFlashcardCommand } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FlashcardsListSkeleton } from "./FlashcardSkeleton";

/**
 * Props for the FlashcardsList component
 * @interface FlashcardsListProps
 */
interface FlashcardsListProps {
  /** Array of flashcards to display */
  flashcards: FlashcardDTO[];
  /** Pagination state */
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  /** Array of selected flashcard IDs */
  selectedIds: string[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Callback for page change */
  onPageChange: (page: number) => void;
  /** Callback for editing a flashcard */
  onEdit: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  /** Callback for deleting a flashcard */
  onDelete: (id: string) => void;
  /** Callback for selecting a flashcard */
  onSelect: (id: string) => void;
}

/**
 * State for tracking flashcard editing
 * @interface EditingState
 */
interface EditingState {
  /** ID of the flashcard being edited, null if no flashcard is being edited */
  id: string | null;
  /** Current front side text in the editor */
  front: string;
  /** Current back side text in the editor */
  back: string;
}

/**
 * FlashcardsList component displays a list of flashcards with editing, deletion, and selection capabilities
 * Includes pagination and loading states
 *
 * @component
 * @example
 * ```tsx
 * <FlashcardsList
 *   flashcards={flashcards}
 *   pagination={{ page: 1, perPage: 10, total: 100 }}
 *   selectedIds={[]}
 *   isLoading={false}
 *   onPageChange={(page) => {}}
 *   onEdit={(id, data) => {}}
 *   onDelete={(id) => {}}
 *   onSelect={(id) => {}}
 * />
 * ```
 */
export function FlashcardsList({
  flashcards = [],
  pagination = { page: 1, perPage: 10, total: 0 },
  selectedIds = [],
  isLoading = false,
  onPageChange,
  onEdit,
  onDelete,
  onSelect,
}: FlashcardsListProps) {
  const [editing, setEditing] = useState<EditingState>({
    id: null,
    front: "",
    back: "",
  });

  const editFrontInputRef = useRef<HTMLInputElement>(null);
  const editButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus management for editing mode
  useEffect(() => {
    if (editing.id && editFrontInputRef.current) {
      editFrontInputRef.current.focus();
    }
  }, [editing.id]);

  const startEditing = (flashcard: FlashcardDTO) => {
    setEditing({
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
    });
  };

  const cancelEditing = () => {
    setEditing({ id: null, front: "", back: "" });
  };

  const saveEditing = async () => {
    if (!editing.id) return;

    await onEdit(editing.id, {
      front: editing.front,
      back: editing.back,
      status: "accepted",
    });
    cancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent, flashcard: FlashcardDTO) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      startEditing(flashcard);
    } else if (e.key === "Delete" && e.shiftKey) {
      e.preventDefault();
      onDelete(flashcard.id);
    }
  };

  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.perPage || 10));

  if (isLoading) {
    return <FlashcardsListSkeleton />;
  }

  if (!flashcards?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground" role="status" aria-label="No flashcards found">
        No flashcards found
      </div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Flashcards list">
      <div className="grid gap-4">
        {flashcards.map((flashcard, index) => (
          <Card
            key={flashcard.id}
            className="overflow-hidden"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, flashcard)}
            role="article"
            aria-label={`Flashcard ${index + 1} of ${flashcards.length}`}
            data-testid={`flashcard-item-${flashcard.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  id={`select-${flashcard.id}`}
                  checked={selectedIds?.includes(flashcard.id)}
                  onCheckedChange={() => onSelect(flashcard.id)}
                  className="mt-1"
                  aria-label={`Select flashcard ${index + 1}`}
                />
                <div className="flex-1 space-y-4">
                  {editing.id === flashcard.id ? (
                    <>
                      <div role="form" aria-label="Edit flashcard">
                        <Input
                          ref={editFrontInputRef}
                          value={editing.front}
                          onChange={(e) => setEditing((prev) => ({ ...prev, front: e.target.value }))}
                          placeholder="Front side"
                          aria-label="Front side text"
                        />
                        <Input
                          value={editing.back}
                          onChange={(e) => setEditing((prev) => ({ ...prev, back: e.target.value }))}
                          placeholder="Back side"
                          aria-label="Back side text"
                          className="mt-4"
                        />
                        <div className="flex gap-2 mt-4">
                          <Button onClick={saveEditing} size="sm" aria-label="Save changes">
                            Save
                          </Button>
                          <Button onClick={cancelEditing} variant="outline" size="sm" aria-label="Cancel editing">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="font-medium" id={`front-${flashcard.id}`}>
                          Front
                        </div>
                        <div className="text-sm text-muted-foreground" aria-labelledby={`front-${flashcard.id}`}>
                          {flashcard.front}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium" id={`back-${flashcard.id}`}>
                          Back
                        </div>
                        <div className="text-sm text-muted-foreground" aria-labelledby={`back-${flashcard.id}`}>
                          {flashcard.back}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          ref={(el) => {
                            editButtonRefs.current[index] = el;
                          }}
                          onClick={() => startEditing(flashcard)}
                          variant="outline"
                          size="sm"
                          aria-label={`Edit flashcard ${index + 1}`}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDelete(flashcard.id)}
                          variant="destructive"
                          size="sm"
                          aria-label={`Delete flashcard ${index + 1}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <nav role="navigation" aria-label="Flashcards pagination" className="mt-6">
          <Pagination className="justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(pagination.page - 1)}
                  isActive={pagination.page > 1}
                  aria-label="Go to previous page"
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={page === pagination.page}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === pagination.page ? "page" : undefined}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(pagination.page + 1)}
                  isActive={pagination.page < totalPages}
                  aria-label="Go to next page"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </nav>
      )}
    </div>
  );
}
