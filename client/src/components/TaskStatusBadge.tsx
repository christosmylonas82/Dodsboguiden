import { TbClock, TbCircleFilled, TbCheck, TbBan } from 'react-icons/tb';
import type { TaskStatus } from '../lib/types';
import { TASK_STATUS_LABELS } from '../lib/taskStatus';

export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  // Border is a distinctly darker shade than the fill (never matching it) so the
  // badge keeps a crisp edge regardless of what background it's sitting on —
  // without that contrast, a hover/background change nearby can make the badge
  // read as "faded" via simultaneous-contrast, even though its own color never changes.
  PENDING: 'bg-amber-400 text-gray-900 border-amber-600 shadow-sm',
  IN_PROGRESS: 'bg-primary text-white border-primary-dark shadow-sm',
  DONE: 'bg-success text-white border-success-dark shadow-sm',
  SKIPPED: 'bg-muted text-white border-text shadow-sm',
};

export const TASK_STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  PENDING: <TbClock size={15} />,
  IN_PROGRESS: <TbCircleFilled size={11} />,
  DONE: <TbCheck size={16} strokeWidth={3} />,
  SKIPPED: <TbBan size={15} />,
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TASK_STATUS_BADGE_CLASSES[status]}`}
    >
      {TASK_STATUS_ICONS[status]}
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
