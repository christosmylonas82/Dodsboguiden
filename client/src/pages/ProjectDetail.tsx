import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import type { ActivityEntry, ProjectDetail, Task } from '../lib/types';

const PHASES: Task['phase'][] = ['Förberedelser', 'Förrättningen', 'Efter förrättningen'];

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

  if (!project) return <p>Laddar…</p>;

  const progress = project.tasks.length
    ? Math.round((project.tasks.filter((t) => t.completed).length / project.tasks.length) * 100)
    : 0;

  return (
    <div>
      <h1>{project.deceasedName}</h1>
      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="card">
        <h2>Checklista</h2>
        {PHASES.map((phase) => {
          const tasks = project.tasks.filter((t) => t.phase === phase);
          if (tasks.length === 0) return null;
          return (
            <div className="task-phase" key={phase}>
              <h3>{phase}</h3>
              {tasks.map((task) => (
                <label key={task.id} className={`task-row${task.completed ? ' completed' : ''}`}>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} />
                  <span>{task.title}</span>
                </label>
              ))}
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2>Medlemmar</h2>
        <ul>
          {project.members.map((m) => (
            <li key={m.id}>
              {m.user?.name ?? m.email} — {m.role === 'ADMIN' ? 'admin' : 'medlem'}
              {!m.userId && ' (inbjuden, väntar på registrering)'}
            </li>
          ))}
        </ul>
        <form onSubmit={handleInvite}>
          <div className="form-field">
            <label htmlFor="inviteEmail">Bjud in via e-post</label>
            <input
              id="inviteEmail"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          {inviteError && <p className="error-text">{inviteError}</p>}
          <button type="submit" disabled={inviteSubmitting}>
            {inviteSubmitting ? 'Bjuder in…' : 'Bjud in'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Aktivitet</h2>
        <ul>
          {activity.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.user.name}</strong> {entry.action} —{' '}
              {new Date(entry.timestamp).toLocaleString('sv-SE')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
