# Flashcard API Documentation

## Endpoints

### Update Flashcard
- **URL**: `/api/flashcards/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Description**: Updates an existing flashcard with the specified ID.

#### Request Parameters
- `id` - UUID of the flashcard to update (in URL path)

#### Request Body
```json
{
  "front": "Updated front text",     // Optional, max 200 chars
  "back": "Updated back text",       // Optional, max 500 chars
  "status": "accepted"               // Optional, one of: "accepted", "rejected", "pending"
}
```

#### Success Response
- **Code**: 200 OK
- **Content**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "front": "Updated front text",
  "back": "Updated back text",
  "status": "accepted",
  "source": "manual",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

#### Error Responses
- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid flashcard ID" }`
  - **Content**: `{ "error": "Invalid input data", "details": [{ "message": "..." }] }`
- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized" }`
- **Code**: 404 Not Found
  - **Content**: `{ "error": "Flashcard not found" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Internal server error" }`

#### Sample Call
```javascript
// Using fetch API
const response = await fetch('/api/flashcards/123e4567-e89b-12d3-a456-426614174000', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    front: 'What is React?',
    back: 'A JavaScript library for building user interfaces',
    status: 'accepted'
  })
});

const data = await response.json();
```

### Delete Flashcard
- **URL**: `/api/flashcards/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Description**: Deletes the flashcard with the specified ID.

#### Request Parameters
- `id` - UUID of the flashcard to delete (in URL path)

#### Success Response
- **Code**: 204 No Content
- **Content**: None

#### Error Responses
- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid flashcard ID" }`
- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized" }`
- **Code**: 404 Not Found
  - **Content**: `{ "error": "Flashcard not found" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Internal server error" }`

#### Sample Call
```javascript
// Using fetch API
const response = await fetch('/api/flashcards/123e4567-e89b-12d3-a456-426614174000', {
  method: 'DELETE'
});

if (response.status === 204) {
  console.log('Flashcard deleted successfully');
}
```