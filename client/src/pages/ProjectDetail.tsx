import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import type { ActivityEntry, ProjectDetail, Task } from '../lib/types';
import { Badge, type BadgeTone } from '../components/Badge';
import { MetricCard } from '../components/MetricCard';
import { formatActivityAction, formatRelativeTime, formatTimestamp } from '../lib/activity';

const PHASES: Task['phase'][] = ['Förberedelser', 'Förrättningen', 'Efter förrättningen'];

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
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

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

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setInviteError(null);
    setInviteSubmitting(true);
    try {
      await apiFetch(`/projects/${id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail }),
      });
      setInviteEmail('');
      reload();
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : 'Kunde inte bjuda in');
    } finally {
      setInviteSubmitting(false);
    }
  }

  if (!project) return <p className="text-muted">Laddar…</p>;

  const progress = project.tasks.length
    ? Math.round((project.tasks.filter((t) => t.completed).length / project.tasks.length) * 100)
    : 0;
  const lastActivity = activity[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-text">{project.deceasedName}</h1>
          <p className="mt-1 text-muted">Dödsboets checklista och aktivitet</p>
        </div>
        <Badge tone={progress === 100 ? 'success' : progress === 0 ? 'neutral' : 'warning'}>
          {progress === 100 ? 'Klar' : progress === 0 ? 'Ej påbörjad' : 'Pågår'}
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Framsteg" value={`${progress}%`} hint={`${project.tasks.filter((t) => t.completed).length} av ${project.tasks.length} klara`} />
        <MetricCard
          label="Familjemedlemmar"
          value={project.members.length}
          hint={project.members.length === 1 ? '1 medlem' : `${project.members.length} medlemmar`}
        />
        <MetricCard
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
                    <label
                      key={task.id}
                      className="flex cursor-pointer items-start gap-3 py-3 first:pt-0"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                      />
                      <div>
                        <span className={task.completed ? 'text-muted line-through' : 'text-text'}>
                          {task.title}
                        </span>
                        {task.completed && completedByName && task.completedAt && (
                          <p className="mt-0.5 text-xs text-muted">
                            Slutförd av {completedByName} den {formatTimestamp(task.completedAt)}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Medlemmar</h2>
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
                {(m.user?.name ?? m.email).charAt(0).toUpperCase()}
              </div>
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
        <form onSubmit={handleInvite} className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="inviteEmail" className="text-sm text-muted">
              Bjud in via e-post
            </label>
            <input
              id="inviteEmail"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={inviteSubmitting}
            className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
          >
            {inviteSubmitting ? 'Bjuder in…' : 'Bjud in familj'}
          </button>
        </form>
        {inviteError && <p className="mt-2 text-sm text-danger">{inviteError}</p>}
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
    </div>
  );
}
