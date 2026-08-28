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
  if (counted.length > 0 && done === counted.length) return { label: 'Klar', tone: 'success' };
  const started = counted.some((t) => t.completed || t.status === 'IN_PROGRESS');
  if (!started) return { label: 'Ej påbörjad', tone: 'neutral' };
  return { label: 'Pågår', tone: 'warning' };
}
