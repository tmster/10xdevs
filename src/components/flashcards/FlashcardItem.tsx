import { useState, useEffect } from "react";
import type { FlashcardViewModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApiCall } from "@/hooks/useApiCall";
import { CheckIcon, XIcon, PencilIcon, TrashIcon } from "lucide-react";

interface FlashcardItemProps {
  flashcard: FlashcardViewModel;
  onUpdate: (id: string, updates: Partial<FlashcardViewModel>) => void;
  onDelete: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function FlashcardItem({
  flashcard,
  onUpdate,
  onDelete,
  selected = false,
  onSelect
}: FlashcardItemProps) {
  const {
    isLoading: isActionLoading,
    error: actionError,
    execute: executeAction,
    reset: resetAction,
  } = useApiCall<void>();

  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  // Update local state when flashcard prop changes
  useEffect(() => {
    setFront(flashcard.front);
    setBack(flashcard.back);
    setIsEditing(flashcard.isEditing === true);
  }, [flashcard]);

  const handleAction = async (action: string, updates?: Partial<FlashcardViewModel>) => {
    await executeAction(
      async () => {
        // In a real app, this would be a real API call
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (action === 'delete') {
          onDelete(flashcard.id);
        } else {
          onUpdate(flashcard.id, updates || {});
        }
      },
      {
        retryCount: 2,
        retryDelay: 500,
      }
    );
  };

  const handleAccept = () => {
    handleAction('update', { status: "accepted" });
  };

  const handleReject = () => {
    handleAction('update', { status: "rejected" });
  };

  const handleEdit = () => {
    setIsEditing(true);
    onUpdate(flashcard.id, { isEditing: true });
  };

  const handleSave = () => {
    if (front.trim() === '' || back.trim() === '') {
      return; // Don't save if fields are empty
    }

    handleAction('update', {
      front,
      back,
      isEditing: false,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFront(flashcard.front);
    setBack(flashcard.back);
    setIsEditing(false);
    onUpdate(flashcard.id, { isEditing: false });
  };

  const handleDelete = () => {
    handleAction('delete');
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(flashcard.id);
    }
  };

  const getStatusIndicator = () => {
    if (flashcard.status === "accepted") {
      return <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">Accepted</div>;
    } else if (flashcard.status === "rejected") {
      return <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Rejected</div>;
    }
    return null;
  };

  if (isActionLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card data-testid={`flashcard-item-${flashcard.id}`}>
        <CardContent className="pt-6 space-y-4">
          {actionError && (
            <Alert variant="destructive" data-testid="flashcard-error">
              <AlertDescription>{actionError.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor={`front-${flashcard.id}`}>
              Front side of the flashcard
            </Label>
            <Textarea
              id={`front-${flashcard.id}`}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front side"
              aria-label="Front side of the flashcard"
              data-testid="flashcard-front-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`back-${flashcard.id}`}>
              Back side of the flashcard
            </Label>
            <Textarea
              id={`back-${flashcard.id}`}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Back side"
              aria-label="Back side of the flashcard"
              data-testid="flashcard-back-input"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          <Button
            onClick={handleSave}
            aria-label="Save changes"
            className="bg-green-600 hover:bg-green-700"
            data-testid="flashcard-save-button"
            disabled={front.trim() === '' || back.trim() === ''}
          >
            Save
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            aria-label="Cancel editing"
            data-testid="flashcard-cancel-button"
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      role="article"
      aria-label="Flashcard"
      className={`relative ${flashcard.status === "rejected" ? "opacity-50" : ""} ${selected ? "ring-2 ring-primary" : ""}`}
      data-testid={`flashcard-item-${flashcard.id}`}
      onClick={onSelect ? handleSelect : undefined}
    >
      {getStatusIndicator()}

      <CardContent className="p-4 space-y-4">
        {actionError && (
          <Alert variant="destructive" data-testid="flashcard-error">
            <AlertDescription>{actionError.message}</AlertDescription>
          </Alert>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Front</h3>
          <p className="mt-1" data-testid="flashcard-front-content">
            {flashcard.front}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Back</h3>
          <p className="mt-1" data-testid="flashcard-back-content">
            {flashcard.back}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Button
          onClick={handleAccept}
          disabled={flashcard.status === "rejected"}
          aria-label="Accept flashcard"
          className={`${flashcard.status === "accepted" ? "bg-green-700" : "bg-green-600 hover:bg-green-700"}`}
          data-testid="flashcard-accept-button"
        >
          <CheckIcon className="h-4 w-4" />
          <span className="sr-only">Accept</span>
        </Button>
        <Button
          onClick={handleEdit}
          variant="outline"
          disabled={flashcard.status === "rejected"}
          aria-label="Edit flashcard"
          data-testid="flashcard-edit-button"
        >
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          onClick={handleReject}
          variant="outline"
          disabled={flashcard.status === "rejected"}
          aria-label="Reject flashcard"
          className="text-red-600 hover:text-red-700"
          data-testid="flashcard-reject-button"
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Reject</span>
        </Button>
        <Button
          onClick={handleDelete}
          variant="outline"
          aria-label="Delete flashcard"
          className="text-red-600 hover:text-red-700"
          data-testid="flashcard-delete-button"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
