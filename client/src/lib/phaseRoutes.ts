import type { Task } from './types';

export const PHASE_ROUTE_SLUG: Record<Task['phase'], string> = {
  Förberedelser: 'foreberedelser',
  Förrättningen: 'forrattningen',
  'Efter förrättningen': 'efter-forrattningen',
};
