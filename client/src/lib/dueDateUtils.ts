import type { DueDateStatus } from './types';

export const DUE_DATE_TEXT_CLASS: Record<DueDateStatus, string> = {
  overdue: 'text-danger',
  due_soon: 'text-warning',
  on_time: 'text-success',
  no_date: 'text-muted',
};

export const DUE_DATE_LABEL: Record<DueDateStatus, string> = {
  overdue: 'Förfallen',
  due_soon: 'Snart',
  on_time: 'OK',
  no_date: '',
};

export function getDueDateStatus(dueDate: string): DueDateStatus {
  const days = daysUntilDue(dueDate);
  if (days < 0) return 'overdue';
  if (days < 7) return 'due_soon';
  return 'on_time';
}

export function daysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
