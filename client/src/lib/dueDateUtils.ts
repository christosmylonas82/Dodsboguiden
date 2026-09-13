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

const MONTH_NAMES = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

/** Human-friendly deadline text ("15 september · 2 dagar kvar") — purely a display format, doesn't change due-date status logic. */
export function formatDueDateHuman(dueDate: string): string {
  const date = new Date(dueDate);
  const days = daysUntilDue(dueDate);
  const base = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
  if (days < 0) return `${base} · Försenad`;
  if (days === 0) return `${base} · I dag`;
  if (days === 1) return `${base} · I morgon`;
  if (days <= 3) return `${base} · ${days} dagar kvar`;
  return base;
}
