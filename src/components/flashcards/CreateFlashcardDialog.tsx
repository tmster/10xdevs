import { useState } from "react";
import type { CreateFlashcardCommand } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateFlashcardCommand) => Promise<void>;
}

export function CreateFlashcardDialog({ isOpen, onClose, onCreate }: CreateFlashcardDialogProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      setError("Both front and back are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate({ front: front.trim(), back: back.trim() });
      setFront("");
      setBack("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flashcard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Flashcard</DialogTitle>
            <DialogDescription>
              Add a new flashcard to your collection. Fill in both sides of the card.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="front">Front side</Label>
              <Input
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter the front side text"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back side</Label>
              <Input
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter the back side text"
                disabled={isSubmitting}
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
