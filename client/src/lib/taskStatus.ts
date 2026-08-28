import type { Task, TaskStatus } from './types';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Ej påbörjad',
  IN_PROGRESS: 'Pågår',
  DONE: 'Klart',
  SKIPPED: 'Kommer ej att genomföras',
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'SKIPPED'];

/** Tasks marked SKIPPED are excluded from progress totals entirely (not just from the "done" count). */
export function tasksForProgress(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== 'SKIPPED');
}
