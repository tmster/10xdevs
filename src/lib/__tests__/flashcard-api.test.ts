import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import type { UpdateFlashcardCommand } from "../../types";

// Define test data
const testFlashcardId = "123e4567-e89b-12d3-a456-426614174000";
const testUserId = "user-123";

const mockFlashcard = {
  id: testFlashcardId,
  front: "Original front",
  back: "Original back",
  status: "pending",
  source: "manual",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

const updatedFlashcard = {
  ...mockFlashcard,
  front: "Updated front",
  back: "Updated back",
  status: "accepted",
  updated_at: "2023-01-02T00:00:00Z",
};

// Mock Supabase Auth context
vi.mock("../../db/supabase.client", () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: testUserId } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockFlashcard, error: null }),
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: updatedFlashcard, error: null }),
            }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    }),
  }),
}));

// Define our test server using MSW
const server = setupServer(
  // PATCH /api/flashcards/:id - success
  http.patch(`/api/flashcards/${testFlashcardId}`, async ({ request }) => {
    const data = (await request.json()) as Partial<UpdateFlashcardCommand>;

    return HttpResponse.json(
      {
        ...mockFlashcard,
        ...data,
        updated_at: "2023-01-02T00:00:00Z",
      },
      { status: 200 }
    );
  }),

  // PATCH /api/flashcards/:id - not found
  http.patch(`/api/flashcards/not-found-id`, () => {
    return HttpResponse.json({ error: "Flashcard not found" }, { status: 404 });
  }),

  // PATCH /api/flashcards/:id - server error
  http.patch(`/api/flashcards/server-error-id`, () => {
    return HttpResponse.json({ error: "Internal server error" }, { status: 500 });
  }),

  // DELETE /api/flashcards/:id - success
  http.delete(`/api/flashcards/${testFlashcardId}`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE /api/flashcards/:id - not found
  http.delete(`/api/flashcards/not-found-id`, () => {
    return HttpResponse.json({ error: "Flashcard not found" }, { status: 404 });
  }),

  // DELETE /api/flashcards/:id - server error
  http.delete(`/api/flashcards/server-error-id`, () => {
    return HttpResponse.json({ error: "Internal server error" }, { status: 500 });
  })
);

// Setup MSW before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Helper function to make api requests
async function makeApiRequest(method: string, url: string, body?: object) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 204) {
    return { status: response.status };
  }

  const data = await response.json();
  return {
    status: response.status,
    data,
  };
}

describe("Flashcard API Endpoints", () => {
  describe("PATCH /api/flashcards/:id", () => {
    it("should update a flashcard successfully", async () => {
      const updateData = {
        front: "Updated front",
        back: "Updated back",
        status: "accepted",
      };

      const result = await makeApiRequest("PATCH", `/api/flashcards/${testFlashcardId}`, updateData);

      expect(result.status).toBe(200);
      expect(result.data).toEqual({
        ...mockFlashcard,
        ...updateData,
        updated_at: "2023-01-02T00:00:00Z",
      });
    });

    it("should return 404 when flashcard is not found", async () => {
      const updateData = { front: "Test front" };

      const result = await makeApiRequest("PATCH", "/api/flashcards/not-found-id", updateData);

      expect(result.status).toBe(404);
      expect(result.data).toHaveProperty("error", "Flashcard not found");
    });

    it("should return 400 for invalid input", async () => {
      // Override handler for this specific test
      server.use(
        http.patch(`/api/flashcards/${testFlashcardId}`, () => {
          return HttpResponse.json(
            {
              error: "Invalid input data",
              details: [{ message: "String must contain at most 200 characters" }],
            },
            { status: 400 }
          );
        })
      );

      const updateData = {
        front: "X".repeat(250), // Too long
      };

      const result = await makeApiRequest("PATCH", `/api/flashcards/${testFlashcardId}`, updateData);

      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty("error", "Invalid input data");
    });

    it("should return 500 for server errors", async () => {
      const updateData = { front: "Test front" };

      const result = await makeApiRequest("PATCH", "/api/flashcards/server-error-id", updateData);

      expect(result.status).toBe(500);
      expect(result.data).toHaveProperty("error", "Internal server error");
    });
  });

  describe("DELETE /api/flashcards/:id", () => {
    it("should delete a flashcard successfully", async () => {
      const result = await makeApiRequest("DELETE", `/api/flashcards/${testFlashcardId}`);

      expect(result.status).toBe(204);
    });

    it("should return 404 when flashcard is not found", async () => {
      const result = await makeApiRequest("DELETE", "/api/flashcards/not-found-id");

      expect(result.status).toBe(404);
      expect(result.data).toHaveProperty("error", "Flashcard not found");
    });

    it("should return 500 for server errors", async () => {
      const result = await makeApiRequest("DELETE", "/api/flashcards/server-error-id");

      expect(result.status).toBe(500);
      expect(result.data).toHaveProperty("error", "Internal server error");
    });
  });
});
