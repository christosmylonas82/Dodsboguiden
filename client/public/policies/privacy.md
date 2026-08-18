INTEGRITETSPOLICY för DödsboGuiden

Version: 1.0
Senast uppdaterad: 18 augusti 2026

---

## 1. INTRODUKTION & DATAKONTROLLANT

DödsboGuiden är en gratis webbtjänst för dödsbohantering.

**Datakontrollant (data controller) enligt GDPR:**
- Namn: Christos Mylonas
- E-post: christos@mylonas.se

---

## 2. VILKEN DATA SAMLAR VI IN?

### 2.1 Data du ger oss vid registrering

- Namn
- E-postadress
- Lösenord (krypterat via bcrypt, aldrig lagrat som klartext)

### 2.2 Data du skapar när du använder tjänsten

- Dödsbo-information (namn på avliden, familjemedlemmar, kontakter)
- Dokumentation och anteckningar om dödsbon
- Aktivitetshistorik (vad du har gjort, tidsstämplar)

### 2.3 Data vi samlar automatiskt

- Sessionsidentifierare (för att hålla dig inloggad)
- CSRF-tokens (säkerhet mot vissa attacker)
- Tidsstämplar för när du loggar in/ut
- Vilka funktioner du använder (för debugging)

### 2.4 Data vi INTE samlar in

- IP-adress
- Geografisk plats
- GPS-position
- Telefonnummer
- Kreditkorts-information
- Biometrisk data
- Enhetens enhets-ID (IDFA, AAID)

---

## 3. VARFÖR SAMLAR VI DATA? (ÄNDAMÅL)

**Tjänstens funktion:**
- Autentisering (verifiera att du är du)
- Lagring av dina dödsbon och information
- Möjliggöra samarbete mellan familjemedlemmar
- Redundans/backups

**Säkerhet och teknik:**
- Detektera och blockera missbruk
- Felsökning och underhåll
- Hantera login-sessioner

**Juridiska krav:**
- Uppfylla bokföringslagar (6 år dokumentation)
- Svara på GDPR-begäranden
- Svara på myndighetsbegäranden (polis, åklagare)

**Vi gör ALDRIG detta:**
- Marknadsföring eller reklam
- Sälja data till tredje part
- Personlig profilering
- Överföra data för AI-träning

---

## 4. JURIDISK GRUND FÖR DATABEHANDLING (GDPR ART. 6)

**GDPR Artikel 6(1)(b) — Avtal:**
Du godkänner denna behandling när du registrerar dig. Vi behöver denna data för att tjänsten ska fungera.

**GDPR Artikel 6(1)(f) — Berättigat intresse:**
Säkerhet (förhindra missbruk), teknik-drift och debugging, bedrägeri-skydd.

**GDPR Artikel 6(1)(c) — Rättslig förpliktelse:**
Bokföring enligt lag, myndighetsbegäranden.

---

## 5. HUR LÄNGE SPARAR VI DATA?

| Data | Sparas i | Rättslig grund |
|------|----------|----------------|
| Konto (namn, e-post, lösenord) | Tills du raderar | Avtalet |
| Dödsbon och innehåll | Tills du raderar | Avtalet |
| Aktivitetslogg (inloggning, åtgärder) | 90 dagar | Säkerhet |
| Bokförings-data | 6 år | Bokföringslagen |

**Auto-purge:** Aktivitetsloggar äldre än 90 dagar raderas automatiskt.

**Kontoborttagning:** Om du raderar ditt konto:
- Omedelbart: Kontot blir otillgängligt
- Personlig information (namn, e-post, lösenord) anonymiseras direkt
- Bokförings-data sparas 6 år (lagkrav)

---

## 6. LÖSENORD OCH AUTENTISERING

**Lösenord:**
- Lagras som bcrypt-hash (kan aldrig läsas, inte ens vi kan se det)
- Överförs via HTTPS (krypterat under transit)
- Du kan byta det via Inställningar

**Sessioner:**
- Inloggnings-token giltigt i 7 dagar
- Lagrat i webbläsarens local storage
- Krypterat under transport (HTTPS)

**Lösenordsåterställning:**
- Du får en engångs-länk (om e-posttjänst är konfigurerad — i dagsläget levereras länken av en administratör)
- Länken är giltig i 24 timmar
- Länken kan bara användas en gång

---

## 7. TREDJE-PARTS TJÄNSTER

Vi använder följande tjänster för att driften ska fungera:

| Tjänst | Vad den gör | Lokation |
|--------|-------------|----------|
| Railway.app | Kör servern och databasen | USA |

**Notera:**
- Dessa tjänster behandlar data endast på våra instruktioner
- De har ingen rätt att använda din data för eget bruk
- Du kan se deras egna privacy policies för mer information

---

## 8. DINA RÄTTIGHETER ENLIGT GDPR

### 8.1 Rätt att veta (GDPR Art. 15 — Data Subject Access Request)

Du kan begära en kopia av all data vi lagrar om dig, direkt i appen via Inställningar → "Exportera data" (JSON-fil med ditt konto, dina dödsbon, och din inloggningshistorik).

Du kan även begära det via e-post: christos@mylonas.se. Vi svarar inom 30 dagar.

### 8.2 Rätt att korrigera (GDPR Art. 16)

Du kan uppdatera din egen data själv via Inställningar → "Redigera profil". Ändringar sparas omedelbart.

För övriga korrigeringar, kontakta: christos@mylonas.se

### 8.3 Rätt till radering (GDPR Art. 17 — Rätten att bli glömd)

Du kan radera ditt konto helt via Inställningar → "Radera konto".

**Vad som raderas:**
- Ditt konto (namn, e-post, lösenord anonymiseras)
- Dödsbon du äger ensam
- Din inloggningshistorik

**Vad som sparas (lagkrav):**
- Bokförings-data (6 år enligt bokföringslag)
- Dödsbon där andra familjemedlemmar fortfarande är medarbetare (vi kan inte radera andras arbete)

### 8.4 Rätt att begränsa behandling (GDPR Art. 18)

Du kan be oss pausa behandlingen av din data medan du ifrågasätter den. Kontakta: christos@mylonas.se

### 8.5 Rätt att överföra data (GDPR Art. 20 — Data Portability)

Du kan få din data i maskinläsbart format (JSON) direkt via Inställningar → "Exportera data", eller genom att kontakta christos@mylonas.se.

### 8.6 Rätt att invända (GDPR Art. 21)

Du kan invända mot behandling baserad på "berättigat intresse". Kontakta: christos@mylonas.se

---

## 9. SÄKERHET

**Hur vi skyddar din data:**
- HTTPS/TLS: All data krypteras när den överförs
- Lösenord: Lagras som bcrypt-hash, aldrig i klartext
- Databas: Lösenordsskyddad

**Vad vi INTE gör (transparens om nuläget):**
- Vi har ingen separat kryptering av databasen utöver vad vår serverleverantör (Railway) tillhandahåller
- Vi genomför inga regelbundna, schemalagda säkerhetstester
- Vi har ingen extern säkerhetsövervakning

**Om något går fel:**
1. Vi identifierar problemet
2. Vi rapporterar till Integritetsskyddsmyndigheten inom 72 timmar (GDPR Art. 33)
3. Vi kontaktar dig om dina data är påverkade
4. Vi dokumenterar vad som hände

---

## 10. BARNSKYDD

Du måste vara minst 18 år för att använda DödsboGuiden.

Om vi upptäcker att ett barn använder tjänsten raderar vi kontot och all data, och försöker kontakta vårdnadshavaren.

Rapportera barn-användning: christos@mylonas.se

---

## 11. ÄNDRINGAR AV DENNA POLICY

Vi kan uppdatera denna policy när som helst.

**Vid en stor ändring:** Vi skickar e-post och du får minst 14 dagars varsel.

**Vid en liten ändring:** Vi uppdaterar denna sida, och "Senast uppdaterad"-datumet ändras.

Fortsatt användning av appen innebär att du godkänner den nya versionen.

---

## 12. KONTAKT

**För dataskyddsfrågor:**

E-post: christos@mylonas.se

Vi svarar inom 3 arbetsdagar för enkla frågor, och inom 30 dagar för officiella GDPR-begäranden.

**Om du vill klaga på oss:**

**Integritetsskyddsmyndigheten (IMY)**
Box 8114
104 20 Stockholm
Sverige

E-post: kontakt@imy.se
Telefon: 08-555 084 00
Webbplats: www.imy.se

Klagomål är gratis och du behöver inte gå via oss.

---

### Sammanfattning i enkla ord

- Vi sparar din data i en databas
- Vi använder den endast för tjänsten och säkerhet
- Vi samlar inte in IP-adress eller platsdata
- Du kan alltid se, korrigera eller radera din data
- Vi delar aldrig data med tredje part (utom vid laglig begäran)
- Vi följer GDPR
- Kontakta oss om du har frågor

---

*Version 1.0 — 18 augusti 2026*
