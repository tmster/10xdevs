<authentication_analysis>
Analiza modułu autentykacji:
1. Rejestracja: Użytkownik wprowadza e-mail i hasło, a formularz wysyłany jest do Astro API, które przekazuje dane do Supabase Auth w celu rejestracji. Odpowiedź o pomyślnej rejestracji trafia z powrotem do przeglądarki.
2. Logowanie: Użytkownik przesyła dane logowania. Astro API komunikuje się z Supabase Auth, które weryfikuje dane i generuje token sesji. Token jest następnie przesyłany do przeglądarki.
3. Autoryzacja: Każde żądanie dostępu do zasobów przechodzi przez Middleware, który weryfikuje token poprzez Supabase Auth i decyduje o dostępie.
4. Odświeżanie tokenu: Po wygaśnięciu tokenu, przeglądarka wysyła żądanie odświeżenia do Astro API, które inicjuje proces odświeżenia poprzez Supabase Auth.
</authentication_analysis>

<mermaid_diagram>
```mermaid
sequenceDiagram
  autonumber
  participant Browser as Przeglądarka
  participant Middleware as Middleware
  participant API as Astro API
  participant Auth as "Supabase Auth"

  Note over Browser,Middleware: Rozpoczęcie procesu autentykacji

  Browser->>API: Przesłanie danych rejestracyjnych (e-mail, hasło)
  activate API
  API->>Auth: Rejestracja użytkownika
  Auth-->>API: Potwierdzenie rejestracji lub błąd
  API-->>Browser: Odpowiedź rejestracyjna
  deactivate API

  Browser->>API: Przesłanie danych logowania
  activate API
  API->>Auth: Weryfikacja logowania
  Auth-->>API: Wygenerowany token lub błąd
  API-->>Browser: Otrzymanie tokenu sesji
  deactivate API

  Browser->>Middleware: Żądanie dostępu do zasobu
  Middleware->>Auth: Weryfikacja tokenu
  Auth-->>Middleware: Status tokenu (ważny/nie ważny)
  Middleware-->>Browser: Dostęp do zasobu lub komunikat błędu

  Note over Browser,Middleware: Proces odświeżania tokenu
  Browser->>API: Żądanie odświeżenia tokenu
  activate API
  API->>Auth: Odświeżenie tokenu
  Auth-->>API: Nowy token sesji
  API-->>Browser: Przekazanie nowego tokenu
  deactivate API
```
</mermaid_diagram>