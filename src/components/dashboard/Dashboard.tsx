import { useDashboard } from "./hooks/useDashboard";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { QuickActions } from "./QuickActions";
import { FlashcardPreview } from "./FlashcardPreview";
import { PendingFlashcards } from "./PendingFlashcards";
import { Card } from "@/components/ui/card";

export function Dashboard() {
  const { user, stats, currentFlashcard, pendingFlashcards, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <DashboardHeader username={user.username} lastLoginDate={user.lastLoginDate} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <DashboardStats stats={stats} />
          <QuickActions />
        </div>

        <div className="space-y-8">
          {currentFlashcard && <FlashcardPreview flashcard={currentFlashcard} />}
          <PendingFlashcards count={pendingFlashcards.count} items={pendingFlashcards.items} />
        </div>
      </div>
    </div>
  );
}
