import { TbClock, TbLoader2, TbCheck } from 'react-icons/tb';
import type { TaskStatus } from '../lib/types';
import { TASK_STATUS_LABELS } from '../lib/taskStatus';

const STATUS_CLASSES: Record<TaskStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700 border-amber-400',
  IN_PROGRESS: 'bg-amber-500 text-white border-amber-600',
  DONE: 'bg-success text-white border-success',
};

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  PENDING: <TbClock size={15} />,
  IN_PROGRESS: <TbLoader2 size={15} className="animate-spin" />,
  DONE: <TbCheck size={16} strokeWidth={3} />,
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_ICONS[status]}
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
