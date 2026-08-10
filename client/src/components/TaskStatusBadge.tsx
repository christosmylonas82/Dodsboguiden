import { TbClock, TbCircleFilled, TbCheck } from 'react-icons/tb';
import type { TaskStatus } from '../lib/types';
import { TASK_STATUS_LABELS } from '../lib/taskStatus';

export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  PENDING: 'bg-amber-400 text-gray-900 border-amber-400',
  IN_PROGRESS: 'bg-amber-500 text-white border-amber-600',
  DONE: 'bg-success text-white border-success',
};

export const TASK_STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  PENDING: <TbClock size={15} />,
  IN_PROGRESS: <TbCircleFilled size={11} />,
  DONE: <TbCheck size={16} strokeWidth={3} />,
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-medium ${TASK_STATUS_BADGE_CLASSES[status]}`}
    >
      {TASK_STATUS_ICONS[status]}
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
