# Dödsbo Guide

En enkel app som hjälper barn/ungdomar koordinera enkla dödsbon tillsammans med sin familj —
en delad checklista baserad på Skatteverkets bouppteckningsprocess, medlemshantering och
aktivitetslogg. Ingen juridisk rådgivning.

## Teknik

- `client/` — React + TypeScript (Vite)
- `server/` — Express + TypeScript + Prisma (PostgreSQL)

## Kom igång lokalt

Krav: Node.js 20+, Docker Desktop (för PostgreSQL).

1. Starta en lokal PostgreSQL-databas med Docker Compose:

   ```bash
   docker compose up -d
   ```

   Detta startar Postgres på `localhost:5432` (user/pass `postgres`/`postgres`, databas `dodsboguiden`),
   med datan sparad i en Docker-volym så den finns kvar mellan omstarter. Stoppa med
   `docker compose down` (lägg till `-v` för att även radera datan).

2. Installera beroenden för hela monorepot:

   ```bash
   npm install
   ```

3. Kopiera miljövariabler:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   Standardvärdena i `server/.env.example` pekar redan mot Docker Compose-databasen ovan, så inga
   ändringar krävs för lokal utveckling.

4. Skapa databasschema och seeda en admin-användare:

   ```bash
   npm run prisma:migrate --workspace=server
   npm run prisma:seed --workspace=server
   ```

   Detta skapar en admin-användare: `admin@dodsboguiden.se` / `changeme123` (byt lösenord efter första inloggning).

5. Starta både klient och server i utvecklingsläge:

   ```bash
   npm run dev
   ```

   - Klient: http://localhost:5173
   - Server: http://localhost:4000
   - Vite-servern proxar `/api`-anrop till servern lokalt.

## Testa hela flödet end-to-end

Med appen igång enligt ovan, testa hela kedjan manuellt:

1. **Registrera** ett konto på http://localhost:5173/register (t.ex. `anna@example.com`), godkänn
   GDPR-samtycket.
2. **Skapa ett dödsbo** på `/dashboard` genom att fylla i den avlidnes namn. Checklistan seedas
   automatiskt med Skatteverkets bouppteckningssteg (Förberedelser / Förrättningen / Efter
   förrättningen).
3. **Bjud in en medlem**: öppna dödsboet, ange en andra e-postadress (t.ex. `bertil@example.com`)
   under "Medlemmar". Om `bertil@example.com` inte redan har ett konto skapas en väntande
   inbjudan — öppna en inkognitoflik, registrera dig med samma e-postadress, så länkas kontot
   automatiskt till dödsboet.
4. **Slutför uppgifter**: bocka av checklistpunkter som endera användaren. Progressbaren och
   procentandelen uppdateras direkt.
5. **Kontrollera aktivitetsloggen**: längst ner på dödsbo-sidan visas alla händelser
   (skapat, inbjudan, avklarade uppgifter) med vem som gjorde vad och när.
6. **(Valfritt) Admin-vyn**: logga in som `admin@dodsboguiden.se` och besök `/admin/dashboard`,
   `/admin/users` och `/admin/audit-log` för att se statistik och alla konton i systemet.

## Scope för MVP

Utanför scope för denna första version: utskick av inbjudningsmejl (inbjudan sker via
e-postuppslagning i databasen), lösenordsåterställning, faktisk driftsättning till
Railway/Vercel, flerspråkighet, automatiserade tester.
