# Specyfikacja Modułu Autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Strony i Komponenty
- Nowe strony: `/register`, `/login`, `/forgot-password` oraz (ewentualnie) `/reset-password` do obsługi odzyskiwania hasła.
- Formularz rejestracji zawiera pola: email i hasło, z walidacją formatu email oraz minimalnej długości hasła. Po pomyślnej rejestracji użytkownik zostaje automatycznie zalogowany.
- Formularz logowania zawiera pola: email i hasło.
- Formularz odzyskiwania hasła umożliwia wprowadzenie zarejestrowanego adresu email, aby wysłać link resetujący hasło.
- Formularze i interaktywne elementy zostaną zaimplementowane przy użyciu React (z wykorzystaniem Shadcn/ui oraz Tailwind CSS), natomiast strony będą renderowane przez Astro.

### Układ i Nawigacja
- Rozdzielenie layoutów:
  - Publiczny layout dla stron logowania, rejestracji oraz odzyskiwania hasła (dla użytkowników niezalogowanych).
  - Autoryzowany layout (np. `AuthLayout.astro`) dla zalogowanych użytkowników, zawierający pasek nawigacyjny z opcją wylogowania i dostępem do chronionych zasobów.
- Integracja z systemem routingu Astro, który przy użyciu middleware (`src/middleware/index.ts`) będzie weryfikował stan sesji i zabezpieczał dostęp do chronionych stron.

### Walidacja i Komunikaty Błędów
- Walidacja na poziomie klienta: sprawdzenie formatu email, długości hasła oraz wstępna walidacja przed wysłaniem danych do backendu.
- Walidacja na poziomie serwera: dodatkowe sprawdzenie poprawności danych i bezpieczeństwa (guard clauses, early return w przypadku błędów).
- Komunikaty błędów wyświetlane użytkownikowi w przypadku:
  - Nieprawidłowego formatu email lub niepełnych danych.
  - Błędów przy rejestracji (np. email już istnieje) lub logowaniu (np. błędne dane).
  - Problemów z komunikacją z API Supabase.

## 2. LOGIKA BACKENDOWA

### Struktura Endpointów API
- Endpointy zostaną umieszczone w katalogu `src/pages/api/auth` i obejmują:
  - `/src/pages/api/auth/register.ts`:
    - Metoda: POST
    - Zadanie: Rejestracja nowego użytkownika przy użyciu `supabase.auth.signUp()`.
    - Walidacja danych wejściowych oraz obsługa wyjątków.
  - `/src/pages/api/auth/login.ts`:
    - Metoda: POST
    - Zadanie: Logowanie użytkownika przez `supabase.auth.signInWithPassword()`.
    - Obsługa błędnych danych wejściowych i zwracanie czytelnych komunikatów błędów.
  - `/src/pages/api/auth/forgot-password.ts`:
    - Metoda: POST
    - Zadanie: Inicjalizacja procedury odzyskiwania hasła – wysłanie emaila z linkiem resetującym poprzez Supabase.
  - `/src/pages/api/auth/reset-password.ts`:
    - Metoda: POST
    - Zadanie: Resetowanie hasła na podstawie przesłanego tokenu i nowego hasła. Endpoint ten jest wymagany.

### Modele Danych i Walidacja
- Dane przesyłane w formacie JSON (np. { email, password, token }).
- Schematy danych definiowane przy użyciu TypeScript, co umożliwi ścisłe typowanie i wczesne wychwytywanie błędów.
- Walidacja przychodzących danych z użyciem guard clauses – wczesne zakończenie przetwarzania przy wykryciu niepoprawnych danych.

### Obsługa Wyjątków
- Logowanie błędów na serwerze oraz zwracanie dostosowanych komunikatów błędów do klienta.
- Zastosowanie patternu early return w celu uproszczenia logiki i bezpieczeństwa operacji.

### Integracja z Astro
- Endpointy API są zgodne z systemem SSR konfigurowanym w `astro.config.mjs` (tryb standalone, wykorzystanie adaptera Node).
- Middleware w `src/middleware/index.ts` będzie używany do weryfikacji sesji i zabezpieczenia endpointów przed nieautoryzowanym dostępem.

## 3. SYSTEM AUTENTYKACJI

### Wykorzystanie Supabase Auth
- Użycie Supabase Auth jako centralnego mechanizmu rejestracji, logowania oraz odzyskiwania hasła:
  - Rejestracja: wykorzystanie `supabase.auth.signUp()` dla tworzenia nowych kont.
  - Logowanie: wykorzystanie `supabase.auth.signInWithPassword()` dla uwierzytelniania użytkowników.
  - Reset hasła: wykorzystanie mechanizmów Supabase do wysyłania emaila resetującego oraz (ewentualnie) endpointu resetującego hasło.
- Wykorzystanie Supabase SDK zarówno po stronie klienta, jak i serwera, umożliwiając spójne zarządzanie stanem autentykacji.

### Zarządzanie Sesjami
- Przechowywanie sesji użytkownika w stanie aplikacji po stronie klienta (np. przy użyciu React Context lub dedykowanego hooka).
- Middleware w Astro sprawdza autentyczność sesji i blokuje dostęp do chronionych zasobów, zgodnie z wymaganiami US-009.
- Tokeny sesji są przekazywane w bezpieczny sposób do endpointów API, zapewniając ochronę przed nieautoryzowanym dostępem.

### Bezpieczeństwo i Ochrona Danych
- Użytkownik musi być zalogowany, aby uzyskać dostęp do funkcji generowania i edycji zawartości (zgodnie z wymaganiami US-009).
- Cała komunikacja odbywa się przez połączenia szyfrowane (HTTPS), a tokeny oraz dane wrażliwe są przechowywane i przekazywane zgodnie z najlepszymi praktykami bezpieczeństwa.
- Stosowanie mechanizmu early return oraz walidacji na poziomie endpointów zapobiega wykonaniu operacji przez nieautoryzowanych użytkowników.

### Integracja z Istniejącą Architekturą
- System autentykacji będzie zintegrowany z istniejącym stosem: Astro 5, React 19, TypeScript 5, Tailwind CSS 4 oraz Shadcn/ui, bez naruszania obecnych funkcjonalności aplikacji.
- Moduł autentykacji uzupełnia system, zapewniając bezpieczny dostęp do funkcji aplikacji przy jednoczesnym zapewnieniu spójnego doświadczenia użytkownika.

## Wnioski
- Specyfikacja przedstawia kompleksowy podział odpowiedzialności między front-endem a back-endem, z wyraźnym rozdzieleniem logiki prezentacji i logiki biznesowej.
- Integracja z Supabase Auth zapewnia nowoczesne i bezpieczne rozwiązanie dla rejestracji, logowania oraz odzyskiwania hasła.
- Wdrożenie systemu w oparciu o opisane mechanizmy walidacji, obsługi wyjątków oraz middleware gwarantuje wysoką niezawodność i bezpieczeństwo operacji autentykacyjnych.
- Proponowane rozwiązanie jest zgodne z wymaganiami PRD i stackiem technologicznym, nie zakłócając funkcjonowania pozostałych elementów aplikacji.