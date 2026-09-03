export type ChecklistPhase =
  | 'Direkt efter dödsfall'
  | 'Begravning & ceremoni'
  | 'Inför bouppteckning'
  | 'Under bouppteckning'
  | 'Avslut & arvskifte';

export type ChecklistPriority = 'NOW' | 'SOON' | 'LATER';

export type ChecklistScenario = 'company' | 'coOwnership' | 'foreignAssets' | 'rentalProperty' | 'digitalAssets';

export interface ChecklistTemplateItem {
  title: string;
  description: string;
  moreInfo: string;
  url: string | null;
  phase: ChecklistPhase;
  priority: ChecklistPriority;
  timeEstimate: string;
  responsibleRole: string;
  /** Only included when the matching Project scenario flag is true. Omitted = shown to everyone. */
  scenario?: ChecklistScenario;
}

export const SCENARIO_LABELS: Record<ChecklistScenario, string> = {
  company: 'Företag eller näringsverksamhet',
  coOwnership: 'Samägande med annan person',
  foreignAssets: 'Tillgångar utomlands',
  rentalProperty: 'Hyresrätt',
  digitalAssets: 'Digitala tillgångar och abonnemang',
};

/** Core items, plus any scenario items whose scenario is in `activeScenarios`. */
export function getChecklistItems(activeScenarios: ChecklistScenario[]): ChecklistTemplateItem[] {
  return DEFAULT_CHECKLIST.filter((item) => !item.scenario || activeScenarios.includes(item.scenario));
}

export const DEFAULT_CHECKLIST: ChecklistTemplateItem[] = [
  // Direkt efter dödsfall
  {
    title: 'Meddela närmaste familjen omedelbar',
    description:
      'De närmaste anhöriga måste informeras så snart som möjligt för att kunna börja sortera tankar och börja planera nästa steg tillsammans.',
    moreInfo:
      'Ring eller träffa personligen de närmaste anhöriga. Både föräldrar, barn, makar/makan och syskon bör informeras. Det är viktigt att göra detta snabbt för att alla kan börja processen tillsammans.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig',
  },
  {
    title: 'Säkra den avlidnes hem och tillhörigheter',
    description:
      'Hemmet och dess innehål måste säkras direkt efter dödsfallet för att skydda värdesaker och dokumentation.',
    moreInfo:
      'Kontrollera att lås är säkra, samla alla nycklar, informera grannar om situationen. Om bostaden är tom: sänk värmen, töm kylskåp och frys, tänd lampor för att skrämma bort inbrottstjuvar.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig eller dödsbodelägare',
  },
  {
    title: 'Notera var viktiga handlingar kan finnas',
    description:
      'Viktiga dokument behövs för alla juridiska processer framöver. Du måste snabbt inventera var dessa kan finnas.',
    moreInfo:
      'Sök i hemmet efter: testamente, försäkringsdokument, bankhandlingar, ID-handlingar, bouppteckningar, avtalshandlingar. Skapa en lista över var du hittar dessa för senare bruk. Spara allt på ett säkert ställe.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontakta begravningsbyrå för första konsultation',
    description:
      'Begravningsbyrå är din första kontaktpunkt för att planera ceremonin och få vägledning genom processen.',
    moreInfo:
      'Ring omedelbar och boka ett möte. Diskutera: den avlidnes önskemål om begravningstyp, tidsplan för nästa vecka, begravningsutgifter och försäkringar. De kan även hjälpa till med mycket praktik.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig eller dödsbodelägare',
  },
  {
    title: 'Samla familjen för gemensamt möte - vem gör vad?',
    description:
      'En tydlig fördelning av arbete gör att familjen kan jobba tillsammans utan dubbelarbete och stress.',
    moreInfo:
      'Organisera ett möte där alla kan träffas (fysiskt eller digitalt). Diskutera: vem ansvarar för vad? Vem kontaktar vilka? Vem hanterar ekonomin? Använd DödsboGuiden för att dela uppgifter. Skriv ner vem som gör vad så alla vet sitt ansvar.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig (leder mötet)',
  },
  {
    title: 'Informera arbetsgivare och arbetskollegor',
    description:
      'Arbetsplatsen behöver veta om dödsfallet för att kunna ge stöd och för att lösa praktiska frågor om lön, permission och försäkringar.',
    moreInfo:
      'Informera arbetsgivaren så snart som möjligt. De kan ofta ge stöd genom LO-försäkring eller grupplivförsäkring. Diskutera permission för begravning och administrativa uppgifter.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'SOON',
    timeEstimate: '30 min - 1 timme',
    responsibleRole: 'Närmaste anhörig eller administratör',
  },
  {
    title: 'Anmäl dödsfallet till relevanta myndigheter',
    description:
      'Myndigheterna behöver veta om dödsfallet för att kunna öppna dödsboet juridiskt och starta administrativa processer.',
    moreInfo:
      'Kontakta: Skatteverket (för dödsboregistrering), sjukhuset eller läkaren (för dödsanmälan), försäkringsbolag. Du behöver dödsbevis för många av dessa kontakter - börja med sjukhuset/läkaren.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontrollera om den avlidne ägde ett företag',
    description:
      'Ett företag kan behöva omedelbar tillsyn - vänta inte med att ta reda på om den avlidne var företagare.',
    moreInfo:
      'Kontrollera omedelbart om den avlidne ägde eller var delägare i ett företag (aktiebolag, enskild firma, handelsbolag). Det är viktigt att veta detta direkt eftersom företaget kan behöva operativ omsorg - anställda, kunder och avtal väntar inte. Fråga familj och bekanta, eller sök upp den avlidnes namn på bolagsverket.se.',
    url: 'https://www.bolagsverket.se',
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '30 min - 1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Säkra e-postkonton',
    description: 'Ett öppet e-postkonto kan missbrukas för att återställa lösenord på andra konton.',
    moreInfo:
      'Hitta och säkra den avlidnes e-postadress(er) omedelbart. Det är enkelt för obehöriga att missbruka ett öppet e-postkonto för lösenordsåterställning på andra konton. Kontakta e-postleverantören (Gmail, Outlook, etc.) och informera att kontot tillhör en avliden person - du behöver troligen ett dödsbevis.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '30 min - 1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Säkra sociala medier-konton',
    description: 'Sociala medier-konton bör säkras direkt för att förhindra missbruk.',
    moreInfo:
      'Hitta alla sociala medier-konton (Facebook, Instagram, LinkedIn, X/Twitter). Säkra dem omedelbart för att förhindra att obehöriga loggar in. Beslut om kontona ska stängas eller omvandlas till minnessidor kan fattas senare - de flesta plattformar har särskilda processer för dödsfall.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'SOON',
    timeEstimate: '30 min - 1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Hitta och säkra lösenordshanterare',
    description: 'En lösenordshanterare kan ge tillgång till alla den avlidnes digitala konton på en gång.',
    moreInfo:
      'Kontrollera om den avlidne använde en lösenordshanterare (1Password, Bitwarden, LastPass, etc.). Om lösenorden finns där men hanteraren är låst kan de gå förlorade helt. Kontakta leverantören med dödsbevis för åtkomst, eller sök efter ett huvudlösenord som kan ha antecknats någonstans.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '30 min - 1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontrollera kryptovalutor och digitala plånböcker',
    description: 'Kryptovalutor kan vara värdefulla men försvinner för alltid om nycklarna går förlorade.',
    moreInfo:
      'Fråga om den avlidne ägde kryptovalutor (Bitcoin, Ethereum, etc.) eller hade digitala plånböcker. Dessa kan lagras på olika plattformar eller i hårdvaruplånböcker, och kan försvinna helt om lösenord eller privata nycklar går förlorade. Kan vara mycket värdefullt för dödsboet - sök brett innan du går vidare.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Pausa onlinebutiker och digitala affärer',
    description: 'En aktiv webbutik måste pausas snabbt för att undvika okontrollerad försäljning eller uttag.',
    moreInfo:
      'Om den avlidne drev en webbutik, Etsy-butik eller andra onlineaffärer måste dessa pausas omedelbart för att undvika att varor säljs eller pengar dras utan övervakning. Notera all information (inloggning, saldo, pågående ordrar) för senare värdering och avveckling.',
    url: null,
    phase: 'Direkt efter dödsfall',
    priority: 'NOW',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },

  // Begravning & ceremoni
  {
    title: 'Klargöra den avlidnes begravningsönskemål',
    description: 'Det är viktigt att respektera den avlidnes egna önskemål om hur begravningen ska genomföras.',
    moreInfo:
      'Sök efter skriftliga önskemål (testamente, brev, anteckningar). Fråga anhöriga om de vet vad personen ville. Kontrollera om det finns intyg hos begravningsbyråer (Vita arkivet, Livsarkivet). Spara eventuell begravningsförsäkring.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig',
  },
  {
    title: 'Välja begravningstyp och ceremoniformat',
    description:
      'Valet av begravningstyp påverkar både kostnad, tidsplan och ceremoniprogram. Familjen bör diskutera detta tillsammans.',
    moreInfo:
      'Alternativ: jordbegravning, kremering med urnbegravning, spridning av aska. Ceremoniformat: kyrklig, religiös, eller helt privat. Diskutera tillsammans vad som känns rätt. Begravningsbyrån kan presentera alla alternativ och kostnader.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'NOW',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Närmaste anhörig och familj',
  },
  {
    title: 'Planera dödsannons och informationsspridning',
    description: 'Dödsannons informerar vänner, kollegor och bekanta om dödsfallet och ceremonin.',
    moreInfo:
      'Bestäm innehål tillsammans: namn, ålder, datum, begravningstyp, ceremoniönskemål, blommor ja/nej. Fördela arbetet: vem skriver annonsen? Vem kontaktar tidningen? Vem informerar sociala medier, arbetskamrater, föreningar?',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig (ofta med familjens input)',
  },
  {
    title: 'Organisera praktiska arrangemang för ceremonin',
    description: 'Många praktiska detaljer behöver organiseras för att ceremonin ska bli väl genomförd.',
    moreInfo:
      'Koordinera: boka lokal (kyrka, kapell eller annan), välja officiant/präst/talare, val av musik, blomsterarrangemang, dekoration, läsningar/tal från anhöriga, midi/kaffe/fika efter ceremonin, inbjudningar till gäster. Dela upp arbetet mellan familjemedlemmar!',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '2-4 timmar',
    responsibleRole: 'Flera familjemedlemmar (delat arbete)',
  },
  {
    title: 'Fördela uppgifter mellan familjemedlemmar',
    description: 'En tydlig uppgiftsfördelning minskar stress och ser till att ingenting glöms bort.',
    moreInfo:
      'Skapa en lista: vem hanterar blomster? Vem pratar med kyrkan? Vem ordnar fika? Vem tar fotona? Vem talar på ceremonin? Använda DödsboGuiden för att tilldela ansvar och hålla koll på vad som är gjort.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Närmaste anhörig (organisatör)',
  },
  {
    title: 'Genomför ceremonin',
    description: 'Ceremonin är en viktig tillfälle för familjen och vänner att hedra den avlidne tillsammans.',
    moreInfo:
      'Dagen innan: kontrollera alla detaljer, bekräfta tider, se till att alla vet sitt ansvar. Under ceremonin: var närvarande, stötta varandra, ge utrymme för att höra musik och tal. Efter ceremonin: välkomna gäster, dela minnen, stötta varandra.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'NOW',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Alla familjemedlemmar',
  },
  {
    title: 'Skicka tackbrev och tacka alla bidragande',
    description:
      'Det är vårdat att tacka alla som bidrog till begravningen - blommor, tal, praktisk hjälp, stöd.',
    moreInfo:
      'Skicka personliga tackbrev till: de som skickade blommor, talare, musikanter, kyrkan, begravningsbyrån, närmare vänner som hjälpte. Du kan dela arbetet flera personer emellan. Tackbreven behöver inte vara långa - en kort personlig hälsning räcker.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig eller flera',
  },
  {
    title: 'Betala begravningsutgifter och spara kvitton',
    description: 'Alla begravningsutgifter måste dokumenteras för bouppteckningen och skatteverket.',
    moreInfo:
      'Samla alla kvitton från: begravningsbyrå, kyrka, blomster, fika, blommor, tal, musik, annonser. Notera vem som betalade vad. Dödsboet betalar för begravningen - spara allt för senare redovisning. Skapa ett dokument med alla utgifter.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare (eller den som ansvarar för ekonomin)',
  },
  {
    title: 'Arkivera gravrättsdokumentation',
    description: 'Gravrättsdokumenten behöver sparas säkert för framtida referens och skyldigheter.',
    moreInfo:
      'Spara: gravrättsbeslut, gravplatsavgifter, begravningsförsäkring, kontrakt med begravningsbyrå. Lagra säkert tillsammans med övrig dödsboedokumentation.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Informera begravningsföreningar och samhällen',
    description: 'Om den avlidne var medlem i föreningar eller religiösa samhällen kan dessa vilja informeras.',
    moreInfo:
      'Kontakta: kyrkan (om medlem), moské/synagoga, röda korset, pensionärsföreningar, idrottsföreningen, hobbyföreningar, etc. De kan vilja visa sympati och många erbjuder egen begravningsceremoni.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Närmaste anhörig',
  },
  {
    title: 'Planera minnesstund eller minnesgudstjänst',
    description:
      'Många familjer vill arrangera en minnesstund någon vecka eller månad senare för att hedra den döde när det akuta sorgen lugnat sig.',
    moreInfo:
      'Denna kan vara helt privat (familjemiddag) eller större (minnesgudstjänst). Arrangeras ofta 2-6 veckor efter begravningen. Kan kombineras med lagom för att dela minnen och foton.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'LATER',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmare anhöriga',
  },
  {
    title: 'Ordna med gravsten eller gravmarkering',
    description: 'Gravstenen är en långsiktig markering av den avlidnes viloställe.',
    moreInfo:
      'Kontakta gravstenshuggar eller begravningsbyrå. Välj sten, design, text och inristning. Många väntar med detta i ett par månader för att ge familjen tid att sortera. Gravstenen betalas från dödsboet. Spara kvitton för bouppteckningen.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'LATER',
    timeEstimate: '2-4 timmar',
    responsibleRole: 'Dödsbodelägare eller familjen',
  },
  {
    title: 'Uppdatera sociala medier och sluta dela personlig information',
    description: 'Den avlidnes sociala medier behöver hanteras med respekt och säkerhet.',
    moreInfo:
      'Om den avlidne hade activ närvaro: gör sidan till minnessida (Facebook), eller dölja den. Uppdatera profilbeskrivning om det passar. Avsluta inloggade sessioner från andra platser för säkerhet. Funderas på hur den avlidnes digitala efterlämningar ska hanteras långsiktigt.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'En familjemedlem (eller flera)',
  },
  {
    title: 'Avsluta eller uppdatera medlemskap på begravningsplatsen',
    description: 'Gravrättens underhåll behöver säkerställas långsiktigt.',
    moreInfo:
      'Kontakta kyrkogården eller begravningsplatsen. Diskutera långsiktigt underhål av graven. Vissa platser kräver årliga avgifter. Se till att familjen vet om dessa för framtiden.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'LATER',
    timeEstimate: '30 min - 1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Genomför slututgifter från dödsboet för begravning',
    description: 'Alla begravningsutgifter måste betalas från dödsboets medel innan arv kan fördelas.',
    moreInfo:
      'Beräkna totala utgifter för begravningen. Överför medel från dödsboets bankkonto för att betala: begravningsbyrå, kyrka, blomster, annonser, gravsten, fika. Dokumentera alla utgifter för bouppteckningen.',
    url: null,
    phase: 'Begravning & ceremoni',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare (ekonomiansvarig)',
  },

  // Inför bouppteckning
  {
    title: 'Sök efter testamente och juridiska dokument',
    description: 'Testamente är den viktigaste dokumentationen för arvsfördelningen och måste hittas tidigt.',
    moreInfo:
      'Sök i hemmet: skrivbord, arkiv, bankfack. Kontakta Skatteverkets testamentsregister. Fråga anhöriga. Se även efter andra juridiska dokument: giftermålsbrev, skilsmässobeslut, adoptiondokument. Spara allt på ett säkert ställe. Om testamente saknas: följ svenska intestatreglerna (lag om arv).',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Ansök om dödsbevis från Skatteverket',
    description: 'Dödsbevis är obligatorisk för nästan alla juridiska processer och många administrativa åtgärder.',
    moreInfo:
      'Beställ från: Skatteupplysningen (0771-567 567), begravningsbyrå, eller online via Skatteverkets webbplats. Beställ flera kopior (vanligt att behöva 10-15 st). Du behöver detta för: banker, försäkringar, bouppteckning, myndigheter. Spara ett original.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Inventera alla tillgångar systematiskt',
    description: 'Fullständig inventering av alla tillgångar är grundpelaren för bouppteckningen.',
    moreInfo:
      'Gå genom allt systematiskt: bankkonton (samla kontouppgifter från banker), fastigheter (sök lagfarter, försäljnings-handlingar), fordon (kontakta Transportstyrelsen för ägaruppgifter), försäkringar (liv-, sjuk-, olycksfalls-försäkringar), aktier och värdepapper, värdesaker (smycken, konst), lösöre (möbler, verktyg, samlingar), pengar i hemmet. Använd DödsboGuiden Inventarielista för att dokumentera allt.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '4-8 timmar',
    responsibleRole: 'Dödsbodelägare (kan delas med familjen)',
  },
  {
    title: 'Dokumentera alla skulder och lån',
    description: 'Alla skulder måste inventeras för att kunna betalas före arv fördelas.',
    moreInfo:
      'Kontakta alla banker och finansinstitut för att få information om: bolån, personliga lån, kreditkort, delbetaling, fordonslån. Sök efter långivardokument i hemmet. Kontrollera även för återstående hyra, driftskostnader, försäkringar, telefonabonnemang. Spara all dokumentation. Använd DödsboGuiden Inventarielista för att dokumentera.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '2-4 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Samla all finansiell dokumentation',
    description: 'Organiserad dokumentation gör bouppteckningen mycket enklare senare.',
    moreInfo:
      'Samla i en mapp: bankhandlingar, kontobesked, försäkringsavtal, aktie/värdepappershand, fastighets-handlingar, lånekontrakt, hyreskontrakt, försäljningskontakt. Sortera per typ av tillgång/skuld. Skanna allt eller förvara säkert. Denna dokumentation behövs för värdering och skattemässig behandling.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Avgör om professionell hjälp behövs',
    description: 'Vissa dödsbon är komplicerade och kräver juristkompetens. Det är viktigt att bedöma detta tidigt.',
    moreInfo:
      'Behövs jurist/boutredningsman om: Testamente är komplicerat, flera arvingar är oense, fastigheter eller företag ingår, stora skattefrågor, internationella tillgångar/arv, arvstvister eller juridiska oklarheter. Kontakta Hansens tingsrätt för ansökan om boutredningsman. DödsboGuiden kan hjälpa dig bedöma komplexiteten.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig eller dödsbodelägare',
  },
  {
    title: 'Öppna gemensamt arbetsmaterial för familjen',
    description:
      'Om flera personer arbetar med dödsboet behövs gemensamt arbetsmaterial för att undvika dubbelarbete och missförstånd.',
    moreInfo:
      'Använd DödsboGuiden för att dela tillgång med övriga dödsbodelägare. Bjud in alla som behöver: medarvingar, maka/make, anhöriga. Alla kan då se vad som är gjort, vad som återstår, och vem som ansvarar för vad. Minska röra genom att ha En Plats för allt.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Avgör om bodelning behövs före bouppteckning',
    description: 'Om den avlidne var sambo (men inte gift) kan bodelning behövas före bouppteckning.',
    moreInfo:
      'Endast gift/registrerad partner ärvs automatisk. Sambo har ingen arvsrätt. Om den avlidne var sambo kan partnern behöva göra bodelning för sina egna bidrag till hemmet. Detta måste lösas innan boupptecningen slutförs. Rådfråga jurist om detta gäller din situation.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig eller juridisk vägledning',
  },
  {
    title: 'Skriv fullmakt för dödsbo och praktiska ärenden',
    description:
      'Om ni är flera dödsbodelägare är det praktiskt att utse en person som företrädare. Ni behöver då skriva en fullmakt. Dokumentera även betalningar av räkningar och uppsägning av abonnemang.',
    moreInfo:
      'Som nära anhörig är du ofta dödsbodelägare tillsammans med andra. Om ni är flera i dödsboet är det praktiskt att utse en av er som företrädare för att hantera administrativa ärenden — samla alla dödsbodelägare, avgör vem som ska vara ombud, och skriv en fullmakt med namn och personnummer som undertecknas av alla. Spara den tillsammans med övriga dödsbodokument. Samtidigt måste löpande räkningar betalas — hyra, el, telefon, vatten med mera, helst inom 1-2 veckor efter dödsfallet. Ta med räkningarna till den avlidnes bank eller använd bankens betaltjänst för dödsbo, och spara alla kvitton. Säg också upp autogiro och stående betalningar samt avsluta abonnemang och medlemskap: telefon och internet, el/gas/vatten, hem- och möbelförsäkringar, TV/streaming och gymkort. Spara skriftlig bekräftelse på varje uppsägning.',
    url: 'https://www.skatteverket.se/',
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Vilka bankkonton och värdepapper finns?',
    description: 'En samlad lista på alla konton och värdepapper gör resten av bouppteckningen mycket enklare.',
    moreInfo:
      'Gå igenom alla banker den avlidne kan ha haft konton hos, samt eventuella depåer, fonder och aktier. Kontakta varje bank för kontobesked per dödsdagen. Notera kontonummer, saldo och ISIN-koder för värdepapper - detta behövs både för inventeringen och för värderingen.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Finns försäkringar som behöver anmälas?',
    description: 'Livförsäkringar och andra försäkringar kan ge utbetalningar som måste begäras aktivt.',
    moreInfo:
      'Sök efter försäkringsbrev i hemmet och fråga arbetsgivare (grupplivförsäkring är vanligt). Kontrollera liv-, olycksfalls- och tjänstegruppslivförsäkringar. Många försäkringar betalas inte ut automatiskt - dödsboet eller förmånstagaren måste anmäla dödsfallet till bolaget.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontrollera om det finns arvsavtal, gåvobrev eller enskild egendom',
    description: 'Äktenskapsförord, gåvobrev och enskild egendom kan påverka vad som ingår i bouppteckningen.',
    moreInfo:
      'Utöver testamentet: leta efter äktenskapsförord, gåvobrev med villkor om enskild egendom, eller arvsavtal mellan makar. Dessa avgör vad som räknas som den avlidnes egendom respektive den efterlevande makens, vilket påverkar både bodelning och bouppteckning.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Är något samägt med annan person?',
    description: 'Fastigheter, bostadsrätter eller andra tillgångar som delas med någon annan skapar extra steg.',
    moreInfo:
      'Kontrollera om den avlidne ägde fastigheter, bostadsrätter, fordon eller andra tillgångar tillsammans med en sambo, ex-make, barn eller vän. Om ja - kryssa i "Samägande" i projektets inställningar för att få tillgång till en fördjupad checklista för detta.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Medlemskap i bostadsrättsförening upphör automatiskt',
    description: 'Vid dödsfall upphör bostadsrättshavarens medlemskap direkt - dödsboet behöver inte bli medlem.',
    moreInfo:
      'När en bostadsrättshavare dör upphör medlemskapet i föreningen omedelbart. Ni behöver INTE bli medlem själva - dödsboet kan äga bostadsrätten utan medlemskap under en övergångsperiod. Informera föreningen om dödsfallet så snart som möjligt.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Ansök om medlemskap i bostadsrättsföreningen om aktuellt',
    description: 'Dödsboet kan ansöka om medlemskap som juridisk person, men föreningen kan neka.',
    moreInfo:
      'Om det finns en bostadsrätt kan dödsboet ansöka om att bli medlem i föreningen som juridisk person. Observera: föreningen är inte skyldig att acceptera ett dödsbo som medlem - planera för att ansökan kan avslås och att bostadsrätten då måste överlåtas eller säljas.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Notera tre-årsregeln för bostadsrätt i dödsbo',
    description: 'Ett dödsbo får normalt äga en bostadsrätt utan medlemskap i högst tre år.',
    moreInfo:
      'Enligt bostadsrättslagen kan ett dödsbo äga en bostadsrätt i upp till tre år utan medlemskap i föreningen. Efter tre år kan föreningen kräva att bostadsrätten säljs eller överlåts till en av dödsbodelägarna. Notera datumet så ni har koll på tidsfristen.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '15 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Godkännande krävs för andrahandsuthyrning av bostadsrätt',
    description: 'Andrahandsuthyrning av en bostadsrätt i dödsboet kräver styrelsens godkännande.',
    moreInfo:
      'Om någon bor i lägenheten i andra hand (hyr av dödsboet) måste detta godkännas av bostadsrättsföreningens styrelse. Utan godkännande kan föreningen neka och kräva att hyresgästen flyttar. Ansök i god tid om ni planerar att hyra ut.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Fortsätt betala månadsavgift till bostadsrättsföreningen',
    description: 'Avgiften till föreningen måste betalas hela tiden dödsboet äger bostadsrätten.',
    moreInfo:
      'Dödsboet måste betala månadsavgift till bostadsrättsföreningen för hela perioden det äger lägenheten, även om ingen bor där. Missade avgifter kan leda till att föreningen kräver försäljning - se till att betalningarna sköts löpande, till exempel via autogiro från dödsboets konto.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontrollera personliga lån från privatpersoner',
    description: 'Lån mellan privatpersoner syns inte hos kreditupplysningen och måste letas fram manuellt.',
    moreInfo:
      'Kontrollera om den avlidne lånade pengar av eller till familj, vänner eller kollegor. Dessa skulder ska normalt regleras från dödsboet innan arvet delas ut. Sök efter skuldebrev eller skriftliga avtal i hemmet, och fråga närstående direkt.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Lista kreditkort och återstående skuld',
    description: 'Kreditkortsskulder fortsätter generera ränta efter dödsfallet om de inte hanteras.',
    moreInfo:
      'Lista alla kreditkort den avlidne hade och kontrollera återstående saldo på varje. Räntekostnader kan fortsätta växa efter dödsfallet om skulden inte betalas eller spärras. Dödsboet ska betala av dessa innan arvet delas ut - kontakta varje kortutgivare för aktuellt saldo.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Sök efter skuldebrev eller fordringar',
    description: 'Den avlidne kan både ha lånat ut och lånat in pengar - båda delarna hör till dödsboet.',
    moreInfo:
      'Kontrollera om den avlidne hade lånat ut eller lånat in pengar dokumenterat i skuldebrev. Ett skuldebrev där den avlidne var långivare är en tillgång i dödsboet (någon är skyldig dödsboet pengar); ett där den avlidne var låntagare är en skuld som ska regleras.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontrollera förfallen skatt från tidigare år',
    description: 'Obetald skatt från tidigare år är en skuld som dödsboet ansvarar för.',
    moreInfo:
      'Kontrollera med Skatteverket om den avlidne hade obetalda skatteskulder från tidigare år, till exempel kvarskatt. Dödsboet måste betala dessa innan bouppteckningen kan slutföras och arvet delas ut.',
    url: 'https://www.skatteverket.se/',
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min - 1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontrollera pensionsfordringar (ATP, tjänstepension)',
    description: 'Det kan finnas intjänad pension som ännu inte betalats ut och som ska tas om hand.',
    moreInfo:
      'Kontrollera om den avlidne hade intjänad allmän pension (ATP) eller tjänstepension som ännu inte betalats ut fullt ut. Ibland finns pengar kvar att hämta hos Pensionsmyndigheten eller tidigare arbetsgivares pensionsbolag - kontakta dem för besked.',
    url: 'https://www.pensionsmyndigheten.se',
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Kontrollera löpande vård- eller omsorgsavtal',
    description: 'Avtal om hemtjänst eller äldreomsorg kan medföra kostnader som fortsätter en tid efter dödsfallet.',
    moreInfo:
      'Om den avlidne hade avtal om hemtjänst, hemsjukvård eller annan omsorg - kontrollera uppsägningstider och om några avgifter redan är fakturerade. De flesta avtal upphör vid dödsfallet, men vissa kan medföra en sista faktura som dödsboet ska betala.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },

  // Inför bouppteckning - Företag & näringsverksamhet (visas om projektet har markerat "Företag")
  {
    title: 'Äger den avlidne ett aktiebolag?',
    description: 'Aktier i ett bolag är en del av dödsboet och måste identifieras och värderas.',
    moreInfo:
      'Lista alla aktiebolag där den avlidne var aktieägare. Hämta företagsnamn, organisationsnummer och ägarandel - detta kan sökas fram på bolagsverket.se. Aktierna räknas som en tillgång i dödsboet och ska tas upp i bouppteckningen.',
    url: 'https://www.bolagsverket.se',
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Äger den avlidne en enskild firma?',
    description: 'En enskild firma har ingen egen juridisk person - allt ingår direkt i dödsboet.',
    moreInfo:
      'En enskild firma har ingen separat juridisk person, utan ägs direkt av den avlidne. Kontrollera om den avlidne drev egen verksamhet under eget namn eller firmanamn. Gå igenom avtal, bokslut och senaste redovisning tillsammans med ev. revisor.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Äger den avlidne handelsbolag eller kommanditbolag?',
    description: 'Handelsbolag och kommanditbolag är mer komplicerade eftersom dödsboet blir delägare.',
    moreInfo:
      'Kontrollera om den avlidne var bolagsman i ett handelsbolag (HB) eller kommanditbolag (KB). Vid dödsfall blir dödsboet normalt tillfällig delägare, och bolagsavtalet styr vad som händer härnäst - läs det noggrant tillsammans med övriga bolagsmän.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Finns ett aktieägaravtal?',
    description: 'Ett aktieägaravtal kan innehålla inlösenregler som styr vad som händer med aktierna.',
    moreInfo:
      'Hitta ett eventuellt aktieägaravtal. Det kan innehålla inlösenregler som ger de andra aktieägarna rätt att köpa ut dödsboets aktier, eller som tvingar dödsboet att sälja. Detta kan påverka arvet betydligt - läs villkoren noga.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare eller jurist',
    scenario: 'company',
  },
  {
    title: 'Finns en bolagsordning?',
    description: 'Bolagsordningen kan innehålla särskilda regler för vad som händer när en ägare dör.',
    moreInfo:
      'Läs bolagets bolagsordning. Den kan innehålla särskilda regler för vad som händer när en aktieägare avlider, till exempel tvingande försäljning eller övergång av aktier till andra ägare. Bolagsordningen går normalt att hämta hos Bolagsverket.',
    url: 'https://www.bolagsverket.se',
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare eller jurist',
    scenario: 'company',
  },
  {
    title: 'Vilka är co-ägarna eller kompanjonerna?',
    description: 'Övriga ägare måste informeras och kan ha rätt att påverka vad som händer med bolaget.',
    moreInfo:
      'Lista alla övriga ägare av företaget. De ska informeras om dödsfallet så snart som möjligt, och kan enligt avtal ha rätt att köpa ut dödsboets andel eller på annat sätt påverka vad som händer med bolaget framöver.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Värdera företaget - substansvärde eller marknadsvärde?',
    description: 'Ett företag kan vara värt mycket och behöver en korrekt värdering för bouppteckningen.',
    moreInfo:
      'Ett företag ska tas upp till sitt verkliga värde i bouppteckningen. Ni behöver en professionell värdering - kontakta företagets revisor eller en värderingsbyrå. Värderingen kan baseras på substansvärde (tillgångar minus skulder) eller marknadsvärde beroende på verksamhet. Den måste vara klar innan bouppteckningen skickas in till Skatteverket.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '2-4 timmar',
    responsibleRole: 'Revisor eller värderingsman',
    scenario: 'company',
  },
  {
    title: 'Behöver vi hjälp av revisor eller jurist för värderingen?',
    description: 'De flesta företagsvärderingar kräver professionell hjälp för att bli juridiskt hållbara.',
    moreInfo:
      'För de flesta företag krävs en professionell värdering. Kontakta företagets revisor eller en jurist med erfarenhet av företagsvärdering. Det kostar pengar men är nödvändigt för en korrekt bouppteckning och för att undvika framtida tvister om värdet.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Är den avlidne styrelseledamot eller suppleant?',
    description: 'Ett bolag behöver en fungerande styrelse - vakanser måste fyllas snabbt.',
    moreInfo:
      'Om den avlidne var styrelseledamot eller ordförande träder en eventuell suppleant in automatiskt. Finns ingen suppleant måste en ny styrelseledamot utses snarast, annars kan bolaget bli handlingsförlamat. Kontakta övriga styrelsemedlemmar direkt.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Måste vi sälja, likvidera eller överta företaget?',
    description: 'Dödsboet behöver ta ett tydligt beslut om företagets framtid.',
    moreInfo:
      'Dödsboet måste besluta: ska företaget säljas (ofta snabbast), likvideras (avvecklas successivt), eller ska en arvinge ta över driften? Det är ett stort beslut som påverkar både ekonomi och familjens framtid - ta gärna hjälp av revisor eller jurist inför beslutet.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Måste kvarlevande kompanjoner köpa ut dödsboets andel?',
    description: 'Ett aktieägaravtal kan ge eller ålägga övriga ägare att köpa ut dödsboet.',
    moreInfo:
      'Om det finns ett aktieägaravtal kan övriga ägare ha rätt - eller skyldighet - att köpa ut dödsboets aktier. Fråga dem så snart som möjligt vad de önskar göra, och se till att en eventuell utköpsprocess dokumenteras och värderas korrekt.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Är det ett fåmansföretag?',
    description: 'Fåmansföretag kan omfattas av särskilda skatteregler (3:12-reglerna).',
    moreInfo:
      'Om företaget är ett fåmansföretag (få ägare med stort inflytande) kan särskilda skatteregler, de så kallade 3:12-reglerna, gälla. En revisor eller skattejurist kan förklara vad detta innebär och hur mycket skatt som kan bli aktuell.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Revisor eller skattejurist',
    scenario: 'company',
  },

  // Inför bouppteckning - Samägendom & komplicerade äganderätter (visas om projektet har markerat "Samägande")
  {
    title: 'Är någon fastighet eller bostadsrätt samägd?',
    description: 'Samägda fastigheter skapar extra komplikationer vid dödsfall.',
    moreInfo:
      'Kontrollera om den avlidne ägde fastigheten eller bostadsrätten tillsammans med någon annan - sambo, ex-make, barn eller vän. Samägande innebär att flera parter måste vara överens om vad som ska hända med tillgången.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'NOW',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'coOwnership',
  },
  {
    title: 'Med vem är egendomen samägd?',
    description: 'Vem co-ägaren är avgör vilka regler som gäller.',
    moreInfo:
      'Skriv upp exakt namn på co-ägaren/co-ägarna. Det spelar stor roll om det är en sambo (andra regler än gifta), en ex-make, ett barn eller en helt utomstående part - det påverkar vilka rättigheter respektive part har.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'coOwnership',
  },
  {
    title: 'Vilka är ägarandelarnas storlek (50/50, 60/40, etc)?',
    description: 'En felaktig ägarandel kan leda till stora problem längre fram.',
    moreInfo:
      'Ta reda på de exakta ägarandelarna. Kontrollera lagfarten, köpekontraktet eller andra ägarhandlingar. Andelarna avgör hur stor del av tillgången som ingår i dödsboet och hur den ska värderas i bouppteckningen.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'coOwnership',
  },
  {
    title: 'Kan kvarlevande sambo begära bodelning?',
    description: 'Sambor har särskilda rättigheter som kan påverka vad som ingår i arvet.',
    moreInfo:
      'Om den avlidne var sambo (inte gift) och ägde bostaden tillsammans med sambon har den efterlevande sambon rätt att begära bodelning av samboegendomen enligt sambolagen. Det kan påverka vad som faktiskt ingår i dödsboet - rådfråga gärna en jurist.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Efterlevande sambo eller jurist',
    scenario: 'coOwnership',
  },
  {
    title: 'Måste vi anlita en boutredningsman?',
    description: 'Vid oenighet om en samägd fastighet kan en boutredningsman behöva utses.',
    moreInfo:
      'Om dödsbodelägarna inte kan komma överens om vad som ska göras med en samägd fastighet kan dödsboet behöva en boutredningsman som tingsrätten utser. Det är ett dyrt men ibland nödvändigt steg för att lösa en låst situation.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'coOwnership',
  },
  {
    title: 'Kan arvingarna sälja sin andel utan övriga samägares samtycke?',
    description: 'Det går att sälja bara sin andel, men det är svårt och kan skapa konflikter.',
    moreInfo:
      'Om flera personer äger en fastighet kan en av dem försöka sälja bara sin egen andel. Det är juridiskt möjligt men praktiskt svårt - en köpare får då bara en del av en fastighet som redan delvis ägs av andra, vilket kan skapa spänningar mellan parterna.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare eller jurist',
    scenario: 'coOwnership',
  },
  {
    title: 'Behöver vi tingsrättsbeslut för att lösa oenigheten?',
    description: 'Tingsrätten kan tvinga fram en lösning när samägarna inte kommer överens.',
    moreInfo:
      'Om arvingarna eller samägarna inte kan komma överens kan tingsrätten behöva fatta beslut, till exempel om tvångsförsäljning enligt samäganderättslagen. Tingsrätten kan även utse en god man som förvaltar egendomen tills en lösning är på plats.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Jurist',
    scenario: 'coOwnership',
  },

  // Inför bouppteckning - Hyresrätt (visas om projektet har markerat "Hyresrätt")
  {
    title: 'Vilka hyresrätter äger den avlidne?',
    description: 'Alla hyreskontrakt behöver identifieras - en hyresrätt kan ha värde för dödsboet.',
    moreInfo:
      'Lista alla hyreskontrakt där den avlidne var hyresgäst. Hitta kontrakt, hyresbelopp och villkor. En hyresrätt i attraktivt läge kan ha ett visst värde för dödsboet, till exempel om den kan överlåtas.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'rentalProperty',
  },
  {
    title: 'Vilka är hyresförhållandets villkor?',
    description: 'Kontraktets villkor styr vad dödsboet kan och inte kan göra med hyresrätten.',
    moreInfo:
      'Läs hyreskontraktet noggrant. Kontrollera bindningstid, uppsägningstid, möjlighet till andrahandsuthyrning och eventuella specialvillkor. Detta avgör hur snabbt dödsboet kan avveckla eller överlåta hyresrätten.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'rentalProperty',
  },
  {
    title: 'Kan hyresrätten hyras ut i andrahand?',
    description: 'Andrahandsuthyrning kräver oftast hyresvärdens godkännande.',
    moreInfo:
      'Om dödsboet inte vill avsluta hyresrätten direkt kan den hyras ut i andra hand under en period. Många hyresvärdar förbjuder detta eller kräver skriftligt godkännande - kontrollera villkoren i kontraktet innan ni går vidare.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'rentalProperty',
  },
  {
    title: 'Vad är uppsägningstiden för hyresavtalet?',
    description: 'Uppsägningstiden avgör hur snabbt dödsboet slipper hyreskostnaden.',
    moreInfo:
      'Hyresavtal har normalt en uppsägningstid, ofta 1-3 månader. Dödsboet måste säga upp avtalet enligt dessa villkor om ingen ska bo kvar, annars fortsätter hyran att löpa och belasta dödsboets ekonomi.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'rentalProperty',
  },
  {
    title: 'Kan hyresgästen själv överta rätten?',
    description: 'En dödsbodelägare som redan bor i lägenheten kan ofta ta över hyreskontraktet.',
    moreInfo:
      'Om en av dödsbodelägarna vill bo kvar i lägenheten kan de ofta överta hyresrätten i eget namn. Kontakta hyresvärden så snart som möjligt för att ansöka om övertagande - det är ofta den enklaste lösningen för alla parter.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'rentalProperty',
  },

  // Inför bouppteckning - Utlandstillgångar (visas om projektet har markerat "Utlandstillgångar")
  {
    title: 'Äger den avlidne fastigheter utomlands?',
    description: 'Utländska fastigheter skapar extra juridiska och skattemässiga komplikationer.',
    moreInfo:
      'Kontrollera om den avlidne ägde hus, lägenhet eller mark utanför Sverige - till exempel ett sommarhus eller en investeringsfastighet. Utländska fastigheter hanteras ofta enligt det landets egna arvsregler, inte svensk lag.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'foreignAssets',
  },
  {
    title: 'Har den avlidne bankkonton i utländska länder?',
    description: 'Utländska bankkonton måste sökas upp aktivt - de dyker inte upp automatiskt.',
    moreInfo:
      'Fråga om den avlidne hade sparkonton, lönekonton eller investeringar i andra länder, till exempel i ett tidigare hemland. Dessa måste kontaktas direkt av dödsboet med dödsbevis och arvsintyg för att kunna avslutas eller överföras.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'foreignAssets',
  },
  {
    title: 'Äger den avlidne värdepapper eller aktier utomlands?',
    description: 'Utländska värdepapper kan vara svåra att hantera utan lokal hjälp.',
    moreInfo:
      'Kontrollera om den avlidne ägde aktier, obligationer eller andra värdepapper via utländska banker eller mäklare. Dessa kan vara värdefulla men ofta svåra att komma åt utan kontakt med den utländska institutionen och rätt dokumentation.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'foreignAssets',
  },
  {
    title: 'Vilka länder är inblandade?',
    description: 'En tydlig lista på länder gör det enklare att bedöma vilka regler som gäller.',
    moreInfo:
      'Gör en lista på alla länder där den avlidne hade tillgångar. Olika länder har olika regler för dödsbon och arv, och listan behövs för att avgöra vilka avtal och myndigheter som blir aktuella framöver.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'foreignAssets',
  },
  {
    title: 'Behöver vi kontrollera dubbelbeskattningsavtal?',
    description: 'Sveriges avtal med andra länder kan påverka hur arvet beskattas.',
    moreInfo:
      'Om till exempel Spanien eller Danmark är inblandat kan ett dubbelbeskattningsavtal mellan Sverige och det landet påverka hur tillgångarna beskattas och registreras. En jurist eller revisor med internationell erfarenhet kan reda ut vad som gäller.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '1 timme',
    responsibleRole: 'Jurist eller revisor',
    scenario: 'foreignAssets',
  },
  {
    title: 'Måste vi skicka ansökningar till utländska myndigheter?',
    description: 'De flesta länder kräver en egen ansökningsprocess för att arvingarna ska få tillgångarna.',
    moreInfo:
      'De flesta länder kräver särskilda ansökningar innan dödsboet eller arvingarna kan ta över utländska tillgångar, ofta med bestyrkta och översatta kopior av svenska dokument. Detta kan ta betydligt längre tid än den svenska processen - räkna med flera månader.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'foreignAssets',
  },
  {
    title: 'Behöver vi en jurist eller agent i det andra landet?',
    description: 'Lokal juridisk hjälp är ofta nödvändig för att reda ut utlandstillgångar.',
    moreInfo:
      'För de flesta utlandstillgångar krävs lokal juridisk hjälp. En jurist eller agent i det andra landet kan hantera lokala regler, myndighetskontakter och registrering. Det är ofta nödvändigt och medför en extra kostnad, men sparar mycket tid och krångel.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'foreignAssets',
  },

  // Inför bouppteckning - Digitala tillgångar (visas om projektet har markerat "Digitala tillgångar")
  {
    title: 'Inventera alla digitala abonnemang',
    description: 'Bortglömda abonnemang fortsätter kosta pengar tills de sägs upp.',
    moreInfo:
      'Gör en lista på alla digitala tjänster som kostar pengar - Spotify, Netflix, Disney+, Dropbox, molnlagring, LinkedIn Premium, med mera. Många av dessa glöms bort och fortsätter dra pengar från kort eller konto tills de sägs upp aktivt.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'digitalAssets',
  },
  {
    title: 'Webbplatser och domäner - vem ska överta?',
    description: 'Webbplatser och domäner kan ha ekonomiskt eller sentimentalt värde.',
    moreInfo:
      'Om den avlidne ägde webbplatser, bloggar eller domäner måste dödsboet besluta: ska de sparas, säljas eller stängas? Vissa domäner och etablerade webbplatser kan ha ett ekonomiskt värde värt att ta hänsyn till.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'digitalAssets',
  },
  {
    title: 'Onlinebutiker - vilken status?',
    description: 'En webbutik som lämnas obevakad kan orsaka både förlorade intäkter och missnöjda kunder.',
    moreInfo:
      'Om den avlidne drev en webbutik (Amazon, Etsy, eBay eller egen sajt) - se till att allt är pausat och inventerat. Det kan finnas pengar kvar att hämta ut eller varor i lager som behöver säljas eller returneras.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'digitalAssets',
  },
  {
    title: 'Licensierade verk - böcker, musik, mjukvara',
    description: 'Digitala licenser kan sällan överlåtas, men bör noteras för dödsboet.',
    moreInfo:
      'Kontrollera om den avlidne ägde licensierade e-böcker (Kindle), musiksamlingar (Spotify-listor, iTunes) eller mjukvarulicenser. De flesta går inte att överföra till någon annan enligt användarvillkoren, men värdet bör noteras och kontona avslutas eller sägas upp.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'digitalAssets',
  },
  {
    title: 'Spara lösenord säkert för senare överföring',
    description: 'Lösenord som behövs för webbplatser eller digitala tjänster måste hanteras säkert.',
    moreInfo:
      'Om någon ska ta över webbplatser eller digitala tjänster behöver de lösenorden. Överför dem säkert - använd en lösenordshanterare eller ett säkerhetsbrev, aldrig okrypterat via e-post eller SMS.',
    url: null,
    phase: 'Inför bouppteckning',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'digitalAssets',
  },

  // Under bouppteckning
  {
    title: 'Upprätta bouppteckningen',
    description:
      'Boupptecningen är det formella juridiska dokument som listar alla tillgångar och skulder. Det är en måste för arvsfördelning och skattemässig behandling.',
    moreInfo:
      'Du kan: göra det själv (använd Skatteverkets blankett), anlita jurist, eller be boutredningsman. Dokumentet måste innehålla: detaljlista på all egendom med värden, alla skulder, arvskiftet enligt testamente eller lag, arvatas namn och andel. Se noga till att ingenting glöms - detta är juridisk bindande.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'NOW',
    timeEstimate: '4-6 timmar',
    responsibleRole: 'Dödsbodelägare eller jurist/boutredningsman',
  },
  {
    title: 'Värdera alla tillgångar på rätt sätt',
    description:
      'Korrekt värdering av tillgångarna är kritisk för att boupptecningen ska accepteras av Skatteverket och för rättvis arvsfördelning.',
    moreInfo:
      'Fastigheter: låta göra värdering av fastighetsvärderingsman eller anlita mäklare. Fordon: kontakta Transportstyrelsen eller låt försäkringsbolag värdera. Aktier/värdepapper: använd marknadsvärde vid dödsdagen. Lösöre: gör egen realistisk uppskattning. För dyra föremål (konst, smycken): anlita auktor. Använd taxeringsvärden från tidigare år som referens.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'NOW',
    timeEstimate: '2-4 timmar',
    responsibleRole: 'Dödsbodelägare eller värderingsman',
  },
  {
    title: 'Dokumentera arvssituationen enligt testamente eller lag',
    description: 'Arvsfördelningen måste klart dokumenteras i boupptecningen enligt lag eller testamente.',
    moreInfo:
      'Om testamente finns: följ det exakt. Om inget testamente: följ svenska arvslagar (maka/make får ofta större andel, barn delar jämnt, osv). Dokumentera tydligt vem som är arvingar, deras andel av dödsboet, och vad var och en får. Detta är juridiskt bindande.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Lämna in bouppteckning till Skatteverket',
    description:
      'Boupptecningen måste lämnas in till Skatteverket senast 4 månader efter dödsfallet. Det är juridisk deadline.',
    moreInfo:
      'Skicka via: Skatteverkets e-tjänst (e-bouppteckning), eller per post. Bifoga dödsbevis, testamente (om finns), värderingsunderlag, och fullständig lista. Skatteverket granskar och godkänner. Om de har frågor kommer de att kontakta dig. Behåll ett kvitto på inlämning.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'NOW',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Ansök om och betala eventuell arvsskatt',
    description: 'I vissa fall kan arvsskatt tillkomma. Det är viktigt att kontrollera detta och betala i tid.',
    moreInfo:
      'Arvsskatt gäller INTE alla dödsbon - beror på arvingarnas relation till den avlidne och beloppet. Skatteverket skickar ett brev om arvsskatt är aktuellt. Om det är det måste du ansöka och betala inom angiven tid. Kontakta Skatteverket eller jurist för att klargöra om detta gäller dig.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Informera banker och försäkringsbolag om dödsfallet',
    description:
      'Banker och försäkringsbolag behöver formell notis om dödsfallet för att kunna hantera konton och utbetalningar korrekt.',
    moreInfo:
      'Kontakta varje bank och försäkringsbolag separat. Presentera dödsbevis och bouppteckning. Diskutera: hur hanteras befintliga konton? Hur betalas skulder/lån? Vilka försäkringar betalar ut och till vem? Många kan föreslå lösningar som gör processen enklare. Spara all korrespondens.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Betala dödsboets skulder och utgifter',
    description:
      'Alla skulder måste betalas från dödsboets medel före någon arving får något. Det är juridisk regel.',
    moreInfo:
      'Gå igenom skuldelistan: betala bolån, personliga lån, kreditkort, driftskostnader, skatter, begravningsutgifter, juristen, begravningsbyråns faktura, etc. Använd dödsboets bankkonto. Dokumentera alla betalningar. Först när alla skulder är betalda kan arvet distribueras till arvingarnas.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'NOW',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare (ekonomiansvarig)',
  },
  {
    title: 'Ansök om och hantera tillbakabelopp från försäkringar',
    description: 'Försäkringar kan ofta ge tillbakabelopp eller ersättningar som kan ta tid att hantera.',
    moreInfo:
      'Kontakta försäkringsbolag för: livförsäkringar, invaliditetsförsäkringar, olycksfall, sjukförsäkring. Många har särskilda dödsfallförmåner. Presentera dödsbevis. Följ deras procedur för utbetalning. Dessa kan ta veckor att få. Dokumentera allt för bouppteckningen.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Genomför temporära åtgärder för dödsboets tillgångar',
    description:
      'Medan boupptecningen är i process behöver dödsboets tillgångar hanteras försiktigt för att bevara värde.',
    moreInfo:
      'Om det finns huskatt: håll den eller hyr ut. Om det finns fordon: försäkra den eller lagra säkert. Om det finns värdepapper: låt de stå eller låt en bank förvalta. Dokumentera all användning av dödsboets tillgångar - detta måste redovisas senare. Minska kostnader där möjligt (t.ex. värme i tomt hus).',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-3 timmar (löpande)',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Finns pågående rättsliga tvister?',
    description: 'Pågående rättsprocesser övergår till dödsboet och kan innebära både kostnader och intäkter.',
    moreInfo:
      'Kontrollera om den avlidne hade någon pågående rättegång eller domstolsprocess. Dödsboet blir part i dessa processer och kan behöva betala advokatkostnader eller ha rätt att få pengar tillbaka, beroende på hur tvisten slutar.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare eller jurist',
  },
  {
    title: 'Finns miljöansvar för förorenad mark?',
    description: 'Ägande av förorenad mark kan innebära ett ansvar som följer med dödsboet.',
    moreInfo:
      'Om den avlidne ägde mark eller en fastighet som är eller misstänks vara förorenad kan dödsboet ha ett miljöansvar enligt miljöbalken. Kontakta länsstyrelsen för att kontrollera om fastigheten är registrerad som ett potentiellt förorenat område.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'LATER',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Finns arbetsskadeanspråk från tidigare anställda?',
    description: 'Som tidigare arbetsgivare kan den avlidne ha kvarstående ansvar gentemot anställda.',
    moreInfo:
      'Om den avlidne var arbetsgivare kan det finnas väntande arbetsrättsliga ärenden eller skadereglering från nuvarande eller tidigare anställda. Dessa övergår till dödsboet och måste lösas innan bouppteckningen kan slutföras.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare eller jurist',
  },
  {
    title: 'Är företagets värdering klar för Skatteverket?',
    description: 'Värderingen av företaget måste vara färdig och väl dokumenterad innan bouppteckningen skickas in.',
    moreInfo:
      'Se till att den professionella värderingen av företaget är helt klar innan bouppteckningen skickas till Skatteverket. Värderingen ska vara väl dokumenterad så att den håller om Skatteverket ifrågasätter värdet.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'NOW',
    timeEstimate: '1 timme',
    responsibleRole: 'Revisor',
    scenario: 'company',
  },
  {
    title: 'Är fåmansföretag-reglerna tillämpliga (3:12)?',
    description: 'Fåmansföretagsreglerna kan påverka både bouppteckningen och framtida deklaration.',
    moreInfo:
      'Om bolaget är ett fåmansföretag kan de särskilda 3:12-reglerna gälla. Revisor eller skattejurist bör klargöra hur detta påverkar värderingen i bouppteckningen och den framtida deklarationen för arvingarna som tar över aktierna.',
    url: null,
    phase: 'Under bouppteckning',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Revisor eller skattejurist',
    scenario: 'company',
  },

  // Avslut & arvskifte
  {
    title: 'Upprätta arvskifteshandling för flera arvinger',
    description:
      'Om det finns flera arvingar måste arvskifteshandlingen dokumentera exakt hur arvet delas. Alla arvingar måste godkänna denna.',
    moreInfo:
      'Dokumentet måste innehålla: vem som är arvingarna, deras andel av dödsboet, vilka specifika tillgångar var och en får, kvittans från alla parter. Alla arvingar måste underteckna. Om de är oense kring fördelningen kan rättslig vägledning behövas. När alla undertecknat är detta juridiskt bindande.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'NOW',
    timeEstimate: '2-4 timmar',
    responsibleRole: 'Dödsbodelägare eller jurist',
  },
  {
    title: 'Genomför arvskiftet - distribuera tillgångarna',
    description: 'Arvskiftet innebär att tillgångarna faktiskt distribueras till arvingarna enligt arvskifteshandlingen.',
    moreInfo:
      'Processen: överför pengar från dödsboets bankkonto till arvingarnas konton, överför fastigheter (lagfartsbeslut), överför fordon (ägarbyten hos Transportstyrelsen), levererar fysiska föremål. Allt måste dokumenteras. Skapa en checklista över vilka tillgångar som gick till vilka arvingar. Spara allt för redovisning.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'NOW',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare (ofta med juridisk hjälp)',
  },
  {
    title: 'Överför ägarskap av fastigheter formellt',
    description:
      'Fastigheter kan inte överföras utan formell lagfartsbeslut hos Lantmäteriet. Detta är juridiskt tvingande.',
    moreInfo:
      'Kontakta Lantmäteriet med: arvskifteshandling, dödsbevis, gamla ägarhandlingar. Ansök om ny lagfart för den/de arvingar som övertar fastigheten. Det tar några veckor. Du betalar en ansökningsavgift. Denna är nödvändig för framtida försäljning eller refinansiering av fastigheter.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare eller jurist',
  },
  {
    title: 'Överför eller avsluta bankkontonar',
    description: 'Dödsboets bankkonto och den avlidnes personliga konton måste stängas och medel distribueras.',
    moreInfo:
      'Kontakta banken när allt är löst (alla skulder betalda, arv distribuerat). Låt dem avsluta konton. Om det finns återstående medel överför det till rätt arvingers konto. Avsluta alla automatiska överföringar och inbetalningar. Spara slutkontoutdrag för arkivering. Stäng även eventuella sparkontonor eller värdepapperskonton.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Säga upp avtal och avsluta abonnemang',
    description: 'Alla löpande abonnemang och avtal måste sägas upp eller övertas för att undvika onödiga kostnader.',
    moreInfo:
      'Gå igenom lista: telefon, internet, TV, el, vattnet, hemförsäkring, hemåde, hyra, möbelbåst, streaming (Netflix, Spotify, osv), tidningar, förenings medlemskap, gym, etc. Kontakta var och en för uppsägning. Många behöver skriftlig förespråkelse. Spara bekräftelse på uppsägning. Fördela arbetet mellan familjemedlemmar om många att ta hand om.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'SOON',
    timeEstimate: '2-4 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Städa och töm bostaden eller förbered för försäljning',
    description: 'Bostaden måste antingen tömmas helt eller förbereds för försäljning. Det är viktigt praktisk steg.',
    moreInfo:
      'Om den ska säljas: hyra in städfirma, anlita mäklare, gör möjliga reparationer/renoveringar. Om den ska behållas av någon: tömm den från den avlidnes tillhörigheter. Sortera möbler, kläder, böcker - vad ska sparas? Vad kan säljas? Vad ska slängas? Många familjer gör detta tillsammans - det kan vara emotionellt. Ha tid för detta och håller det lugnt.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'SOON',
    timeEstimate: '1-3 dagar',
    responsibleRole: 'Dödsbodelägare eller flera familjemedlemmar',
  },
  {
    title: 'Skicka slutredovisning till Skatteverket',
    description:
      'Slutredovisningen visar att dödsboet är avslutat och alla skyldigheter uppfyllda. Skatteverket behöver detta för att godkänna dödsboet som slutfört.',
    moreInfo:
      'Dokumentera: all inkomst till dödsboet (försäkringsutbetalningar, etc), all utgifter (skulder, begravning, juristen), slutsaldo före arvskifte, arvskifte till varje arvinge. Skicka till Skatteverket när allt är slutfört. De granskar och skickar bekräftelse. Spara denna för dina register.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'NOW',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Arkivera all dokumentation för långsiktig sparning',
    description: 'All dokumentation från dödsboet måste sparas i minst 10 år enligt lag. Det är juridisk krav.',
    moreInfo:
      'Samla: bouppteckning, arvskifteshandling, bankhandlingar, fastighetshandlingar, försäkringdokument, juridiska handlingar, begravningshandlingar, skattehandlingar, lagfarter. Organisera efter typ. Skanna eller spara i duplicerad form (papper + digital). Lagra på säker plats. Se till att familjen vet var detta sparas för framtiden.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '2-3 timmar',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Adressändring för dödsboet (SKV 8403)',
    description:
      'Om dödsboet har en annan adress än vid dödsfallet är det viktigt att göra en adressändring, annars eftersänds inte post från Skatteverket.',
    moreInfo:
      'Om dödsboet har en annan adress än vid dödsfallet är det viktigt att göra en adressändring — annars eftersänds inte deklarationsblanketten, utan Posten skickar tillbaka den till Skatteverket. Detta bör vara klart innan april månad, då deklarationsblanketten för dödsboet normalt skickas ut.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/anmalnyadressfordodsbo.4.3528414214b3f8758056b6.html',
    phase: 'Avslut & arvskifte',
    priority: 'SOON',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Beställ eftersändning av post (12 månader)',
    description: 'Den som har hand om dödsboet kan beställa eftersändning av post i 12 månader.',
    moreInfo:
      'Den som har hand om dödsboet kan beställa eftersändning av post i 12 månader via adressandring.se, så att post som skickas till den avlidnes gamla adress hittar rätt.',
    url: 'https://www.adressandring.se',
    phase: 'Avslut & arvskifte',
    priority: 'SOON',
    timeEstimate: '15 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Spärra reklam till den avlidne (SPAR)',
    description: 'Spärra direktadresserad reklam till den avlidne i SPAR (Statens personadressregister).',
    moreInfo:
      'För att spärra direktadresserad reklam till den avlidne i SPAR, mejla spar@skatteverket.se med den avlidnes namn och personnummer samt en begäran om att spärra reklamutskick.',
    url: 'https://www.spar.se',
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '15 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Genomför avslutande familjesamtal',
    description: 'Ett avslutande möte med familjen kan hjälpa att stänga processen och kontrollera att allt är gjort.',
    moreInfo:
      'Träffa familjen (digitalt eller fysiskt). Gå igenom: är allt löst? Vad är gjort? Vad återstår? Är alla nöjda med arvfördelningen? Vem arkiverar dokumentationen? Vem är att fråga i framtiden om frågor kommer upp? Detta är också en psykologisk avslutning för att familjen kan börja läka från sorgen.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '1-2 timmar',
    responsibleRole: 'Närmaste anhörig',
  },
  {
    title: 'Uppdatera dödsboets status som avslutat',
    description: 'Markera dödsboet som avslutat i DödsboGuiden och eventuellt arkivera det för framtida referens.',
    moreInfo:
      'När allt är löst kan DödsboGuiden-projektet arkiveras. Detta gör att familjen kan se att arbetet är klart och fokusera på att gå vidare. Du kan bibehålla åtkomst för framtida referens eller frågor.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Hur sparas dokumentationen långsiktigt (minst 10 år)?',
    description: 'All dokumentation från dödsboet ska sparas i minst 10 år enligt lag.',
    moreInfo:
      'Efter arvskiftet måste all dokumentation sparas på ett säkert ställe i minst 10 år. Det kan behövas senare för Skatteverkets kontroller eller om en tvist skulle uppstå mellan familjemedlemmar. Överväg digitala säkerhetskopior utöver pappersoriginalen.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Digitala säkerhetskopior av viktiga papper',
    description: 'Digitala kopior gör det lättare att hitta viktiga dokument i framtiden.',
    moreInfo:
      'Skanna och gör digitala kopior av alla viktiga handlingar - testamente, bouppteckning, arvskifteshandling, lagfarter, skuldebrev. Spara dem på en säker plats, till exempel en krypterad molntjänst eller ett USB-minne som förvaras säkert.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Åtkomstskydd för känslig data',
    description: 'Personuppgifter i digitala dödsbo-filer behöver skyddas mot obehörig åtkomst.',
    moreInfo:
      'Lösenordsskydda alla digitala filer som innehåller känslig information, till exempel personnummer, bostadsadress eller kontonummer. I fel händer kan sådana uppgifter användas för identitetsstöld eller bedrägerier.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Var sparas lösenord till digitala konton?',
    description: 'Lösenord som någon arving behöver senare bör sparas på ett säkert, delbart sätt.',
    moreInfo:
      'Om någon arvinge ska ta över digitala konton, webbplatser eller ett företag längre fram behöver de lösenorden. Se till att de är sparade på en säker plats som går att överföra, till exempel en delad lösenordshanterare eller ett förseglat säkerhetsbrev.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Behövde vi tingsrätt eller domstol för något?',
    description: 'Alla domstolsbeslut som förekommit under processen bör arkiveras tillsammans med övrig dokumentation.',
    moreInfo:
      'Om tingsrätten behövde kopplas in för att lösa tvister eller utse en boutredningsman - se till att alla beslut är dokumenterade och arkiverade tillsammans med övrig dödsboedokumentation, för det fall frågor skulle komma upp längre fram.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Dödsbodelägare',
  },
  {
    title: 'Behöver revisorn spara dokumentationen för företaget?',
    description: 'Bokföring och räkenskaper för ett företag ska sparas långsiktigt enligt bokföringslagen.',
    moreInfo:
      'Om dödsboet ägde ett företag måste bokföringen och räkenskapsmaterialet sparas enligt bokföringslagens regler, normalt i minst 7 år. En revisor kan hantera arkiveringen eller ge råd om vad som gäller för just ert bolag.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'LATER',
    timeEstimate: '30 min',
    responsibleRole: 'Revisor',
    scenario: 'company',
  },
  {
    title: 'Löstes alla tvister kring företaget?',
    description: 'Olösta tvister om företaget kan orsaka framtida konflikter mellan arvingarna.',
    moreInfo:
      'Kontrollera att alla tvister om företagets värde, vem som ska ta över det, eller en eventuell försäljning är helt lösta och dokumenterade. Olösta frågor riskerar att blossa upp som konflikter mellan arvingarna långt senare.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'company',
  },
  {
    title: 'Löstes alla tvister kring samägda fastigheter?',
    description: 'Olösta samägandefrågor är en vanlig källa till framtida familjekonflikter.',
    moreInfo:
      'Se till att arvingarna och eventuella co-ägare är överens om vad som ska göras med samägda fastigheter innan dödsboet avslutas. Olösta frågor kan leda till tvister många år senare, ofta efter att detaljerna glömts bort.',
    url: null,
    phase: 'Avslut & arvskifte',
    priority: 'SOON',
    timeEstimate: '1 timme',
    responsibleRole: 'Dödsbodelägare',
    scenario: 'coOwnership',
  },
];
