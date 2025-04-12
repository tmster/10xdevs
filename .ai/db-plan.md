# Schemat bazy danych

## 1. Tabele i kolumny

### 1.1 `users`

- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) UNIQUE NOT NULL
- `registered_at` TIMESTAMPTZ NOT NULL DEFAULT now()

*Uwaga: Tabela `users` jest zarządzana przez Supabase Auth. Dodatkowe informacje o użytkowniku, takie jak data rejestracji, są przechowywane tutaj. RLS oparty na `id` będzie stosowany, aby użytkownik miał dostęp wyłącznie do swoich danych.*

### 1.2 `flashcards`

- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL
- `generation_id` UUID NULL
- `front` VARCHAR(200) NOT NULL
  - CHECK (char_length(front) <= 200)
- `back` VARCHAR(500) NOT NULL
  - CHECK (char_length(back) <= 500)
- `status` VARCHAR(50) NOT NULL
  - CHECK (status IN ('accepted', 'rejected'))
- `source` VARCHAR(50) NOT NULL
  - CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

*Ograniczenia: Klucze obce oraz check constraints zapewniają integralność danych. Triggery będą aktualizować `updated_at` automatycznie przy modyfikacjach.*

### 1.3 `generations`

- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL
- `log` JSONB NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

*Tabela przechowuje pełne logi operacji generacji. Triggery będą dbać o aktualizację `updated_at`.*

### 1.4 `generation_error_logs`

- `id` UUID PRIMARY KEY
- `generation_id` UUID NOT NULL
- `status` VARCHAR(50) NOT NULL
- `error_code` VARCHAR(50) NOT NULL
- `error_message` TEXT NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

*Tabela przechowuje szczegóły błędów związanych z operacjami generacji. Aktualizacja `updated_at` odbywa się za pomocą triggerów.*

## 2. Relacje między tabelami

- `users` (1) --- (N) `flashcards`
- `users` (1) --- (N) `generations`
- `generations` (1) --- (N) `flashcards`
- `generations` (1) --- (N) `generation_error_logs`

*Wszystkie klucze obce są definiowane z opcją ON DELETE CASCADE, aby zapewnić kaskadowe usuwanie rekordów związanych z użytkownikiem.*

## 3. Indeksy

- INDEX na `flashcards(user_id)`
- INDEX na `flashcards(generation_id)`
- INDEX na `flashcards(status)`
- INDEX na `flashcards(source)`
- INDEX na `generations(user_id)`
- INDEX na `generation_error_logs(generation_id)`

## 4. Zasady PostgreSQL (Row Level Security - RLS)

- W tabelach `flashcards`, `generations` oraz `generation_error_logs` wprowadzone zostaną zasady RLS oparte na kolumnie `user_id`.
- Polityki RLS zapewnią, że użytkownik ma dostęp wyłącznie do rekordów, gdzie `user_id` odpowiada jego identyfikatorowi w Supabase Auth.

## 5. Dodatkowe uwagi

- Wszystkie tabele wykorzystują UUID jako klucze główne dla lepszej skalowalności.
- Triggery są zaplanowane do automatycznej aktualizacji kolumny `updated_at` przy każdej modyfikacji rekordu.
- Schemat jest zgodny z zasadami 3NF, zapewniającą optymalizację struktury bazy danych.
- Ograniczenia długości dla pól `front` i `back` w tabeli `flashcards` gwarantują integralność danych.
- Check constraints dla pól `status` i `source` gwarantują, że tylko dozwolone wartości są zapisywane.