export interface ChecklistTemplateItem {
  title: string;
  phase: 'Förberedelser' | 'Förrättningen' | 'Efter förrättningen';
}

// Based on the Skatteverket / Efterlevandeguiden bouppteckning process.
export const DEFAULT_CHECKLIST: ChecklistTemplateItem[] = [
  { title: 'Samla dokument (bouppteckning, testamente, försäkringar)', phase: 'Förberedelser' },
  { title: 'Utred vilka som är arvingar', phase: 'Förberedelser' },
  { title: 'Utse en bouppgivare', phase: 'Förberedelser' },
  { title: 'Utse två förrättningsmän', phase: 'Förberedelser' },
  { title: 'Boka tid för bouppteckningsmöte', phase: 'Förrättningen' },
  { title: 'Gå igenom tillgångar och skulder', phase: 'Förrättningen' },
  { title: 'Underteckna bouppteckningen', phase: 'Förrättningen' },
  { title: 'Skicka bouppteckningen till Skatteverket', phase: 'Efter förrättningen' },
  { title: 'Vänta på godkännande från Skatteverket', phase: 'Efter förrättningen' },
];
