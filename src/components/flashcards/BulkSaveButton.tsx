import type { FlashcardViewModel, BatchProcessFlashcardsResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useApiCall } from '@/hooks/useApiCall';

interface BulkSaveButtonProps {
  generationId: string;
  flashcards: FlashcardViewModel[];
  onSuccess: () => void;
  onError: () => void;
}

export function BulkSaveButton({ generationId, flashcards, onSuccess, onError }: BulkSaveButtonProps) {
  const {
    isLoading: isSaving,
    error: saveError,
    execute: executeSave
  } = useApiCall<BatchProcessFlashcardsResponse>();

  const handleSave = async () => {
    const acceptedFlashcards = flashcards.filter((f) => f.status === "accepted");
    if (acceptedFlashcards.length === 0) return;

    await executeSave(
      async () => {
        const response = await fetch("/api/flashcards/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generation_id: generationId,
            flashcards: acceptedFlashcards.map((f) => ({
              id: f.id,
              action: "accept",
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ||
            `Failed to save flashcards (${response.status}: ${response.statusText})`
          );
        }

        return response.json();
      },
      {
        onSuccess: (data) => {
          if (!data.success) {
            throw new Error(`Failed to save ${data.failed} flashcards`);
          }
          onSuccess();
        },
        onError,
        retryCount: 3,
        retryDelay: 1000,
      }
    );
  };

  const acceptedCount = flashcards.filter((f) => f.status === "accepted").length;

  return (
    <div className="space-y-4">
      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError.message}</AlertDescription>
        </Alert>
      )}

      {isSaving && (
        <div className="space-y-2">
          <Progress value={75} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Saving flashcards... This may take a moment.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {acceptedCount} flashcard{acceptedCount === 1 ? "" : "s"} selected
        </p>
        <Button onClick={handleSave} disabled={acceptedCount === 0 || isSaving}>
          {isSaving ? "Saving..." : "Save Selected Flashcards"}
        </Button>
      </div>
    </div>
  );
}
