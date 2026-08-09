export interface ChecklistTemplateItem {
  title: string;
  description: string;
  url: string;
  phase: 'Förberedelser' | 'Förrättningen' | 'Efter förrättningen';
}

// Based on the Skatteverket / Efterlevandeguiden bouppteckning process.
export const DEFAULT_CHECKLIST: ChecklistTemplateItem[] = [
  // Förberedelser
  {
    title: 'Beställ dödsfallsintyg med släktutredning',
    description: 'Beställs hos Skatteverket och visar vilka som är dödsbodelägare.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/dodsfallsintygmedslaktutredning.4.233f91f71260075abe8800017118.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Skaffa fullmakter från dödsbodelägare',
    description: 'Alla delägare behöver godkänna vem som företräder dödsboet.',
    url: 'https://www.skatteverket.se/privat/skatter/ombudforenprivatperson/varaombudforenprivatpersonellerettdodsbo.4.5a85666214dbad743ff11444.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Kontakta bank och spärra kort',
    description: 'Frys autogiron som inte längre behövs.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/begravning.4.3528414214b3f875805c66.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Sammanställ tillgångar per dödsdagen',
    description: 'Kontoutdrag, fonder, fastighet, bil, lösöre.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/fastighetenellerbostadsratten.4.3528414214b3f875805ce2.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Sammanställ skulder och räkningar',
    description: 'Lån, obetalda fakturor, begravningskostnader.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/aktierochuppskovmedvinst.4.3528414214b3f8758051c18.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Ta reda på om testamente finns',
    description: 'Kolla bankfack, hemmet och hos begravningsbyrån.',
    url: 'https://www4.skatteverket.se/rattsligvagledning/edition/2025.2/329132.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Kontrollera äktenskapsförord',
    description: 'Påverkar hur giftorättsgodset fördelas.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Utse bouppgivare',
    description: 'Den som känner boet bäst lämnar uppgifterna.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Utse två förrättningsmän',
    description: 'Får inte vara dödsbodelägare.',
    url: 'https://www4.skatteverket.se/rattsligvagledning/edition/2025.3/378355.html',
    phase: 'Förberedelser',
  },
  {
    title: 'Kalla samtliga dödsbodelägare',
    description: 'Kallelsen ska skickas i god tid före förrättningen.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/anmalnyadressfordodsbo.4.3528414214b3f8758056b6.html',
    phase: 'Förberedelser',
  },

  // Förrättningen
  {
    title: 'Boka datum och plats för förrättningen',
    description: 'Inom tre månader från dödsfallet.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Gå igenom tillgångar och skulder',
    description: 'Värdering sker per dödsdagen.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Värdera fastighet och lösöre',
    description: 'Marknadsvärde, gärna med underlag.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/fastighetenellerbostadsratten.4.3528414214b3f875805ce2.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Anteckna eventuellt testamente och förord',
    description: 'Bifogas som bilaga till bouppteckningen.',
    url: 'https://www4.skatteverket.se/rattsligvagledning/edition/2025.2/329132.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Notera närvarande och frånvarande',
    description: 'Kallelsebevis behövs för de som inte deltar.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Upprätta bouppteckningshandlingen',
    description: 'Sammanställ allt i Skatteverkets blankett.',
    url: 'https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/bouppteckning.4.18e1b10334ebe8bc8000842.html',
    phase: 'Förrättningen',
  },
  {
    title: 'Underskrifter av bouppgivare och förrättningsmän',
    description: 'Kontrollera att alla fält är ifyllda.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Förrättningen',
  },

  // Efter förrättningen
  {
    title: 'Skicka in bouppteckningen till Skatteverket',
    description: 'Inom en månad efter förrättningen.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Invänta registrering',
    description: 'Handläggningstiden varierar.',
    url: 'https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/bouppteckning.4.18e1b10334ebe8bc8000842.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Avsluta konton och abonnemang',
    description: 'El, telefoni, försäkringar, streaming.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/avslutadodsboet.4.5a85666214dbad743ffecae.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Deklarera för dödsboet',
    description: 'Sista deklarationen för den avlidna.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/deklareradodsbo.4.3528414214b3f87580566e.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Genomför arvskifte',
    description: 'Fördela tillgångarna mellan delägarna.',
    url: 'https://www4.skatteverket.se/rattsligvagledning/edition/2014.4/322288.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Töm och överlämna bostaden',
    description: 'Planera gärna en helg tillsammans.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/avslutadodsboet.4.5a85666214dbad743ffecae.html',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Avregistrera dödsboet',
    description: 'När allt är fördelat och skiftat.',
    url: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/avslutadodsboet.4.5a85666214dbad743ffecae.html',
    phase: 'Efter förrättningen',
  },
];
