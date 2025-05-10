import { useState } from "react";
import type { FlashcardViewModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useApiCall } from "@/hooks/useApiCall";

interface BulkSaveButtonProps {
  generationId: string;
  flashcards: FlashcardViewModel[];
  onSuccess: () => void;
  onError: () => void;
}

export function BulkSaveButton({ generationId, flashcards, onSuccess, onError }: BulkSaveButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { isLoading, execute } = useApiCall<void>();

  const handleSave = async () => {
    if (flashcards.length === 0) {
      setError("No flashcards selected");
      return;
    }

    const acceptedFlashcards = flashcards.filter((f) => f.status === "accepted");

    if (acceptedFlashcards.length === 0) {
      setError("No accepted flashcards to save");
      return;
    }

    try {
      await execute(
        async () => {
          const total = acceptedFlashcards.length;
          let completed = 0;
          const failed: string[] = [];

          // Process each flashcard individually
          for (const flashcard of acceptedFlashcards) {
            try {
              const response = await fetch(`/api/flashcards/${flashcard.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  front: flashcard.front,
                  back: flashcard.back,
                  status: flashcard.status
                }),
              });

              if (!response.ok) {
                const data = await response.json().catch(() => null);
                failed.push(flashcard.id);
                console.error(`Failed to update flashcard ${flashcard.id}:`, data);
              }
            } catch (err) {
              failed.push(flashcard.id);
              console.error(`Error updating flashcard ${flashcard.id}:`, err);
            }

            completed++;
            setProgress(Math.round((completed / total) * 100));
          }

          // If any flashcards failed to update, show an error
          if (failed.length > 0) {
            throw new Error(`Failed to update ${failed.length} flashcards`);
          }
        },
        {
          onSuccess,
          onError,
        }
      );
    } catch (err) {
      console.error("Failed to save flashcards:", err);
      setError("Failed to save flashcards");
    }
  };

  const acceptedCount = flashcards.filter((f) => f.status === "accepted").length;

  return (
    <div className="space-y-4" data-testid="bulk-save-container">
      {error && (
        <Alert variant="destructive" className="mb-4" data-testid="bulk-save-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-2" data-testid="save-progress-container">
          <Progress value={progress} className="w-full" data-testid="save-progress" />
          <p className="text-sm text-muted-foreground">Saving flashcards... This may take a moment.</p>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={acceptedCount === 0 || isLoading}
        className="w-full md:w-auto"
        data-testid="bulk-save-button"
      >
        {isLoading ? "Saving..." : `Save Selected Flashcards (${acceptedCount})`}
      </Button>
    </div>
  );
}
