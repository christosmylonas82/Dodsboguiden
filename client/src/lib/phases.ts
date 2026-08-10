import type { Task } from './types';
import type { BadgeTone } from '../components/Badge';

export const PHASES: Task['phase'][] = ['Förberedelser', 'Förrättningen', 'Efter förrättningen'];

export function phaseStatus(tasks: Task[]): { label: string; tone: BadgeTone } {
  const done = tasks.filter((t) => t.completed).length;
  if (done === 0) return { label: 'Ej påbörjad', tone: 'neutral' };
  if (done === tasks.length) return { label: 'Klar', tone: 'success' };
  return { label: 'Pågår', tone: 'warning' };
}
