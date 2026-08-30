export const DEADLINE_REMINDER_MILESTONES = [90, 60, 30] as const;

export function deadlineDate(deceasedDate: string): Date {
  const deadline = new Date(deceasedDate);
  deadline.setMonth(deadline.getMonth() + 4);
  deadline.setHours(0, 0, 0, 0);
  return deadline;
}

export function daysUntilDeadline(deceasedDate: string): number {
  const deadline = deadlineDate(deceasedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDeadlineDate(deceasedDate: string): string {
  return deadlineDate(deceasedDate).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
