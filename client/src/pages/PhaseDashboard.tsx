import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft, TbPencil, TbExternalLink, TbChevronDown, TbMailboxOff, TbPlus, TbTrash } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { ProjectDetail, Task, TaskStatus, PostManagementTask } from '../lib/types';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/ProgressBar';
import { TaskManageModal } from '../components/TaskManageModal';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { PostManagementModal } from '../components/PostManagementModal';
import { formatTimestamp } from '../lib/activity';
import { PHASE_DESCRIPTIONS, TASK_DESCRIPTIONS } from '../lib/taskDescriptions';
import { phaseStatus } from '../lib/phases';
import { tasksForProgress } from '../lib/taskStatus';
import { DUE_DATE_LABEL, DUE_DATE_TEXT_CLASS, daysUntilDue } from '../lib/dueDateUtils';

function PostManagementSection({ projectId }: { projectId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState<PostManagementTask[]>([]);

  useEffect(() => {
    apiFetch<PostManagementTask[]>(`/projects/${projectId}/post-management`).then(setTasks);
  }, [projectId]);

  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl bg-transparent p-6 text-left"
      >
        <span className="flex items-center gap-2">
          <TbMailboxOff size={20} className="text-primary-dark" />
          <span className="text-base font-semibold text-text">Post- & adresshantering</span>
          <span className="text-sm text-muted">({doneCount} av {tasks.length || 3} steg klara)</span>
        </span>
        <TbChevronDown size={20} className={`shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="border-t border-border px-6 pb-6">
          <PostManagementModal projectId={projectId} variant="inline" />
        </div>
      )}
    </div>
  );
}

const STATUS_BORDER_CLASS: Record<TaskStatus, string> = {
  PENDING: 'border-l-border',
  IN_PROGRESS: 'border-l-warning',
  DONE: 'border-l-success',
  SKIPPED: 'border-l-muted',
};

export function PhaseDashboardPage({ phase }: { phase: Task['phase'] }) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [managingTaskId, setManagingTaskId] = useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

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

  async function addCustomTask(e: FormEvent) {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!id || !title) return;
    setAddingTask(true);
    try {
      await apiFetch(`/projects/${id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, phase }),
      });
      setNewTaskTitle('');
      await reload();
    } finally {
      setAddingTask(false);
    }
  }

  async function deleteCustomTask(task: Task) {
    if (!id) return;
    await apiFetch(`/projects/${id}/tasks/${task.id}`, { method: 'DELETE' });
    reload();
  }

  if (!project) return <p className="text-muted">Laddar…</p>;

  const tasks = project.tasks.filter((t) => t.phase === phase);
  const status = phaseStatus(tasks);
  const countedTasks = tasksForProgress(tasks);
  const doneCount = countedTasks.filter((t) => t.completed).length;
  const percent = countedTasks.length ? Math.round((doneCount / countedTasks.length) * 100) : 0;
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
          {doneCount} av {countedTasks.length} klara
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

      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="divide-y divide-border">
          {tasks.map((task) => {
            const completedByName = task.completedBy ? memberNameByUserId.get(task.completedBy) : null;
            const isDone = task.status === 'DONE';
            const isSkipped = task.status === 'SKIPPED';
            const isSettled = isDone || isSkipped;
            const description = task.description ?? TASK_DESCRIPTIONS[task.title];
            return (
              <div
                key={task.id}
                role={isSettled ? undefined : 'button'}
                tabIndex={isSettled ? undefined : 0}
                onClick={isSettled ? undefined : () => setManagingTaskId(task.id)}
                onKeyDown={
                  isSettled
                    ? undefined
                    : (e) => {
                        if (e.key === 'Enter' || e.key === ' ') setManagingTaskId(task.id);
                      }
                }
                className={`border-l-4 py-3 pr-2 pl-3 transition-colors duration-150 first:pt-0 ${STATUS_BORDER_CLASS[task.status]} ${
                  isSettled ? '' : 'cursor-pointer hover:bg-black/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex min-w-0 flex-1 items-center gap-3 ${isSettled ? 'opacity-60' : ''}`}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                    />
                    <span className={`${isSettled ? 'text-muted' : 'text-text'} ${isSkipped ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className={isSettled ? 'opacity-60' : ''}>
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
                    {task.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomTask(task);
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
                <div className={`pl-8 ${isSettled ? 'opacity-60' : ''}`}>
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                  {task.url && (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-block text-sm text-link hover:underline"
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
                        className="mt-1 block bg-transparent p-0 text-sm text-link hover:underline"
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
                  {!isSettled && task.dueDate && (
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

        <form onSubmit={addCustomTask} className={`flex items-center gap-2 ${tasks.length > 0 ? 'mt-4 border-t border-border pt-4' : ''}`}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Lägg till egen uppgift…"
            className="flex-1 h-11 rounded-lg border border-border bg-surface px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingTask || !newTaskTitle.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            <TbPlus size={16} />
            Lägg till
          </button>
        </form>
      </div>

      {phase === 'Avslut & arvskifte' && id && <PostManagementSection projectId={id} />}

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
