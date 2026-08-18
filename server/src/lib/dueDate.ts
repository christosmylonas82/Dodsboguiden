// Only tasks with a legally fixed deadline that the app's own checklist
// content already states get an auto-calculated due date. Inventing precise
// day-counts for the rest would assert deadlines nobody has verified.
export const TASK_DAY_OFFSETS: Record<string, number> = {
  'Lämna in boupptecning till Skatteverket': 120, // GDPR: Bouppteckning ska lämnas in senast 4 månader efter dödsfallet
};

export function calculateDueDate(deceasedDate: Date, daysAfter: number): Date {
  const dueDate = new Date(deceasedDate);
  dueDate.setDate(dueDate.getDate() + daysAfter);
  return dueDate;
}

export type DueDateStatus = 'overdue' | 'due_soon' | 'on_time' | 'no_date';

export function getDueDateStatus(dueDate: Date | null): DueDateStatus {
  if (!dueDate) return 'no_date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue < 7) return 'due_soon';
  return 'on_time';
}
