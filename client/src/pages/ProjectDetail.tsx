import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TbProgress, TbUsers, TbBell, TbUserPlus } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { ActivityEntry, ProjectDetail, Task, TaskStatus } from '../lib/types';
import { Badge, type BadgeTone } from '../components/Badge';
import { MetricCard } from '../components/MetricCard';
import { Avatar } from '../components/Avatar';
import { TaskManageModal } from '../components/TaskManageModal';
import { InviteModal } from '../components/InviteModal';
import { formatActivityAction, formatRelativeTime, formatTimestamp } from '../lib/activity';
import { TASK_STATUS_LABELS, TASK_STATUS_TONES } from '../lib/taskStatus';

const PHASES: Task['phase'][] = ['Förberedelser', 'Förrättningen', 'Efter förrättningen'];

const STATUS_BORDER_CLASS: Record<TaskStatus, string> = {
  PENDING: 'border-l-border',
  IN_PROGRESS: 'border-l-warning',
  DONE: 'border-l-success',
};

function phaseStatus(tasks: Task[]): { label: string; tone: BadgeTone } {
  const done = tasks.filter((t) => t.completed).length;
  if (done === 0) return { label: 'Ej påbörjad', tone: 'neutral' };
  if (done === tasks.length) return { label: 'Klar', tone: 'success' };
  return { label: 'Pågår', tone: 'warning' };
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [managingTaskId, setManagingTaskId] = useState<string | null>(null);

  async function reload() {
    if (!id) return;
    const [p, a] = await Promise.all([
      apiFetch<ProjectDetail>(`/projects/${id}`),
      apiFetch<ActivityEntry[]>(`/projects/${id}/activity`),
    ]);
    setProject(p);
    setActivity(a);
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

  async function saveTask(task: Task, updates: { status: TaskStatus; assignedTo: string | null }) {
    if (!id) return;
    await apiFetch(`/projects/${id}/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    reload();
  }

  async function inviteMember(email: string) {
    if (!id) return;
    try {
      await apiFetch(`/projects/${id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      reload();
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : 'Kunde inte bjuda in');
    }
  }

  if (!project) return <p className="text-muted">Laddar…</p>;

  const progress = project.tasks.length
    ? Math.round((project.tasks.filter((t) => t.completed).length / project.tasks.length) * 100)
    : 0;
  const lastActivity = activity[0];
  const managingTask = project.tasks.find((t) => t.id === managingTaskId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-text">{project.deceasedName}</h1>
            <p className="mt-1 text-muted">Dödsboets checklista och aktivitet</p>
          </div>
          <Badge tone={progress === 100 ? 'success' : progress === 0 ? 'neutral' : 'warning'}>
            {progress === 100 ? 'Klar' : progress === 0 ? 'Ej påbörjad' : 'Pågår'}
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-primary-dark sm:w-auto"
        >
          <TbUserPlus size={20} />
          Bjud in familjemedlem
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<TbProgress size={20} />}
          label="Framsteg"
          value={`${progress}%`}
          hint={`${project.tasks.filter((t) => t.completed).length} av ${project.tasks.length} klara`}
        />
        <MetricCard
          icon={<TbUsers size={20} />}
          label="Familjemedlemmar"
          value={project.members.length}
          hint={project.members.length === 1 ? '1 medlem' : `${project.members.length} medlemmar`}
        />
        <MetricCard
          icon={<TbBell size={20} />}
          label="Senaste aktivitet"
          value={lastActivity ? formatRelativeTime(lastActivity.timestamp) : '—'}
          hint={lastActivity ? `${lastActivity.user.name} ${formatActivityAction(lastActivity.action)}` : 'Ingen aktivitet än'}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Checklista</h2>
        {PHASES.map((phase) => {
          const tasks = project.tasks.filter((t) => t.phase === phase);
          if (tasks.length === 0) return null;
          const status = phaseStatus(tasks);
          return (
            <div className="mt-6 first:mt-4" key={phase}>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{phase}</h3>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <div className="mt-2 divide-y divide-border">
                {tasks.map((task) => {
                  const completedByName = task.completedBy ? memberNameByUserId.get(task.completedBy) : null;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 border-l-4 py-3 pl-3 first:pt-0 ${STATUS_BORDER_CLASS[task.status]}`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setManagingTaskId(task.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setManagingTaskId(task.id);
                        }}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={task.completed ? 'text-muted line-through' : 'text-text'}>
                            {task.title}
                          </span>
                          <Badge tone={TASK_STATUS_TONES[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                        </div>
                        {task.assignedUser && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Avatar name={task.assignedUser.name} size="sm" />
                            <span className="text-xs text-muted">Tilldelad {task.assignedUser.name}</span>
                          </div>
                        )}
                        {task.completed && completedByName && task.completedAt && (
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
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Medlemmar</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar name={m.user?.name ?? m.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text">{m.user?.name ?? m.email}</p>
                {!m.userId && <p className="text-xs text-muted">Inbjuden, väntar på registrering</p>}
              </div>
              <Badge tone={m.role === 'ADMIN' ? 'success' : 'neutral'}>
                {m.role === 'ADMIN' ? 'Admin' : 'Medlem'}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Aktivitetslogg</h2>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Ingen aktivitet än.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {activity.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm text-text">
                    <span className="font-medium">{entry.user.name}</span>{' '}
                    {formatActivityAction(entry.action)}
                  </p>
                  <p className="text-xs text-muted">{formatTimestamp(entry.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {managingTask && (
        <TaskManageModal
          task={managingTask}
          members={project.members}
          onClose={() => setManagingTaskId(null)}
          onSave={(updates) => saveTask(managingTask, updates)}
        />
      )}

      {inviteModalOpen && (
        <InviteModal onClose={() => setInviteModalOpen(false)} onInvite={inviteMember} />
      )}
    </div>
  );
}
