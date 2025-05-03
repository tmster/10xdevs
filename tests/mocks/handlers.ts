import { http, HttpResponse, delay } from 'msw';

// Define types for our mock data
type User = {
  id: number;
  name: string;
  email: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
};

// Sample user data
const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

// Sample product data
const products: Product[] = [
  { id: 1, name: 'Product 1', price: 99.99 },
  { id: 2, name: 'Product 2', price: 149.99 },
  { id: 3, name: 'Product 3', price: 199.99 },
];

// Define handlers for MSW to intercept and mock API requests
export const handlers = [
  // GET users
  http.get('/api/users', async () => {
    await delay(100); // Simulate network delay
    return HttpResponse.json(users);
  }),

  // GET user by id
  http.get('/api/users/:id', async ({ params }) => {
    await delay(100);
    const { id } = params;
    const user = users.find(u => u.id === Number(id));

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  // POST new user
  http.post('/api/users', async ({ request }) => {
    await delay(150);
    const data = await request.json();
    const newUser = data as Partial<User>;

    // Validation simulation
    if (!newUser.name || !newUser.email) {
      return new HttpResponse(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400 }
      );
    }

    const user: User = { id: users.length + 1, name: newUser.name, email: newUser.email };
    return HttpResponse.json(user, { status: 201 });
  }),

  // GET products
  http.get('/api/products', async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');

    if (limit) {
      return HttpResponse.json(products.slice(0, Number(limit)));
    }

    return HttpResponse.json(products);
  }),

  // Simulate a server error
  http.get('/api/error', () => {
    return new HttpResponse(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }),
];