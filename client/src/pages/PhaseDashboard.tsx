import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft, TbPencil, TbExternalLink } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { ProjectDetail, Task, TaskStatus } from '../lib/types';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/ProgressBar';
import { TaskManageModal } from '../components/TaskManageModal';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { formatTimestamp } from '../lib/activity';
import { PHASE_DESCRIPTIONS, TASK_DESCRIPTIONS } from '../lib/taskDescriptions';
import { phaseStatus } from '../lib/phases';
import { DUE_DATE_LABEL, DUE_DATE_TEXT_CLASS, daysUntilDue } from '../lib/dueDateUtils';

const STATUS_BORDER_CLASS: Record<TaskStatus, string> = {
  PENDING: 'border-l-border',
  IN_PROGRESS: 'border-l-warning',
  DONE: 'border-l-success',
};

export function PhaseDashboardPage({ phase }: { phase: Task['phase'] }) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [managingTaskId, setManagingTaskId] = useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  function toggleExpanded(taskId: string) {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  async function reload() {
    if (!id) return;
    const p = await apiFetch<ProjectDetail>(`/projects/${id}`);
    setProject(p);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const memberNameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    project?.members.forEach((m) => {
      if (m.userId && m.user) map.set(m.userId, m.user.name);
    });
    return map;
  }, [project]);

  async function toggleTask(task: Task) {
    if (!id) return;
    await apiFetch(`/projects/${id}/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !task.completed }),
    });
    reload();
  }

  async function saveTask(
    task: Task,
    updates: { status: TaskStatus; assignedTo: string | null; notes: string | null; dueDate: string | null },
  ) {
    if (!id) return;
    await apiFetch(`/projects/${id}/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    reload();
  }

  if (!project) return <p className="text-muted">Laddar…</p>;

  const tasks = project.tasks.filter((t) => t.phase === phase);
  const status = phaseStatus(tasks);
  const doneCount = tasks.filter((t) => t.completed).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const managingTask = tasks.find((t) => t.id === managingTaskId) ?? null;

  return (
    <div>
      <Link to={`/projects/${id}/dashboard`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-dark">
        <TbArrowLeft size={16} />
        Tillbaka till översikt
      </Link>
      <p className="mt-3 text-xs text-muted">Dashboard &gt; {phase}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-semibold text-text">{phase}</h1>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span className="text-sm text-muted">
          {doneCount} av {tasks.length} klara
        </span>
      </div>
      <p className="mt-1 text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
      <a
        href="https://www.efterlevandeguiden.se/checklista-efter-ett-dodsfall.html"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 text-xs text-muted hover:text-primary-dark hover:underline"
      >
        📖 Checklista baserad på Efterlevandeguiden
        <TbExternalLink size={12} />
      </a>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={percent} />
        </div>
        <span className="text-sm font-medium text-text">{percent}%</span>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="divide-y divide-border">
          {tasks.map((task) => {
            const completedByName = task.completedBy ? memberNameByUserId.get(task.completedBy) : null;
            const isDone = task.status === 'DONE';
            const description = task.description ?? TASK_DESCRIPTIONS[task.title];
            return (
              <div
                key={task.id}
                role={isDone ? undefined : 'button'}
                tabIndex={isDone ? undefined : 0}
                onClick={isDone ? undefined : () => setManagingTaskId(task.id)}
                onKeyDown={
                  isDone
                    ? undefined
                    : (e) => {
                        if (e.key === 'Enter' || e.key === ' ') setManagingTaskId(task.id);
                      }
                }
                className={`border-l-4 py-3 pr-2 pl-3 transition-colors duration-150 first:pt-0 ${STATUS_BORDER_CLASS[task.status]} ${
                  isDone ? '' : 'cursor-pointer hover:bg-black/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex min-w-0 flex-1 items-center gap-3 ${isDone ? 'opacity-60' : ''}`}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                    />
                    <span className={isDone ? 'text-muted' : 'text-text'}>{task.title}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className={isDone ? 'opacity-60' : ''}>
                      <TaskStatusBadge status={task.status} />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManagingTaskId(task.id);
                      }}
                      aria-label="Redigera uppgift"
                      title="Redigera"
                      className="rounded-lg bg-transparent p-1.5 text-muted transition hover:bg-primary-light hover:text-primary-dark"
                    >
                      <TbPencil size={18} />
                    </button>
                  </div>
                </div>
                <div className={`pl-8 ${isDone ? 'opacity-60' : ''}`}>
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                  {task.url && (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-block text-sm text-blue-600 hover:underline"
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
                          toggleExpanded(task.id);
                        }}
                        className="mt-1 block bg-transparent p-0 text-sm text-blue-600 hover:underline"
                      >
                        {expandedTaskIds.has(task.id) ? 'Dölj' : 'Läs mer'}
                      </button>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`grid transition-[grid-template-rows] duration-[250ms] ease-in-out ${
                          expandedTaskIds.has(task.id) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="mt-2 rounded-lg bg-bg p-3 text-sm text-muted">{task.moreInfo}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {task.assignedUser && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Avatar
                        name={task.assignedUser.name}
                        imageUrl={task.assignedUser.profileImageUrl}
                        userId={task.assignedUser.id}
                        size="sm"
                      />
                      <span className="text-xs text-muted">Tilldelad {task.assignedUser.name}</span>
                    </div>
                  )}
                  {!isDone && task.dueDate && (
                    <p className={`mt-1 text-xs font-medium ${DUE_DATE_TEXT_CLASS[task.dueDateStatus ?? 'no_date']}`}>
                      Deadline: {new Date(task.dueDate).toLocaleDateString('sv-SE')}
                      {task.dueDateStatus && task.dueDateStatus !== 'no_date' && task.dueDateStatus !== 'on_time' && (
                        <> ({DUE_DATE_LABEL[task.dueDateStatus]}, {Math.abs(daysUntilDue(task.dueDate))} dagar)</>
                      )}
                    </p>
                  )}
                  {task.notes && <p className="mt-1 text-xs whitespace-pre-wrap text-muted">📝 {task.notes}</p>}
                  {isDone && completedByName && task.completedAt && (
                    <p className="mt-0.5 text-xs text-muted">
                      Slutförd av {completedByName} den {formatTimestamp(task.completedAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {managingTask && (
        <TaskManageModal
          task={managingTask}
          members={project.members}
          onClose={() => setManagingTaskId(null)}
          onSave={(updates) => saveTask(managingTask, updates)}
        />
      )}
    </div>
  );
}
