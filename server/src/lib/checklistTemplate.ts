export interface ChecklistTemplateItem {
  title: string;
  description: string;
  phase: 'Förberedelser' | 'Förrättningen' | 'Efter förrättningen';
}

// Based on the Skatteverket / Efterlevandeguiden bouppteckning process.
export const DEFAULT_CHECKLIST: ChecklistTemplateItem[] = [
  // Förberedelser
  {
    title: 'Beställ dödsfallsintyg med släktutredning',
    description: 'Beställs hos Skatteverket och visar vilka som är dödsbodelägare.',
    phase: 'Förberedelser',
  },
  {
    title: 'Skaffa fullmakter från dödsbodelägare',
    description: 'Alla delägare behöver godkänna vem som företräder dödsboet.',
    phase: 'Förberedelser',
  },
  {
    title: 'Kontakta bank och spärra kort',
    description: 'Frys autogiron som inte längre behövs.',
    phase: 'Förberedelser',
  },
  {
    title: 'Sammanställ tillgångar per dödsdagen',
    description: 'Kontoutdrag, fonder, fastighet, bil, lösöre.',
    phase: 'Förberedelser',
  },
  {
    title: 'Sammanställ skulder och räkningar',
    description: 'Lån, obetalda fakturor, begravningskostnader.',
    phase: 'Förberedelser',
  },
  {
    title: 'Ta reda på om testamente finns',
    description: 'Kolla bankfack, hemmet och hos begravningsbyrån.',
    phase: 'Förberedelser',
  },
  {
    title: 'Kontrollera äktenskapsförord',
    description: 'Påverkar hur giftorättsgodset fördelas.',
    phase: 'Förberedelser',
  },
  {
    title: 'Utse bouppgivare',
    description: 'Den som känner boet bäst lämnar uppgifterna.',
    phase: 'Förberedelser',
  },
  {
    title: 'Utse två förrättningsmän',
    description: 'Får inte vara dödsbodelägare.',
    phase: 'Förberedelser',
  },
  {
    title: 'Kalla samtliga dödsbodelägare',
    description: 'Kallelsen ska skickas i god tid före förrättningen.',
    phase: 'Förberedelser',
  },

  // Förrättningen
  {
    title: 'Boka datum och plats för förrättningen',
    description: 'Inom tre månader från dödsfallet.',
    phase: 'Förrättningen',
  },
  {
    title: 'Gå igenom tillgångar och skulder',
    description: 'Värdering sker per dödsdagen.',
    phase: 'Förrättningen',
  },
  {
    title: 'Värdera fastighet och lösöre',
    description: 'Marknadsvärde, gärna med underlag.',
    phase: 'Förrättningen',
  },
  {
    title: 'Anteckna eventuellt testamente och förord',
    description: 'Bifogas som bilaga till bouppteckningen.',
    phase: 'Förrättningen',
  },
  {
    title: 'Notera närvarande och frånvarande',
    description: 'Kallelsebevis behövs för de som inte deltar.',
    phase: 'Förrättningen',
  },
  {
    title: 'Upprätta bouppteckningshandlingen',
    description: 'Sammanställ allt i Skatteverkets blankett.',
    phase: 'Förrättningen',
  },
  {
    title: 'Underskrifter av bouppgivare och förrättningsmän',
    description: 'Kontrollera att alla fält är ifyllda.',
    phase: 'Förrättningen',
  },

  // Efter förrättningen
  {
    title: 'Skicka in bouppteckningen till Skatteverket',
    description: 'Inom en månad efter förrättningen.',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Invänta registrering',
    description: 'Handläggningstiden varierar.',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Avsluta konton och abonnemang',
    description: 'El, telefoni, försäkringar, streaming.',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Deklarera för dödsboet',
    description: 'Sista deklarationen för den avlidna.',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Genomför arvskifte',
    description: 'Fördela tillgångarna mellan delägarna.',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Töm och överlämna bostaden',
    description: 'Planera gärna en helg tillsammans.',
    phase: 'Efter förrättningen',
  },
  {
    title: 'Avregistrera dödsboet',
    description: 'När allt är fördelat och skiftat.',
    phase: 'Efter förrättningen',
  },
];
