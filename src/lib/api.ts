/**
 * API service with methods to interact with the backend
 */

// Generic response type for consistent error handling
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Fetches users from the API
 */
export async function getUsers(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch("/api/users");
    const status = response.status;

    if (!response.ok) {
      return {
        data: null,
        error: `Error fetching users: ${status}`,
        status,
      };
    }

    const data = await response.json();
    return { data, error: null, status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}

/**
 * Fetches a single user by ID
 */
export async function getUserById(id: number): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const status = response.status;

    if (!response.ok) {
      return {
        data: null,
        error: `Error fetching user: ${status}`,
        status,
      };
    }

    const data = await response.json();
    return { data, error: null, status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}

/**
 * Creates a new user
 */
export async function createUser(userData: { name: string; email: string }): Promise<ApiResponse<any>> {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const status = response.status;
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.error || `Error creating user: ${status}`,
        status,
      };
    }

    return { data, error: null, status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}
