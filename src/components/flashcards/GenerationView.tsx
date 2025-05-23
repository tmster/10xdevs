import { useState } from "react";
import type { FlashcardViewModel, CreateGenerationResponse, UpdateFlashcardCommand, FlashcardStatus, FlashcardDTO } from "@/types";
import { GenerationForm } from "./GenerationForm";
import { FlashcardsList } from "./FlashcardsList";
import { BulkSaveButton } from "./BulkSaveButton";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useApiCall } from "@/hooks/useApiCall";

export function GenerationView() {
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    isLoading: isGenerating,
    error: generationError,
    execute: executeGeneration,
  } = useApiCall<CreateGenerationResponse>();

  const { isLoading: isSaving, error: saveError, execute: executeSave } = useApiCall<void>();

  const handleGeneration = async (text: string, maxCards: number) => {
    const response = await executeGeneration(
      async () => {
        const response = await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, options: { max_cards: maxCards } }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to generate flashcards");
        }

        return response.json();
      },
      {
        onSuccess: (data) => {
          setGenerationId(data.generation_id);
          setFlashcards(data.flashcards.map((card) => ({ ...card, status: "pending" as FlashcardStatus })));
          setSelectedIds([]); // Reset selected IDs when new flashcards are generated
          toast.success("Flashcards generated successfully!");
        },
        onError: (error) => {
          toast.error("Error", {
            description: error.message,
          });
        },
      }
    );

    return response;
  };

  // Handle editing a flashcard
  const handleEdit = async (id: string, data: UpdateFlashcardCommand) => {
    setFlashcards((prevCards) =>
      prevCards.map((card) => {
        if (card.id === id) {
          // Make a copy of the original card
          const updatedCard = { ...card };

          // Update front and back if provided
          if (data.front !== undefined) {
            updatedCard.front = data.front;
          }

          if (data.back !== undefined) {
            updatedCard.back = data.back;
          }

          // Update status if provided, ensuring it's properly typed
          if (data.status !== undefined) {
            // Type guard to ensure status is a valid FlashcardStatus
            if (data.status === "accepted" || data.status === "rejected" || data.status === "pending") {
              updatedCard.status = data.status;
            }
          }

          return updatedCard;
        }
        return card;
      })
    );
  };

  const handleDelete = (id: string) => {
    setFlashcards((cards) => cards.filter((card) => card.id !== id));
    setSelectedIds((ids) => ids.filter((selectedId) => selectedId !== id));
  };

  const handleFlashcardSelect = (id: string) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      return isSelected ? prev.filter((selectedId) => selectedId !== id) : [...prev, id];
    });

    // Update the flashcard status when selected/deselected
    setFlashcards((cards) =>
      cards.map((card) => {
        if (card.id === id) {
          const newStatus = selectedIds.includes(id) ? "pending" as FlashcardStatus : "accepted" as FlashcardStatus;
          return {
            ...card,
            status: newStatus,
          };
        }
        return card;
      })
    );
  };

  const handleSaveSuccess = () => {
    // Update flashcards status after successful save
    setFlashcards((cards) =>
      cards.map((card) => {
        if (selectedIds.includes(card.id)) {
          return {
            ...card,
            status: "accepted" as FlashcardStatus,
          };
        }
        return card;
      })
    );

    toast.success("Flashcards saved successfully!");
  };

  const handleSaveError = () => {
    toast.error("Error", {
      description: "Failed to save flashcards. Please try again.",
    });
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8" data-testid="generation-view">
        <GenerationForm onSubmit={handleGeneration} isLoading={isGenerating} />

        {generationError && (
          <Alert variant="destructive" data-testid="generation-error">
            <AlertDescription>{generationError.message}</AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert variant="destructive" data-testid="save-error">
            <AlertDescription>{saveError.message}</AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <div className="space-y-4" data-testid="loading-skeleton">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isGenerating && flashcards.length > 0 && (
          <div data-testid="generated-flashcards">
            <FlashcardsList
              flashcards={flashcards}
              pagination={{ page: 1, perPage: 10, total: flashcards.length }}
              selectedIds={selectedIds}
              isLoading={isGenerating}
              onPageChange={() => {}} // No pagination needed for generated cards
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleFlashcardSelect}
            />
            {flashcards.some(card => card.status === "accepted" || selectedIds.includes(card.id)) && (
              <div className="mt-4">
                <BulkSaveButton
                  generationId={generationId!}
                  flashcards={flashcards}
                  onSuccess={handleSaveSuccess}
                  onError={handleSaveError}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
