import type { TaskStatus } from './types';
import type { BadgeTone } from '../components/Badge';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Väntar',
  IN_PROGRESS: 'Pågår',
  DONE: 'Klar',
};

export const TASK_STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'warning',
  DONE: 'success',
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];
