import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardService } from "../services/flashcard.service";
import type { UpdateFlashcardCommand } from "../../types";

describe("FlashcardService", () => {
  // We'll simplify the mock approach for better control
  const mockSingleForSelect = vi.fn();
  const mockSingleForUpdate = vi.fn();
  const mockDeleteResult = vi.fn();

  const mockSupabase = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingleForSelect,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: mockSingleForUpdate,
            }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockDeleteResult),
        }),
      }),
    }),
  };

  let flashcardService: FlashcardService;
  const testUserId = "test-user-id";
  const testFlashcardId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error: Complex mock structure doesn't match exact type
    flashcardService = new FlashcardService(mockSupabase);
  });

  describe("update", () => {
    const updateCommand: UpdateFlashcardCommand = {
      front: "Updated front text",
      back: "Updated back text",
      status: "accepted",
    };

    const mockFlashcard = {
      id: testFlashcardId,
      front: "Original front",
      back: "Original back",
      status: "pending",
      user_id: testUserId,
      generation_id: "gen-123",
      source: "manual",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    const mockUpdatedFlashcard = {
      id: testFlashcardId,
      front: "Updated front text",
      back: "Updated back text",
      status: "accepted",
      source: "manual",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: expect.any(String),
    };

    it("should update a flashcard when it exists and belongs to the user", async () => {
      // Arrange
      mockSingleForSelect.mockResolvedValueOnce({ data: mockFlashcard, error: null });
      mockSingleForUpdate.mockResolvedValueOnce({ data: mockUpdatedFlashcard, error: null });

      // Act
      const result = await flashcardService.update(testFlashcardId, updateCommand, testUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(result).toEqual(mockUpdatedFlashcard);
    });

    it("should return null when the flashcard doesn't exist", async () => {
      // Arrange
      mockSingleForSelect.mockResolvedValueOnce({
        data: null,
        error: { message: "Flashcard not found or access denied" },
      });

      // Act
      const result = await flashcardService.update(testFlashcardId, updateCommand, testUserId);

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when the update operation fails", async () => {
      // Arrange
      mockSingleForSelect.mockResolvedValueOnce({ data: mockFlashcard, error: null });
      mockSingleForUpdate.mockResolvedValueOnce({ data: null, error: { message: "Failed to update flashcard" } });

      // Act
      const result = await flashcardService.update(testFlashcardId, updateCommand, testUserId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a flashcard when it exists and belongs to the user", async () => {
      // Arrange
      mockSingleForSelect.mockResolvedValueOnce({
        data: { id: testFlashcardId },
        error: null,
      });

      mockDeleteResult.mockResolvedValueOnce({ error: null });

      // Act
      const result = await flashcardService.delete(testFlashcardId, testUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(result).toBe(true);
    });

    it("should return false when the flashcard doesn't exist", async () => {
      // Arrange
      mockSingleForSelect.mockResolvedValueOnce({
        data: null,
        error: { message: "Flashcard not found or access denied" },
      });

      // Act
      const result = await flashcardService.delete(testFlashcardId, testUserId);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when the delete operation fails", async () => {
      // Arrange - użyjmy innego podejścia do mockowania dla tego testu
      const deleteErrorMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: testFlashcardId },
                  error: null,
                }),
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: { message: "Failed to delete flashcard" },
              }),
            }),
          }),
        }),
      };

      // @ts-expect-error: Complex mock structure doesn't match exact type
      const serviceWithDeleteError = new FlashcardService(deleteErrorMock);

      // Act
      const result = await serviceWithDeleteError.delete(testFlashcardId, testUserId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
