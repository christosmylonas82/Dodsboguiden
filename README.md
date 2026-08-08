# Dödsbo Guide

En enkel app som hjälper barn/ungdomar koordinera enkla dödsbon tillsammans med sin familj —
en delad checklista baserad på Skatteverkets bouppteckningsprocess, medlemshantering och
aktivitetslogg. Ingen juridisk rådgivning.

## Teknik

- `client/` — React + TypeScript (Vite)
- `server/` — Express + TypeScript + Prisma (PostgreSQL)

## Kom igång lokalt

Krav: Node.js 20+, en lokal PostgreSQL-databas.

1. Installera beroenden för hela monorepot:

   ```bash
   npm install
   ```

2. Kopiera miljövariabler och fyll i dina egna värden:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Skapa databasschema och seeda en admin-användare:

   ```bash
   npm run prisma:migrate --workspace=server
   npm run prisma:seed --workspace=server
   ```

   Detta skapar en admin-användare: `admin@dodsboguiden.se` / `changeme123` (byt lösenord efter första inloggning).

4. Starta både klient och server i utvecklingsläge:

   ```bash
   npm run dev
   ```

   - Klient: http://localhost:5173
   - Server: http://localhost:4000
   - Vite-servern proxar `/api`-anrop till servern lokalt.

## Scope för MVP

Utanför scope för denna första version: utskick av inbjudningsmejl (inbjudan sker via
e-postuppslagning i databasen), lösenordsåterställning, faktisk driftsättning till
Railway/Vercel, flerspråkighet, automatiserade tester.
