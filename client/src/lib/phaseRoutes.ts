import type { Task } from './types';

export const PHASE_ROUTE_SLUG: Record<Task['phase'], string> = {
  'Direkt efter dödsfall': 'direkt-efter-dodsfall',
  'Begravning & ceremoni': 'begravning-ceremoni',
  'Inför bouppteckning': 'infor-bouppteckning',
  'Under bouppteckning': 'under-bouppteckning',
  'Avslut & arvskifte': 'avslut-arvskifte',
};
