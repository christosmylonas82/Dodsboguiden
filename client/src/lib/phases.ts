import type { Task } from './types';
import type { BadgeTone } from '../components/Badge';
import { tasksForProgress } from './taskStatus';

export const PHASES: Task['phase'][] = [
  'Direkt efter dödsfall',
  'Begravning & ceremoni',
  'Inför bouppteckning',
  'Under bouppteckning',
  'Avslut & arvskifte',
];

export function phaseStatus(tasks: Task[]): { label: string; tone: BadgeTone } {
  const counted = tasksForProgress(tasks);
  const done = counted.filter((t) => t.completed).length;
  if (done === counted.length) return { label: 'Klar', tone: 'success' };
  if (done === 0) return { label: 'Ej påbörjad', tone: 'neutral' };
  return { label: 'Pågår', tone: 'warning' };
}
