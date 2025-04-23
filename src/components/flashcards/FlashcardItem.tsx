import { useState } from 'react';
import type { FlashcardViewModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApiCall } from "@/hooks/useApiCall";
import { CheckIcon, XIcon, PencilIcon } from 'lucide-react';

interface FlashcardItemProps {
  flashcard: FlashcardViewModel;
  onUpdate: (updates: Partial<FlashcardViewModel>) => void;
}

export function FlashcardItem({ flashcard, onUpdate }: FlashcardItemProps) {
  const {
    isLoading: isActionLoading,
    error: actionError,
    execute: executeAction,
    reset: resetAction
  } = useApiCall<void>();

  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  const handleAction = async (updates: Partial<FlashcardViewModel>) => {
    await executeAction(
      async () => {
        // Simulate API call delay - in real app, this would be a real API call
        await new Promise(resolve => setTimeout(resolve, 500));
        onUpdate(updates);
      },
      {
        retryCount: 2,
        retryDelay: 500,
      }
    );
  };

  const handleAccept = () => {
    onUpdate({ status: 'accepted' });
  };

  const handleReject = () => {
    onUpdate({ status: 'rejected' });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({ front, back });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFront(flashcard.front);
    setBack(flashcard.back);
    setIsEditing(false);
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
      <Card>
        <CardContent className="pt-6 space-y-4">
          {actionError && (
            <Alert variant="destructive">
              <AlertDescription>{actionError.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor={`front-${flashcard.id}`} className="sr-only">
              Front side of the flashcard
            </Label>
            <Textarea
              id={`front-${flashcard.id}`}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front side"
              aria-label="Front side of the flashcard"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`back-${flashcard.id}`} className="sr-only">
              Back side of the flashcard
            </Label>
            <Textarea
              id={`back-${flashcard.id}`}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Back side"
              aria-label="Back side of the flashcard"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          <Button
            onClick={handleSave}
            aria-label="Save changes"
            className="bg-green-600 hover:bg-green-700"
          >
            Save
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            aria-label="Cancel editing"
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
      className={`relative ${flashcard.status === 'rejected' ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-4 space-y-4">
        {actionError && (
          <Alert variant="destructive">
            <AlertDescription>{actionError.message}</AlertDescription>
          </Alert>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Front</h3>
          <p className="mt-1">{flashcard.front}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Back</h3>
          <p className="mt-1">{flashcard.back}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              aria-label="Save changes"
              className="bg-green-600 hover:bg-green-700"
            >
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              aria-label="Cancel editing"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleAccept}
              disabled={flashcard.status === 'rejected'}
              aria-label="Accept flashcard"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckIcon className="h-4 w-4" />
              <span className="sr-only">Accept</span>
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
              disabled={flashcard.status === 'rejected'}
              aria-label="Edit flashcard"
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              disabled={flashcard.status === 'rejected'}
              aria-label="Reject flashcard"
              className="text-red-600 hover:text-red-700"
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Reject</span>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
