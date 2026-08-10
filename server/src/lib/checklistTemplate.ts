export interface ChecklistTemplateItem {
  title: string;
  description: string;
  moreInfo: string;
  url: string;
  phase: 'Förberedelser' | 'Förrättningen' | 'Efter förrättningen';
}

// Based on the Skatteverket / Efterlevandeguiden bouppteckning process.
export const DEFAULT_CHECKLIST: ChecklistTemplateItem[] = [
  // Förberedelser
  {
    title: 'Beställ dödsfallsintyg med släktutredning',
    description: 'Beställs hos Skatteverket och visar vilka som är dödsbodelägare.',
    moreInfo:
      'Du beställer detta hos Skatteupplysningen (0771-567 567) eller via begravningsbyrå. Det visar vilka som är dödsbodelägare och behövs för att komma åt bankkonton. Handläggningstiden är ca 1-2 veckor.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/dodsfallsintygmedslaktutredning.4.233f91f71260075abe8800017118.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Skaffa fullmakter från dödsbodelägare',
    description: 'Alla delägare behöver godkänna vem som företräder dödsboet.',
    moreInfo:
      'En fullmakt behövs om en person ska representera dödsboet när det finns flera dödsbodelägare. Alla dödsbodelägare måste underteckna. Efterlevandeguiden har en mall du kan ladda ner.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Kontakta bank och spärra kort',
    description: 'Frys autogiron som inte längre behövs.',
    moreInfo:
      'Ring banken och berätta om dödsfallet. Bankerna är redan informerade men du kan behöva spärra kort och autogiro. Du behöver dödsfallsintyget för detta. Begravnings- och probatekostnader kan betalas direkt från dödsboets konto.',
    url: 'https://www.efterlevandeguiden.se/att-borja-med-nar-en-narstaende-dor/skota-ett-dodsbo.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Sammanställ tillgångar per dödsdagen',
    description: 'Kontoutdrag, fonder, fastighet, bil, lösöre.',
    moreInfo:
      'Samla kontoutdrag, fondbesked, aktiecertifikat, fastighetsdeklaration, bilägardokument och värdehandlingar. Värderingen ska ske per dödsdagen. Alla tillgångar måste ingå i bouppteckningen.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Sammanställ skulder och räkningar',
    description: 'Lån, obetalda fakturor, begravningskostnader.',
    moreInfo:
      'Samla information om lån, obetalda räkningar, försäkringar och begravningskostnader. Kontrollera bankutdrag för återkommande betalningar och abonnemang. Dödsboet måste betala alla skulder före fördelning av arv.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Ta reda på om testamente finns',
    description: 'Kolla bankfack, hemmet och hos begravningsbyrån.',
    moreInfo:
      'Sök i bankfack (kontakta banken), hemmet, väska med dokument och begravningsbyrån. Testamentet är viktigt för arvsfördelningen och måste bifogas bouppteckningen. Om du hittar ett ska du kontakta domstolen.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/arv.4.3528414214b3f875805caf.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Kontrollera äktenskapsförord',
    description: 'Påverkar hur giftorättsgodset fördelas.',
    moreInfo:
      'Om det finns ett äktenskapsförord påverkar det hur giftorättsgodset fördelas. Det måste vara registrerat hos domstolen. Om det finns ska det bifogas bouppteckningen som bilaga.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/arv.4.3528414214b3f875805caf.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Utse bouppgivare',
    description: 'Den som känner boet bäst lämnar uppgifterna.',
    moreInfo:
      'Bouppgivaren är den person som bäst känner till dödsboets egendom och ska lämna uppgifterna vid förrättningen. Det kan vara t.ex. efterlevande make, barn eller någon annan dödsbodelägare. Bouppgivaren måste underteckna bouppteckningen.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Utse två förrättningsmän',
    description: 'Får inte vara dödsbodelägare.',
    moreInfo:
      'Förrättningsmännen är två utomstående personer som inte är dödsbodelägare eller arvingar. De intygar att allt är rätt antecknat och värderat. Minst en måste närvara vid förrättningen, båda måste underteckna.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Kalla samtliga dödsbodelägare',
    description: 'Kallelsen ska skickas i god tid före förrättningen.',
    moreInfo:
      'Kallelsen ska skickas i god tid före förrättningen. Du behöver kallelsebevis för de som inte deltar. Kallelsen måste innehålla tidpunkt, plats och instruktioner om vad som ska förbereds. Spara kopior av alla kallelser.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förberedelser',
  },

  // Förrättningen
  {
    title: 'Boka datum och plats för förrättningen',
    description: 'Inom tre månader från dödsfallet.',
    moreInfo:
      'Förrättningen måste genomföras inom 3 månader från dödsfallet. Välj en plats där alla kan träffas (hemmet, advokat, begravningsbyrå). Skicka ut kallelse med datum, plats och vad som ska förbereds.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Gå igenom tillgångar och skulder',
    description: 'Värdering sker per dödsdagen.',
    moreInfo:
      'Vid förrättningen går ni igenom allt tillsammans - kontokort, försäkringsbelopp, fastigheter, bilar, möbler etc. Värderingen sker per dödsdagen. Förrättningsmännen och bouppgivaren fyller i bouppteckningen under mötet.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Värdera fastighet och lösöre',
    description: 'Marknadsvärde, gärna med underlag.',
    moreInfo:
      'Fastigheten värderas enligt marknadsvärde - ofta behöver du få en värdering från fastighetsmäklare eller taxering från länsstyrelsen. Lösöre värderas efter sitt marknadsvärde. Spara alla värderingsunderlag för eventuella framtida frågor.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/fastighetenellerbostadsratten.4.3528414214b3f875805ce2.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Anteckna eventuellt testamente och förord',
    description: 'Bifogas som bilaga till bouppteckningen.',
    moreInfo:
      'Om det finns testamente eller äktenskapsförord ska det antecknas i bouppteckningen och bifogas som bilaga. Det måste finnas i original eller bestyrkt kopia. Det påverkar hur arvet fördelas mellan arvingarna.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/arv.4.3528414214b3f875805caf.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Notera närvarande och frånvarande',
    description: 'Kallelsebevis behövs för de som inte deltar.',
    moreInfo:
      'Anteckna vilka dödsbodelägare som är närvarande och vilka som är frånvarande vid förrättningen. För frånvarande behövs kallelsebevis som visar att de fått information. Anteckningarna är viktiga för att sen registrera bouppteckningen.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Upprätta bouppteckningshandlingen',
    description: 'Sammanställ allt i Skatteverkets blankett.',
    moreInfo:
      'Förrättningsmännen tillsammans med bouppgivaren fyller i Skatteverkets blankett (SKV 4600). Alla uppgifter om tillgångar, skulder, testamente och arvinger måste vara med. Blanketten får man från Skatteverket eller kan laddas ner från deras webbplats.',
    url: 'https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/bouppteckning.4.18e1b10334ebe8bc8000842.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Underskrifter av bouppgivare och förrättningsmän',
    description: 'Kontrollera att alla fält är ifyllda.',
    moreInfo:
      'Bouppteckningen måste undertecknas av bouppgivaren och båda förrättningsmännen. Alla får underteckna i original. Kontrollera att alla fält är ifyllda innan undertecknandet. De blanketterade underskrifterna är juridiskt bindande.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/bouppteckning-steg-for-steg.html',
    phase: 'Förrättningen',
  },

  // Efter förrättningen
  {
    title: 'Skicka in bouppteckningen till Skatteverket',
    description: 'Inom en månad efter förrättningen.',
    moreInfo:
      'Skicka bouppteckningen tillsammans med kopia av testamente (om det finns), äktenskapsförord, och kallelsebevis. Adress: Skatteverket, Bouppteckningssektionen, 871 87 Härnösand. Skicka inom en månad efter förrättningen. Spara motsvarande.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Invänta registrering',
    description: 'Handläggningstiden varierar.',
    moreInfo:
      'Skatteverket hanterar cirka 12-13 veckor handläggningstid. Du får ett referensnummer när ärendet inkommit. Kontakta Skatteupplysningen (0771-567 567) om det tar längre tid. Registreringen är juridisk bindande godkännande.',
    url: 'https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/bouppteckning.4.18e1b10334ebe8bc8000842.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Avsluta konton och abonnemang',
    description: 'El, telefoni, försäkringar, streaming.',
    moreInfo:
      'Avsluta el-, gas-, telefonabonnemang, försäkringar, streamingsystem etc. Ring och berätta om dödsfallet. De flesta behöver ett dödsfallsintyg. Avsluta också postboxar, bankväxling och andra tjänster. Spara alla bekräftelser på avslutade avtal.',
    url: 'https://www.efterlevandeguiden.se/att-borja-med-nar-en-narstaende-dor/avsluta-abonnemang.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Deklarera för dödsboet',
    description: 'Sista deklarationen för den avlidna.',
    moreInfo:
      'Gör en sista deklaration för den avlidna för året då dödsfallet inträffade. Det är dödsboet som ansvarar för denna deklaration. Skatteverket skickar blanketten. Deklarationen måste lämnas in senast på vårens deklarationsfrist året efter dödsfallet.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/deklareradodsbo.4.3528414214b3f87580566e.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Genomför arvskifte',
    description: 'Fördela tillgångarna mellan delägarna.',
    moreInfo:
      'Gör ett arvskiftesdokument som visar vem som får vad. Alla arvingar måste underteckna detta. Det är bevis på hur tillgångarna fördelas. Utan arvskiftesdokument kan arvingarna inte ändra äganderätten för fastigheter, bilar etc. senare.',
    url: 'https://www.efterlevandeguiden.se/manaderna-efter-ett-dodsfall/arvskifte---dela-upp-arv.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Töm och överlämna bostaden',
    description: 'Planera gärna en helg tillsammans.',
    moreInfo:
      'Töm hemmet på möbler, kläder, egendom etc. Många familjer gör detta tillsammans en helg. Donera eller sälja saker som arvingarna inte vill ha. Lämna nycklar tillbaka till hyresvärd eller fastighetsmäklare om det är hyresrätt.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/avslutadodsboet.4.5a85666214dbad743ffecae.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Avregistrera dödsboet',
    description: 'När allt är fördelat och skiftat.',
    moreInfo:
      'Anmäl till Skatteverket att dödsboet är avslutat när allt är fördelat och skiftat. Dödsboet upphör juridiskt när avregistreringen är klar. Du gör detta genom att fylla i ett avslutningsformulär från Skatteverket.',
    url: 'https://www.efterlevandeguiden.se/foljande-ar-avsluta-dodsboet.html',
    phase: 'Efter förrättningen',
  },
];
