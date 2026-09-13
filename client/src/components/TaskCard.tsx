import { TbTrash } from 'react-icons/tb';
import type { Task, TaskStatus } from '../lib/types';
import { Avatar } from './Avatar';
import { TASK_STATUS_LABELS } from '../lib/taskStatus';
import { DUE_DATE_TEXT_CLASS, formatDueDateHuman } from '../lib/dueDateUtils';
import { formatTimestamp } from '../lib/activity';

const STATUS_SYMBOL: Record<TaskStatus, string> = {
  PENDING: '○',
  IN_PROGRESS: '●',
  DONE: '✓',
  SKIPPED: '—',
};

const STATUS_TEXT_CLASS: Record<TaskStatus, string> = {
  PENDING: 'text-muted',
  IN_PROGRESS: 'text-primary-dark',
  DONE: 'text-success',
  SKIPPED: 'text-muted',
};

export function TaskCard({
  task,
  description,
  completedByName,
  expanded,
  onToggleExpanded,
  onToggleComplete,
  onManage,
  onDelete,
}: {
  task: Task;
  description: string | null;
  completedByName: string | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleComplete: () => void;
  onManage: () => void;
  onDelete: () => void;
}) {
  const isDone = task.status === 'DONE';
  const isSkipped = task.status === 'SKIPPED';
  const isSettled = isDone || isSkipped;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onManage}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onManage();
      }}
      className={`flex cursor-pointer flex-col gap-1.5 border-b border-border px-1 py-3 transition hover:bg-primary-light focus:outline-none focus-visible:bg-primary-light last:border-0 ${
        isSettled ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggleComplete}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
        />
        <div className="min-w-0 flex-1">
          <h3 className={`text-[15px] leading-snug font-semibold text-text ${isSkipped ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          {description && (
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted">{description}</p>
          )}
        </div>
        {task.isCustom && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Ta bort uppgift"
            title="Ta bort"
            className="shrink-0 rounded-lg bg-transparent p-1.5 text-muted transition hover:bg-danger-light hover:text-danger"
          >
            <TbTrash size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-8 text-xs">
        {task.assignedUser && (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Avatar
              name={task.assignedUser.name}
              imageUrl={task.assignedUser.profileImageUrl ?? task.assignedUser.profilePicture}
              userId={task.assignedUser.id}
              size="sm"
            />
            {task.assignedUser.name}
          </span>
        )}
        {!isSettled && task.dueDate && (
          <span className={`font-medium ${DUE_DATE_TEXT_CLASS[task.dueDateStatus ?? 'no_date']}`}>
            {formatDueDateHuman(task.dueDate)}
          </span>
        )}
        <span className={`font-medium tracking-wide uppercase ${STATUS_TEXT_CLASS[task.status]}`}>
          {STATUS_SYMBOL[task.status]} {TASK_STATUS_LABELS[task.status]}
        </span>
      </div>

      {task.url && (
        <a
          href={task.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="pl-8 text-xs text-link hover:underline"
        >
          Läs mer hos Skatteverket
        </a>
      )}

      {task.moreInfo && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded();
            }}
            className="block bg-transparent p-0 pl-8 text-left text-xs text-link hover:underline"
          >
            {expanded ? 'Dölj' : 'Läs mer'}
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`grid pl-8 transition-[grid-template-rows] duration-[250ms] ease-in-out ${
              expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="mt-1 rounded-lg bg-bg p-3 text-xs text-muted">{task.moreInfo}</div>
            </div>
          </div>
        </>
      )}

      {task.notes && <p className="pl-8 text-xs whitespace-pre-wrap text-muted">📝 {task.notes}</p>}

      {isDone && completedByName && task.completedAt && (
        <p className="pl-8 text-xs text-muted">
          Slutförd av {completedByName} den {formatTimestamp(task.completedAt)}
        </p>
      )}
    </div>
  );
}
