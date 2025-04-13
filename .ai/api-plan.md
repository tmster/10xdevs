# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table, managed by Supabase Auth
- **Flashcards**: Corresponds to the `flashcards` table
- **Generations**: Corresponds to the `generations` table
- **Generation Error Logs**: Corresponds to the `generation_error_logs` table

## 2. Endpoints

### Authentication
Authentication is handled by Supabase Auth, with no custom API endpoints required.

### Flashcards

#### Get All Flashcards
- Method: GET
- Path: `/api/flashcards`
- Description: Retrieves all flashcards for the authenticated user
- Query Parameters:
  - `limit`: Number of results per page (default: 20)
  - `offset`: Pagination offset (default: 0)
  - `status`: Filter by status ('accepted', 'rejected')
  - `source`: Filter by source ('ai-full', 'ai-edited', 'manual')
  - `sort`: Sort field (default: 'created_at')
  - `order`: Sort order ('asc', 'desc', default: 'desc')
- Response:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "status": "accepted|rejected",
        "source": "ai-full|ai-edited|manual",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0
    }
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server error

#### Get Single Flashcard
- Method: GET
- Path: `/api/flashcards/:id`
- Description: Retrieves a specific flashcard by ID
- Response:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "status": "accepted|rejected",
    "source": "ai-full|ai-edited|manual",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized: User not authenticated
  - 404 Not Found: Flashcard not found
  - 500 Internal Server Error: Server error

#### Create Flashcard Manually
- Method: POST
- Path: `/api/flashcards`
- Description: Creates a new flashcard manually
- Request:
  ```json
  {
    "front": "string",
    "back": "string"
  }
  ```
- Response:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "status": "accepted",
    "source": "manual",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Success: 201 Created
- Errors:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server error

#### Update Flashcard
- Method: PATCH
- Path: `/api/flashcards/:id`
- Description: Updates an existing flashcard
- Request:
  ```json
  {
    "front": "string",
    "back": "string",
    "status": "accepted|rejected"
  }
  ```
- Response:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "status": "accepted|rejected",
    "source": "ai-full|ai-edited|manual",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Success: 200 OK
- Errors:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: User not authenticated
  - 404 Not Found: Flashcard not found
  - 500 Internal Server Error: Server error

#### Delete Flashcard
- Method: DELETE
- Path: `/api/flashcards/:id`
- Description: Deletes a specific flashcard
- Response: No content
- Success: 204 No Content
- Errors:
  - 401 Unauthorized: User not authenticated
  - 404 Not Found: Flashcard not found
  - 500 Internal Server Error: Server error

#### Generate Flashcards with AI
- Method: POST
- Path: `/api/flashcards/generate`
- Description: Generates flashcard suggestions using AI based on provided text
- Request:
  ```json
  {
    "text": "string",
    "options": {
      "max_cards": 10
    }
  }
  ```
- Response:
  ```json
  {
    "generation_id": "uuid",
    "flashcards": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "status": "pending",
        "source": "ai-full"
      }
    ]
  }
  ```
- Success: 200 OK
- Errors:
  - 400 Bad Request: Invalid input (text too short/long)
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: AI generation error

#### Batch Process Generated Flashcards
- Method: POST
- Path: `/api/flashcards/batch`
- Description: Processes multiple flashcards at once (accept/reject/edit)
- Request:
  ```json
  {
    "generation_id": "uuid",
    "flashcards": [
      {
        "id": "uuid",
        "action": "accept|reject|edit",
        "front": "string", // Only needed for edit
        "back": "string"   // Only needed for edit
      }
    ]
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "processed": 10,
    "failed": 0,
    "flashcards": [
      {
        "id": "uuid",
        "status": "accepted|rejected",
        "source": "ai-full|ai-edited"
      }
    ]
  }
  ```
- Success: 200 OK
- Errors:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: User not authenticated
  - 404 Not Found: Generation or flashcard not found
  - 500 Internal Server Error: Server error

### Generations

#### Create Generation
- Method: POST
- Path: `/api/generations`
- Description: Tworzy nowy rekord generacji poprzez przesłanie tekstu (wymagane długości: 1000-10000 znaków) oraz opcji, co inicjuje generowanie fiszek przez AI.
- Request:
  ```json
  {
    "text": "string",
    "options": {
      "max_cards": 10
    }
  }
  ```
- Response:
  ```json
  {
    "generation_id": "uuid",
    "flashcards": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "status": "pending",
        "source": "ai-full"
      }
    ]
  }
  ```
- Success: 201 Created
- Errors:
  - 400 Bad Request: Niepoprawne dane wejściowe (np. tekst zbyt krótki lub zbyt długi)
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony
  - 500 Internal Server Error: Błąd serwera

#### Get Generation History
- Method: GET
- Path: `/api/generations`
- Description: Retrieves AI generation history
- Query Parameters:
  - `limit`: Number of results per page (default: 20)
  - `offset`: Pagination offset (default: 0)
- Response:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "created_at": "timestamp",
        "log": {
          // Generation metadata
        },
        "total_cards": 10,
        "accepted_cards": 7
      }
    ],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0
    }
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server error

#### Get Generation Details
- Method: GET
- Path: `/api/generations/:id`
- Description: Gets details of a specific generation
- Response:
  ```json
  {
    "id": "uuid",
    "created_at": "timestamp",
    "log": {
      // Generation metadata
    },
    "flashcards": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "status": "accepted|rejected",
        "source": "ai-full|ai-edited"
      }
    ],
    "error_logs": [
      {
        "status": "string",
        "error_code": "string",
        "error_message": "string",
        "created_at": "timestamp"
      }
    ],
    "stats": {
      "total_cards": 10,
      "accepted_cards": 7,
      "rejected_cards": 3
    }
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized: User not authenticated
  - 404 Not Found: Generation not found
  - 500 Internal Server Error: Server error

### Statistics

#### Get User Statistics
- Method: GET
- Path: `/api/statistics`
- Description: Retrieves statistics about flashcards and generations
- Response:
  ```json
  {
    "flashcards": {
      "total": 100,
      "by_source": {
        "ai-full": 50,
        "ai-edited": 30,
        "manual": 20
      },
      "by_status": {
        "accepted": 80,
        "rejected": 20
      }
    },
    "generations": {
      "total": 10,
      "cards_generated": 80,
      "cards_accepted": 60,
      "acceptance_rate": 0.75
    }
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server error

### User Data (GDPR Compliance)

#### Export User Data
- Method: GET
- Path: `/api/users/me/export`
- Description: Exports all user data (GDPR compliance)
- Response: JSON file download with all user data
- Success: 200 OK
- Errors:
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server error

#### Delete User Account
- Method: DELETE
- Path: `/api/users/me`
- Description: Deletes user account and all associated data
- Response:
  ```json
  {
    "success": true
  }
  ```
- Success: 200 OK
- Errors:
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server error

## 3. Authentication and Authorization

Authentication is handled by Supabase Auth, which provides a complete authentication system with JWT tokens.

- **Token Generation**: Supabase Auth issues JWTs after successful login
- **Token Validation**: API endpoints validate JWTs to authenticate requests
- **Row-Level Security (RLS)**: Supabase's RLS policies ensure users can only access their own data
- **Implementation Details**:
  - Frontend uses Supabase Auth SDK for authentication flow
  - Backend validates JWT tokens attached to requests
  - Each API endpoint verifies user authorization before performing actions
  - RLS policies in the database provide an additional security layer

## 4. Validation and Business Logic

### Validation Rules

#### Flashcards
- `front`: Required, max 200 characters
- `back`: Required, max 500 characters
- `status`: Must be one of: 'accepted', 'rejected'
- `source`: Must be one of: 'ai-full', 'ai-edited', 'manual'

#### Generation Input Text
- Minimum 1,000 characters
- Maximum 10,000 characters

### Business Logic Implementation

1. **AI Flashcard Generation**:
   - The `/api/flashcards/generate` endpoint sends the input text to an LLM via OpenRouter.ai
   - The generation is logged in the `generations` table
   - Generated flashcards are returned to the client but not immediately stored with 'accepted' status
   - Any errors are logged in the `generation_error_logs` table

2. **Flashcard Approval Process**:
   - The `/api/flashcards/batch` endpoint handles the approval workflow
   - Users can accept, reject, or edit generated flashcards in a batch
   - For edited cards, the source is set to 'ai-edited'
   - Only accepted cards appear in learning sessions

3. **Statistics Tracking**:
   - The API automatically tracks metrics for AI-generated cards
   - Statistics include total generations, acceptance rates, and other metrics
   - This data is accessible via the `/api/statistics` endpoint

4. **GDPR Compliance**:
   - The API provides endpoints for data export and account deletion
   - Account deletion cascades to all related data (flashcards, generations, logs)