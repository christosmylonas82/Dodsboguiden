import { TbPencil, TbTrash } from 'react-icons/tb';
import type { Task } from '../lib/types';
import { Avatar } from './Avatar';
import { TaskStatusBadge } from './TaskStatusBadge';
import { getIconForTask } from '../lib/taskCardHelpers';
import { DUE_DATE_LABEL, DUE_DATE_TEXT_CLASS, daysUntilDue } from '../lib/dueDateUtils';
import { formatTimestamp } from '../lib/activity';

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
  const Icon = getIconForTask(task.title);

  return (
    <div
      role={isSettled ? undefined : 'button'}
      tabIndex={isSettled ? undefined : 0}
      onClick={isSettled ? undefined : onManage}
      onKeyDown={
        isSettled
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') onManage();
            }
      }
      className={`rounded-2xl border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 ${
        isSettled ? 'opacity-60' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggleComplete}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
        />
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={`text-lg font-semibold text-text ${isSkipped ? 'line-through' : ''}`}>{task.title}</h3>
            <div className="flex shrink-0 items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onManage();
                }}
                aria-label="Redigera uppgift"
                title="Redigera"
                className="rounded-lg bg-transparent p-1.5 text-muted transition hover:bg-primary-light hover:text-primary-dark"
              >
                <TbPencil size={18} />
              </button>
              {task.isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  aria-label="Ta bort uppgift"
                  title="Ta bort"
                  className="rounded-lg bg-transparent p-1.5 text-muted transition hover:bg-danger-light hover:text-danger"
                >
                  <TbTrash size={18} />
                </button>
              )}
            </div>
          </div>

          {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}

          {(task.assignedUser || (!isSettled && task.dueDate)) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {task.assignedUser && (
                <div className="flex items-center gap-2">
                  <Avatar
                    name={task.assignedUser.name}
                    imageUrl={task.assignedUser.profileImageUrl}
                    userId={task.assignedUser.id}
                    size="sm"
                  />
                  <span className="text-[13px] text-muted">{task.assignedUser.name}</span>
                </div>
              )}
              {!isSettled && task.dueDate && (
                <p className={`text-[13px] font-medium ${DUE_DATE_TEXT_CLASS[task.dueDateStatus ?? 'no_date']}`}>
                  ⏰ {new Date(task.dueDate).toLocaleDateString('sv-SE')}
                  {task.dueDateStatus && task.dueDateStatus !== 'no_date' && task.dueDateStatus !== 'on_time' && (
                    <> ({DUE_DATE_LABEL[task.dueDateStatus]}, {Math.abs(daysUntilDue(task.dueDate))} dagar)</>
                  )}
                </p>
              )}
            </div>
          )}

          {task.url && (
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 inline-block text-sm text-link hover:underline"
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
                className="mt-3 block bg-transparent p-0 text-sm text-link hover:underline"
              >
                {expanded ? 'Dölj' : 'Läs mer'}
              </button>
              <div
                onClick={(e) => e.stopPropagation()}
                className={`grid transition-[grid-template-rows] duration-[250ms] ease-in-out ${
                  expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-2 rounded-lg bg-bg p-3 text-sm text-muted">{task.moreInfo}</div>
                </div>
              </div>
            </>
          )}

          {task.notes && <p className="mt-3 text-xs whitespace-pre-wrap text-muted">📝 {task.notes}</p>}

          {isDone && completedByName && task.completedAt && (
            <p className="mt-2 text-xs text-muted">
              Slutförd av {completedByName} den {formatTimestamp(task.completedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
