export const DEADLINE_REMINDER_MILESTONES = [90, 60, 30] as const;

export function daysUntilDeadline(deceasedDate: string): number {
  const deadline = new Date(deceasedDate);
  deadline.setMonth(deadline.getMonth() + 4);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
