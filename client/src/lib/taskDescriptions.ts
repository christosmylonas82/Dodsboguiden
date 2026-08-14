import type { Task } from './types';

export const PHASE_DESCRIPTIONS: Record<Task['phase'], string> = {
  'Direkt efter dödsfall': 'De första praktiska stegen: informera familjen, säkra hemmet och komma i kontakt med rätt instanser.',
  'Begravning & ceremoni': 'Planera och genomföra begravningen, från önskemål och praktiska arrangemang till efterarbete.',
  'Inför bouppteckning': 'Samla dokument, inventera tillgångar och skulder, och förbered allt som behövs för bouppteckningen.',
  'Under bouppteckning': 'Upprätta och lämna in bouppteckningen, värdera tillgångar och betala dödsboets skulder.',
  'Avslut & arvskifte': 'Fördela arvet, avsluta konton och avtal, och knyta ihop dödsboet formellt.',
};

// Fallback descriptions for tasks created before the `description` column existed
// (older projects whose tasks predate this field, keyed by their fixed title).
export const TASK_DESCRIPTIONS: Record<string, string> = {
  'Samla dokument (bouppteckning, testamente, försäkringar)':
    'Leta fram testamente, försäkringsbrev och andra papper som visar vad som ingår i dödsboet.',
  'Utred vilka som är arvingar':
    'Ta reda på vilka som enligt lag eller testamente ärver den avlidne. En släktutredning kan behövas.',
  'Utse en bouppgivare':
    'Bouppgivaren känner boet bäst och lämnar uppgifterna vid bouppteckningen, ofta make/maka eller ett barn.',
  'Utse två förrättningsmän':
    'Förrättningsmännen intygar att bouppteckningen är korrekt. De får inte vara arvingar eller testamentstagare.',
  'Boka tid för bouppteckningsmöte':
    'Bestäm en tid då bouppgivaren och förrättningsmännen kan träffas för att gå igenom boet tillsammans.',
  'Gå igenom tillgångar och skulder':
    'Lista allt som fanns på dödsdagen: bankmedel, fastigheter, skulder och lös egendom.',
  'Underteckna bouppteckningen':
    'Bouppgivaren och båda förrättningsmännen skriver under handlingen som sammanfattar boets värde.',
  'Skicka bouppteckningen till Skatteverket':
    'Bouppteckningen ska skickas in inom en månad efter att den upprättats, senast fyra månader efter dödsfallet.',
  'Vänta på godkännande från Skatteverket':
    'Skatteverket registrerar bouppteckningen. Det kan ta några veckor innan ni får besked.',
};
