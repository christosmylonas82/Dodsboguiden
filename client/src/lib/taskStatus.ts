import type { TaskStatus } from './types';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Väntande',
  IN_PROGRESS: 'Pågår',
  DONE: 'Klart',
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];
