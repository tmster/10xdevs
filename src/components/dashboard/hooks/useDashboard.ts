import { useState, useEffect } from "react";
import type { DashboardViewModel, StatisticsDTO, FlashcardViewModel } from "@/types";

// Mock data for development
const mockStats: StatisticsDTO = {
  flashcards: {
    total: 42,
    by_source: {
      "ai-full": 30,
      "ai-edited": 8,
      manual: 4,
    },
    by_status: {
      accepted: 35,
      rejected: 7,
    },
  },
  generations: {
    total: 5,
    cards_generated: 50,
    cards_accepted: 35,
    acceptance_rate: 0.7,
  },
};

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewModel, setViewModel] = useState<DashboardViewModel>({
    user: {
      username: "User",
      lastLoginDate: new Date(),
    },
    stats: mockStats,
    currentFlashcard: null,
    pendingFlashcards: {
      count: 0,
      items: [],
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch pending flashcards
        const pendingResponse = await fetch("/api/flashcards?status=pending&limit=3");
        if (!pendingResponse.ok) throw new Error("Failed to fetch pending flashcards");
        const pendingData = await pendingResponse.json();

        // Fetch latest accepted flashcard
        const latestResponse = await fetch("/api/flashcards?status=accepted&sort=created_at&order=desc&limit=1");
        if (!latestResponse.ok) throw new Error("Failed to fetch latest flashcard");
        const latestData = await latestResponse.json();
        const latestFlashcard = latestData.data[0] || null;

        // Simulate API delay for stats
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setViewModel({
          user: {
            username: "User",
            lastLoginDate: new Date(),
          },
          stats: mockStats,
          currentFlashcard: latestFlashcard,
          pendingFlashcards: {
            count: pendingData.pagination.total,
            items: pendingData.data,
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    ...viewModel,
    isLoading,
    error,
  };
}
