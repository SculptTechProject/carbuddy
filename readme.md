<img width="1630" height="644" alt="image" src="https://github.com/user-attachments/assets/a06f778d-368a-41c6-9db7-5845ba8e1a0c" />

# CarBuddy 

CarBuddy to cyfrowy asystent i towarzysz każdego kierowcy, który pilnuje wszystkich terminów serwisowych, gromadzi
historię napraw oraz pomaga znaleźć najlepsze warsztaty. Projekt został stworzony, aby dać kierowcom pełną kontrolę nad
kosztami i stanem technicznym pojazdu!

## Spis treści

* [Wizja](#wizja)
* [Grupy docelowe](#grupy-docelowe)
* [MVP](#mvp)
* [Technologie](#technologie)
* [Fazy rozwoju](#fazy-rozwoju)
* [Model biznesowy](#model-biznesowy)
* [Go-to-market](#go-to-market)
* [Kluczowe wskaźniki sukcesu](#kluczowe-wskaźniki-sukcesu)
* [Kolejne kroki](#kolejne-kroki)
* [Instalacja](#instalacja)
* [Użytkowanie](#użytkowanie)
* [Wkład](#wkład)
* [Licencja](#licencja)

## Wizja
CarBuddy to twój cyfrowy kumpl-asystent, który:

* Pilnuje wszystkich terminów związanych z autem (przeglądy, wymiany płynów, opony, ubezpieczenia).
* Gromadzi przejrzystą historię napraw z kosztami i zdjęciami faktur.
* Pomaga znaleźć najlepsze warsztaty w okolicy i zarezerwować wizytę.

Dzięki CarBuddy zapomnisz o papierologii i zyskasz pewność pełnej kontroli nad stanem technicznym swojego pojazdu.

## Grupy docelowe

### B2C

* Prywatni kierowcy (nowi i doświadczeni).
* Osoby, które chcą uporządkować harmonogram serwisowy i historię napraw.

### B2B

* Małe i średnie firmy z flotą kilku aut.
* Wspólne konto do zarządzania terminami i raportowania kosztów na poziomie całej floty.

## MVP

1. **Profil auta**
    * Wprowadzenie marki, modelu, VIN.
    * Automatycznie generowany harmonogram serwisów.

2. **Powiadomienia**
    * Push / e-mail o zbliżających się przeglądach, wymianach oleju, opon oraz wygaśnięciu ubezpieczenia.

3. **Historia napraw**
    * Rejestracja napraw z kwotami i możliwością dołączenia zdjęć faktur.

4. **Dashboard wydatków**
    * Miesięczne i roczne podsumowania kosztów utrzymania pojazdu.

## Technologie

* **Frontend**: React (web) + React Native (mobile)
* **Backend**: Node.js + Express
* **Baza danych**: PostgreSQL
* **Powiadomienia**: Firebase Cloud Messaging (FCM)
* **Infrastruktura**: Docker, AWS / DigitalOcean

## Fazy rozwoju

1. **Faza 1 (MVP)**

    * Web + mobilna aplikacja.
    * Podstawowe powiadomienia i historia napraw.
2. **Faza 2**

    * Integracja z kalendarzami Google/Apple.
    * Geolokalizacja warsztatów i system rezerwacji terminów.
    * Program partnerski (affiliate) z dostawcami części.
3. **Faza 3**

    * Analiza stylu jazdy poprzez OBD-II Bluetooth.
    * AI-owe rekomendacje serwisowe.
    * Rozbudowane raporty dla flot B2B.

## Model biznesowy

* **Freemium**: podstawowe funkcje (przypomnienia, historia napraw) za darmo.
* **Plan Pro**: zaawansowane raporty, integracje, priorytetowe wsparcie.
* **Prowizje** od warsztatów za klientów przyprowadzonych przez CarBuddy.
* **Licencje B2B**: abonament za zarządzanie flotą i raportowanie.

## Go-to-market

1. Start w Polsce: partnerstwa z lokalnymi warsztatami i sklepami z częściami.
2. Kampanie w grupach Facebook i na forach motoryzacyjnych.
3. SEO & Content marketing: poradniki takie jak „Kiedy wymienić olej?” czy „Jak przygotować auto na zimę?”.

## Kluczowe wskaźniki sukcesu

* Liczba zarejestrowanych aut i aktywnych użytkowników w miesiącu.
* Konwersja z darmowego do płatnego planu Pro.
* Procent przypomnień zrealizowanych (użytkownicy faktycznie umawiający usługę).

## Kolejne kroki

1. Zbudowanie MVP (web + podstawowa wersja mobilna).
2. Zebranie feedbacku od pierwszych kilkuset kierowców.
3. Wdrożenie prostych integracji warsztatowych i kalendarzy.
4. Rozpoczęcie kampanii pilotażowej w wybranym regionie.

## Użytkowanie

* Otwórz przeglądarkę i przejdź na `[carbuddy.pl](https://carbuddy-nine.vercel.app)`.
* Zarejestruj konto. <img width="1697" height="981" alt="image" src="https://github.com/user-attachments/assets/f7178912-d1c2-49fe-bad9-1b59ec914565" />
* Zobacz dashboard! <img width="1701" height="981" alt="image" src="https://github.com/user-attachments/assets/9c2f972b-62f8-43f9-ba99-7e5e43d159a4" />
* Dodaj swój pojazd! <img width="912" height="762" alt="image" src="https://github.com/user-attachments/assets/d41b1e14-22e3-4c8d-bd09-9e14607a9598" />
* Skonfiguruj powiadomienia i ciesz się spokojem ducha! <img width="590" height="269" alt="image" src="https://github.com/user-attachments/assets/1098c9c7-424b-49d8-8b8a-9205bc11b52d" />
 <img width="1696" height="976" alt="image" src="https://github.com/user-attachments/assets/4cfa8619-62bd-4789-884d-464577a23372" />
* Ciesz się kompletnym terminarzem! <img width="1317" height="763" alt="image" src="https://github.com/user-attachments/assets/d48f6f69-8a9c-4469-bb6e-257e2c93205f" />
* Zobacz i weryfikuj swoje koszty! <img width="1392" height="944" alt="image" src="https://github.com/user-attachments/assets/3901397f-cee8-4b4f-a931-a8b25ecfaf9f" />

## Wkład

Chętnie przyjmiemy Twoje uwagi i poprawki. Zgłaszaj pull requesty na GitHubie oraz otwieraj issues.

## Licencja

MIT © CarBuddy Team
