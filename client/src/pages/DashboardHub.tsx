import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TbProgress, TbUsers, TbBell, TbUserPlus, TbArrowRight, TbArchive } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { ActivityEntry, ProjectDetail } from '../lib/types';
import { Badge } from '../components/Badge';
import { MetricCard } from '../components/MetricCard';
import { InviteModal } from '../components/InviteModal';
import { ProgressOverviewModal } from '../components/ProgressOverviewModal';
import { RecentActivityModal } from '../components/RecentActivityModal';
import { MembersModal } from '../components/MembersModal';
import { useAuth } from '../context/AuthContext';
import { formatActivityAction, formatRelativeTime } from '../lib/activity';
import { PHASE_DESCRIPTIONS } from '../lib/taskDescriptions';
import { PHASES, phaseStatus } from '../lib/phases';
import { PHASE_ROUTE_SLUG } from '../lib/phaseRoutes';

export function DashboardHubPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState<'progress' | 'activity' | 'members' | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

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

  async function handleArchive() {
    if (!id) return;
    setArchiving(true);
    try {
      await apiFetch(`/projects/${id}/archive`, { method: 'PATCH' });
      navigate('/dashboard');
    } finally {
      setArchiving(false);
    }
  }

  if (!project) return <p className="text-muted">Laddar…</p>;

  const progress = project.tasks.length
    ? Math.round((project.tasks.filter((t) => t.completed).length / project.tasks.length) * 100)
    : 0;
  const lastActivity = activity[0];
  const isAdmin = project.members.find((m) => m.userId === user?.id)?.role === 'ADMIN';

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
          onClick={() => setOpenModal('progress')}
        />
        <MetricCard
          icon={<TbUsers size={20} />}
          label="Familjemedlemmar"
          value={project.members.length}
          hint={project.members.length === 1 ? '1 medlem' : `${project.members.length} medlemmar`}
          onClick={() => setOpenModal('members')}
        />
        <MetricCard
          icon={<TbBell size={20} />}
          label="Senaste aktivitet"
          value={lastActivity ? formatRelativeTime(lastActivity.timestamp) : '—'}
          hint={lastActivity ? `${lastActivity.user.name} ${formatActivityAction(lastActivity.action)}` : 'Ingen aktivitet än'}
          onClick={() => setOpenModal('activity')}
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

      {isAdmin && (
        <div className="mt-8 flex justify-end">
          {!confirmingArchive ? (
            <button
              type="button"
              onClick={() => setConfirmingArchive(true)}
              className="flex items-center gap-1.5 bg-transparent text-sm text-muted hover:text-danger"
            >
              <TbArchive size={16} />
              Arkivera dödsbo
            </button>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted">Arkivera detta dödsbo? Det kan återställas i 30 dagar.</span>
              <button
                type="button"
                onClick={() => setConfirmingArchive(false)}
                className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-text hover:bg-primary-light"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={archiving}
                className="rounded-lg bg-danger px-3 py-1.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {archiving ? 'Arkiverar…' : 'Ja, arkivera'}
              </button>
            </div>
          )}
        </div>
      )}

      {inviteModalOpen && (
        <InviteModal onClose={() => setInviteModalOpen(false)} onInvite={inviteMember} />
      )}

      {openModal === 'progress' && (
        <ProgressOverviewModal tasks={project.tasks} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'activity' && (
        <RecentActivityModal projectId={id!} activity={activity} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'members' && (
        <MembersModal
          projectId={id!}
          projectName={project.deceasedName}
          members={project.members}
          pendingInvitations={project.invitations}
          currentUserId={user?.id}
          isAdmin={isAdmin}
          onClose={() => setOpenModal(null)}
          onMemberRemoved={(memberId) => {
            setProject((prev) => (prev ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) } : prev));
            showToast('Medlem borttagen');
          }}
          onInvitationRevoked={(invitationId) => {
            setProject((prev) =>
              prev ? { ...prev, invitations: prev.invitations.filter((i) => i.id !== invitationId) } : prev,
            );
            showToast('Inbjudan tillbakadragen');
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
