import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getUsers, getUserById, createUser } from '../api';

type UserData = {
  id?: number;
  name: string;
  email: string;
};

// Define MSW server and handlers specifically for this test file
const server = setupServer(
  // GET users - success case
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test User 1', email: 'test1@example.com' },
      { id: 2, name: 'Test User 2', email: 'test2@example.com' },
    ]);
  }),

  // GET users - error case
  http.get('/api/error-users', () => {
    return new HttpResponse(null, { status: 500 });
  }),

  // GET user by id - success case
  http.get('/api/users/1', () => {
    return HttpResponse.json({ id: 1, name: 'Test User 1', email: 'test1@example.com' });
  }),

  // GET user by id - not found case
  http.get('/api/users/999', () => {
    return new HttpResponse(null, { status: 404 });
  }),

  // POST user - success case
  http.post('/api/users', async ({ request }) => {
    const data = await request.json();
    const userData = data as UserData;

    return HttpResponse.json(
      { id: 3, name: userData.name, email: userData.email },
      { status: 201 }
    );
  }),

  // POST user - validation error case
  http.post('/api/users', async ({ request }) => {
    const data = await request.json();
    const userData = data as Partial<UserData>;

    if (!userData.name || !userData.email) {
      return HttpResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    return HttpResponse.json({}, { status: 201 }); // Won't be reached in test
  }),
);

// Setup MSW before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

describe('API Service', () => {
  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const result = await getUsers();

      expect(result.error).toBeNull();
      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toHaveProperty('name', 'Test User 1');
    });

    it('should handle server errors', async () => {
      // Override the handler specifically for this test
      server.use(
        http.get('/api/users', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await getUsers();

      expect(result.data).toBeNull();
      expect(result.error).toContain('Error fetching users');
      expect(result.status).toBe(500);
    });

    it('should handle network errors', async () => {
      // Override with a handler that throws an error
      server.use(
        http.get('/api/users', () => {
          throw new Error('Network error');
        })
      );

      const result = await getUsers();

      expect(result.data).toBeNull();
      expect(result.error).toContain('Error fetching users');
      expect(result.status).toBe(500);
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by id successfully', async () => {
      const result = await getUserById(1);

      expect(result.error).toBeNull();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('id', 1);
      expect(result.data).toHaveProperty('name', 'Test User 1');
    });

    it('should handle not found user', async () => {
      const result = await getUserById(999);

      expect(result.data).toBeNull();
      expect(result.error).toContain('Error fetching user');
      expect(result.status).toBe(404);
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = { name: 'New User', email: 'new@example.com' };
      const result = await createUser(userData);

      expect(result.error).toBeNull();
      expect(result.status).toBe(201);
      expect(result.data).toHaveProperty('id', 3);
      expect(result.data).toHaveProperty('name', 'New User');
      expect(result.data).toHaveProperty('email', 'new@example.com');
    });

    it('should handle validation errors', async () => {
      // Use the validation error handler by omitting required fields
      const userData = { name: '', email: '' };

      // Override handler for this specific test
      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            { error: 'Name and email are required' },
            { status: 400 }
          );
        })
      );

      const result = await createUser(userData);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Name and email are required');
      expect(result.status).toBe(400);
    });
  });
});