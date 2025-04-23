import { useState } from "react";
import type { FlashcardViewModel, CreateGenerationResponse } from "@/types";
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

  const {
    isLoading: isGenerating,
    error: generationError,
    execute: executeGeneration
  } = useApiCall<CreateGenerationResponse>();

  const {
    isLoading: isSaving,
    error: saveError,
    execute: executeSave
  } = useApiCall<void>();

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
          setFlashcards(data.flashcards.map((card) => ({ ...card, status: "pending" })));
          toast.success("Flashcards generated successfully!");
        },
        onError: (error) => {
          toast.error("Error", {
            description: error.message,
          });
        }
      }
    );

    return response;
  };

  const handleFlashcardUpdate = (id: string, updates: Partial<FlashcardViewModel>) => {
    setFlashcards((cards) => cards.map((card) => (card.id === id ? { ...card, ...updates } : card)));
  };

  const handleSaveSuccess = () => {
    toast.success("Flashcards saved successfully!");
  };

  const handleSaveError = () => {
    toast.error("Error", {
      description: "Failed to save flashcards. Please try again.",
    });
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <GenerationForm onSubmit={handleGeneration} isLoading={isGenerating} />

        {generationError && (
          <Alert variant="destructive">
            <AlertDescription>{generationError.message}</AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert variant="destructive">
            <AlertDescription>{saveError.message}</AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <div className="space-y-4">
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
          <>
            <FlashcardsList
              flashcards={flashcards}
              onFlashcardUpdate={handleFlashcardUpdate}
              isLoading={isGenerating}
              error={generationError}
            />
            <BulkSaveButton
              generationId={generationId!}
              flashcards={flashcards}
              onSuccess={handleSaveSuccess}
              onError={handleSaveError}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
