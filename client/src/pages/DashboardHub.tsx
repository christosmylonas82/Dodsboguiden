import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbProgress, TbUsers, TbBell, TbUserPlus, TbArrowRight } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { ActivityEntry, ProjectDetail } from '../lib/types';
import { Badge } from '../components/Badge';
import { MetricCard } from '../components/MetricCard';
import { Avatar } from '../components/Avatar';
import { InviteModal } from '../components/InviteModal';
import { formatActivityAction, formatRelativeTime } from '../lib/activity';
import { PHASE_DESCRIPTIONS } from '../lib/taskDescriptions';
import { PHASES, phaseStatus } from '../lib/phases';
import { PHASE_ROUTE_SLUG } from '../lib/phaseRoutes';

export function DashboardHubPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {PHASES.map((phase) => {
          const tasks = project.tasks.filter((t) => t.phase === phase);
          if (tasks.length === 0) return null;
          const status = phaseStatus(tasks);
          const doneCount = tasks.filter((t) => t.completed).length;
          return (
            <Link
              key={phase}
              to={`/projects/${id}/${PHASE_ROUTE_SLUG[phase]}`}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-text">{phase}</h2>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {doneCount} av {tasks.length} klara
              </p>
              <p className="mt-2 flex-1 text-sm text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
              <p className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-dark">
                Gå till denna fas <TbArrowRight size={16} />
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Familjemedlemmar</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar name={m.user?.name ?? m.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text">{m.user?.name ?? m.email}</p>
                {m.user && <p className="truncate text-xs text-muted">{m.email}</p>}
                {!m.userId && <p className="text-xs text-muted">Inbjuden, väntar på registrering</p>}
              </div>
              <Badge tone={m.role === 'ADMIN' ? 'success' : 'neutral'}>
                {m.role === 'ADMIN' ? 'Admin' : 'Medlem'}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      {inviteModalOpen && (
        <InviteModal onClose={() => setInviteModalOpen(false)} onInvite={inviteMember} />
      )}
    </div>
  );
}
