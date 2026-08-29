export type ChecklistPhase =
  | 'Direkt efter dödsfall'
  | 'Begravning & ceremoni'
  | 'Inför bouppteckning'
  | 'Under bouppteckning'
  | 'Avslut & arvskifte';

export type ChecklistPriority = 'NOW' | 'SOON' | 'LATER';

export interface ChecklistTemplateItem {
  title: string;
  description: string;
  moreInfo: string;
  url: string | null;
  phase: ChecklistPhase;
  priority: ChecklistPriority;
  timeEstimate: string;
  responsibleRole: string;
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
    title: 'Lämna in boupptecning till Skatteverket',
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
];
