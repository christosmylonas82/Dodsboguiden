export interface RegistryContact {
  name: string;
  phone: string | null;
  contactHint: string;
  description: string;
  template?: string;
  website?: string;
}

export interface RegistryCategory {
  category: string;
  contacts: RegistryContact[];
}

// Phone numbers verified against each organization's own published contact
// pages (Aug 2026) — not carried over from unverified assumptions, since a
// wrong number here wastes a grieving person's time for no reason.
export const CONTACT_REGISTRY: RegistryCategory[] = [
  {
    category: 'Myndigheter',
    contacts: [
      {
        name: 'Skatteverket (Skatteupplysningen)',
        phone: '0771-567 567',
        contactHint: '0771-567 567',
        description: 'Dödsfallsintyg med släktutredning, bouppteckning, adressändring för dödsbo',
        template: 'Hej, jag behöver ett dödsfallsintyg med släktutredning för [den avlidnes namn], personnummer [personnummer], avliden [datum]. Kan ni skicka detta till mig som dödsbodelägare?',
      },
      {
        name: 'Försäkringskassan',
        phone: '0771-524 524',
        contactHint: '0771-524 524',
        description: 'Sjukpenning, bostadsbidrag och andra ersättningar som ska avslutas',
        template: 'Hej, jag informerar om att [namn], personnummer [personnummer], har avlidit [datum]. Jag vill säkerställa att era register är uppdaterade.',
      },
      {
        name: 'Pensionsmyndigheten',
        phone: '0771-776 776',
        contactHint: '0771-776 776',
        description: 'Allmän pension, efterlevandepension',
        template: 'Hej, jag informerar om dödsfall för [namn], personnummer [personnummer]. Kan ni berätta vad som gäller för eventuell efterlevandepension?',
      },
      {
        name: 'Kronofogden',
        phone: '0771-73 73 00',
        contactHint: '0771-73 73 00',
        description: 'Skulder och betalningsförelägganden i dödsboet',
        template: 'Hej, jag informerar om dödsfall för [namn], personnummer [personnummer]. Kan ni uppge om det finns registrerade skulder hos er?',
      },
      {
        name: 'Svensk Adressändring',
        phone: null,
        contactHint: 'adressandring.se',
        description: 'Eftersändning av dödsboets post till ny adress (12 månader)',
        template: 'Anmälan om eftersändning för dödsboet efter [namn], personnummer [personnummer], till adressen [ny adress].',
        website: 'adressandring.se',
      },
      {
        name: 'SPAR (Statens personadressregister)',
        phone: null,
        contactHint: 'spar@skatteverket.se',
        description: 'Spärra direktadresserad reklam till den avlidne',
        template: 'Namn: [den avlidnes namn]\nPersonnummer: [personnummer]\n\nJag vill spärra direktadresserad reklam för ovanstående person.',
        website: 'spar.se',
      },
      {
        name: 'Lantmäteriet',
        phone: null,
        contactHint: 'lantmateriet.se',
        description: 'Lagfart för dödsboets fastigheter',
        website: 'lantmateriet.se',
      },
      {
        name: 'Transportstyrelsen',
        phone: null,
        contactHint: 'transportstyrelsen.se',
        description: 'Ägarbyte av fordon från dödsbo',
        website: 'transportstyrelsen.se',
      },
    ],
  },
  {
    category: 'Telekommunikation & Internet',
    contacts: [
      {
        name: 'Telia',
        phone: '90 200',
        contactHint: '90 200',
        description: 'Mobilabonnemang, bredband, tv',
        template: 'Hej, jag behöver avsluta abonnemanget för [namn], personnummer [personnummer], som avled [datum]. Jag är dödsbodelägare.',
      },
      {
        name: 'Telenor',
        phone: '020-222 222',
        contactHint: '020-222 222',
        description: 'Mobilabonnemang, bredband, tv',
        template: 'Hej, jag behöver avsluta abonnemanget för [namn], personnummer [personnummer], som avled [datum]. Jag är dödsbodelägare.',
      },
      {
        name: 'Tre (3)',
        phone: '0735-300 400',
        contactHint: '0735-300 400 (eller "300" från ett Tre-abonnemang)',
        description: 'Mobilabonnemang och bredband',
        template: 'Hej, jag behöver avsluta abonnemanget för [namn], personnummer [personnummer], som avled [datum]. Jag är dödsbodelägare.',
      },
      {
        name: 'Tele2 (tidigare Comhem)',
        phone: '90 222',
        contactHint: '90 222',
        description: 'Tv, bredband och telefoni — Comhem gick samman med Tele2 2018',
        template: 'Hej, jag behöver avsluta abonnemanget för [namn], personnummer [personnummer], som avled [datum]. Jag är dödsbodelägare.',
      },
    ],
  },
  {
    category: 'Bank, försäkring & boende',
    contacts: [
      {
        name: 'Din bank',
        phone: null,
        contactHint: 'Se bankkort eller internetbanken',
        description: 'Konton, kort och eventuella lån knutna till den avlidne',
        template: 'Hej, jag informerar om dödsfall för [namn], personnummer [personnummer], och vill diskutera hur dödsboets konton hanteras.',
      },
      {
        name: 'Försäkringsbolag',
        phone: null,
        contactHint: 'Se försäkringsbrev',
        description: 'Liv-, hem- och andra försäkringar den avlidne hade',
        template: 'Hej, jag informerar om dödsfall för [namn], personnummer [personnummer]. Försäkringsnummer (om känt): [nummer]. Vad krävs för att gå vidare?',
      },
      {
        name: 'Elleverantör',
        phone: null,
        contactHint: 'Se senaste elräkning',
        description: 'Elabonnemang för den avlidnes bostad',
        template: 'Hej, jag behöver avsluta eller föra över elabonnemanget för fastigheten [adress] efter [namn], personnummer [personnummer], avliden [datum].',
      },
      {
        name: 'Hyresvärd / bostadsrättsförening',
        phone: null,
        contactHint: 'Se hyresavi eller kontakta föreningen',
        description: 'Hyreskontrakt eller bostadsrätt som behöver avslutas eller överlåtas',
        template: 'Hej, jag informerar om dödsfall för [namn], personnummer [personnummer], boende på [adress]. Hur går vi vidare med kontraktet?',
      },
    ],
  },
  {
    category: 'Begravning & arbete',
    contacts: [
      {
        name: 'Begravningsbyrå',
        phone: null,
        contactHint: 'Sök lokalt eller fråga sjukhuset/vårdcentralen',
        description: 'Hjälp med begravning, kremation och minnesstund',
        template: 'Hej, jag behöver boka en konsultation gällande begravning för [namn], avliden [datum]. Har ni möjlighet att träffas den här veckan?',
      },
      {
        name: 'Arbetsgivare',
        phone: null,
        contactHint: 'Se anställningsavtal',
        description: 'Slutlön, ej uttagen semester, tjänstepension och gruppförsäkring',
        template: 'Hej, jag informerar om att [namn], personnummer [personnummer], har avlidit [datum]. Kan ni hjälpa till med vad som gäller för lön, semester och eventuella försäkringar?',
      },
    ],
  },
  {
    category: 'Sorgestöd',
    contacts: [
      {
        name: 'Vi som mist någon mitt i livet (VIMIL)',
        phone: null,
        contactHint: 'vimil.se',
        description: 'Nätverk för de som mist någon mitt i livet',
        website: 'vimil.se',
      },
      {
        name: 'SPES (Stöd för efterlevande vid suicid)',
        phone: null,
        contactHint: 'spes.se',
        description: 'Stöd när någon nära tagit sitt liv',
        website: 'spes.se',
      },
      {
        name: 'Hope (Att leva vidare)',
        phone: null,
        contactHint: 'hopeattlevavidare.se',
        description: 'Efterlevandestöd vid självmord',
        website: 'hopeattlevavidare.se',
      },
      {
        name: 'Vi som förlorat barn (VSFB)',
        phone: null,
        contactHint: 'vsfb.se',
        description: 'Stöd för föräldrar i sorg',
        website: 'vsfb.se',
      },
      {
        name: 'Randiga huset',
        phone: null,
        contactHint: 'randigahuset.se',
        description: 'Stöd för barnfamiljer i sorg',
        website: 'randigahuset.se',
      },
      {
        name: 'BRIS (vuxentelefon om barn)',
        phone: null,
        contactHint: 'bris.se',
        description: 'Stöd för vuxna om barn som förlorat någon',
        website: 'bris.se',
      },
      {
        name: '1177 Vårdguiden',
        phone: null,
        contactHint: '1177.se',
        description: 'Information om sorg och sorgearbete',
        website: '1177.se',
      },
    ],
  },
  {
    category: 'Arkiv för dödsönskemål',
    contacts: [
      {
        name: 'Vita arkivet',
        phone: null,
        contactHint: 'vitaarkivet.se',
        description: 'Arkiv för dödsönskemål',
        website: 'vitaarkivet.se',
      },
      {
        name: 'Livsarkivet',
        phone: null,
        contactHint: 'livsarkivet.se',
        description: 'Arkiv för att bevara minnen',
        website: 'livsarkivet.se',
      },
      {
        name: 'Begravningsarkivet (Fenix Begravning)',
        phone: null,
        contactHint: 'fenixbegravning.se',
        description: 'Begravningsarkiv',
        website: 'fenixbegravning.se',
      },
      {
        name: 'Lavendla-arkivet',
        phone: null,
        contactHint: 'lavendla.se',
        description: 'Arkiv för dödsönskemål',
        website: 'lavendla.se',
      },
    ],
  },
  {
    category: 'Försäkring & konsument',
    contacts: [
      {
        name: 'Konsumenternas',
        phone: null,
        contactHint: 'konsumenternas.se',
        description: 'Vägledning om livförsäkringar i dödsbo',
        website: 'konsumenternas.se',
      },
      {
        name: 'Konsumentverket',
        phone: null,
        contactHint: 'konsumentverket.se',
        description: 'Information om försäkringar och privatekonomi',
        website: 'konsumentverket.se',
      },
    ],
  },
];
