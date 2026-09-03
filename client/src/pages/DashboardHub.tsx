import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { TbProgress, TbUsers, TbBell, TbUserPlus, TbArrowRight, TbPencil, TbClock } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { ActivityEntry, ProjectDetail } from '../lib/types';
import { Badge } from '../components/Badge';
import { MetricCard } from '../components/MetricCard';
import { InviteModal } from '../components/InviteModal';
import { ProgressOverviewModal } from '../components/ProgressOverviewModal';
import { RecentActivityModal } from '../components/RecentActivityModal';
import { MembersModal } from '../components/MembersModal';
import { RenameProjectModal } from '../components/RenameProjectModal';
import { DodsboDropdown } from '../components/DodsboDropdown';
import { GuidedTour } from '../components/GuidedTour';
import { DeadlineWarningModal } from '../components/DeadlineWarningModal';
import { useAuth } from '../context/AuthContext';
import { formatActivityAction, formatRelativeTime } from '../lib/activity';
import { PHASE_DESCRIPTIONS } from '../lib/taskDescriptions';
import { PHASES, phaseStatus } from '../lib/phases';
import { PHASE_ROUTE_SLUG } from '../lib/phaseRoutes';
import { tasksForProgress } from '../lib/taskStatus';
import { DEADLINE_REMINDER_MILESTONES, daysUntilDeadline, formatDeadlineDate } from '../lib/deadline';

export function DashboardHubPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, markOnboardingSeen } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState<'progress' | 'activity' | 'members' | 'rename' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [deadlineWarningDays, setDeadlineWarningDays] = useState<number | null>(null);

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

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      apiFetch<ActivityEntry[]>(`/projects/${id}/activity`).then(setActivity);
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (project && user && user.onboardingVersionSeen < user.currentOnboardingVersion) {
      setShowTour(true);
    }
  }, [project, user]);

  useEffect(() => {
    if ((location.state as { startTour?: boolean } | null)?.startTour) {
      setShowTour(true);
      navigate('.', { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (!project?.deceasedDate || !id) return;
    const days = daysUntilDeadline(project.deceasedDate);
    const milestone = DEADLINE_REMINDER_MILESTONES.find((m) => m === days);
    if (milestone === undefined) return;
    const todayKey = new Date().toISOString().split('T')[0];
    const storageKey = `deadline-warning-${id}-${milestone}-${todayKey}`;
    if (localStorage.getItem(storageKey)) return;
    setDeadlineWarningDays(days);
    localStorage.setItem(storageKey, 'shown');
  }, [project, id]);

  function finishTour() {
    setShowTour(false);
    if (user && user.onboardingVersionSeen < user.currentOnboardingVersion) {
      markOnboardingSeen();
    }
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

  const countedProjectTasks = tasksForProgress(project.tasks);
  const progress = countedProjectTasks.length
    ? Math.round((countedProjectTasks.filter((t) => t.completed).length / countedProjectTasks.length) * 100)
    : 0;
  const hasStarted = countedProjectTasks.some((t) => t.completed || t.status === 'IN_PROGRESS');
  const lastActivity = activity[0];
  const isAdmin = project.members.find((m) => m.userId === user?.id)?.role === 'ADMIN';
  const deadlineDays = project.deceasedDate ? daysUntilDeadline(project.deceasedDate) : null;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold text-text">{project.deceasedName}</h1>
              {isAdmin && (
                <button
                  type="button"
                  data-tour="edit-name"
                  onClick={() => setOpenModal('rename')}
                  aria-label="Redigera namn"
                  title="Redigera namn"
                  className="rounded-lg bg-transparent p-1.5 text-muted transition hover:bg-primary-light hover:text-primary-dark"
                >
                  <TbPencil size={18} />
                </button>
              )}
              {isAdmin && (
                <DodsboDropdown
                  projectId={id!}
                  deceasedName={project.deceasedName}
                  onArchived={() => {
                    window.dispatchEvent(new CustomEvent('dodsbo:project-archived'));
                    navigate('/dashboard');
                  }}
                />
              )}
            </div>
            <p className="mt-1 text-muted">Dödsboets checklista och aktivitet</p>
          </div>
          <Badge tone={progress === 100 ? 'success' : hasStarted ? 'primary' : 'neutral'}>
            {progress === 100 ? 'Klar' : hasStarted ? 'Pågår' : 'Ej påbörjad'}
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
        <div data-tour="progress">
          <MetricCard
            icon={<TbProgress size={20} />}
            label="Framsteg"
            headerRight={deadlineDays !== null && <TbClock size={24} className="shrink-0 text-muted" />}
            value={
              <span className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <span className="block min-w-0 flex-1 basis-0 text-left">
                  <span className="text-lg font-semibold text-text">{progress}%</span>
                  <span className="mt-1 block text-xs font-normal text-muted">
                    {countedProjectTasks.filter((t) => t.completed).length} av {countedProjectTasks.length} klara
                  </span>
                </span>
                {deadlineDays !== null && (
                  <span className="block min-w-0 flex-1 basis-0 text-left sm:text-right">
                    <span className="text-lg font-semibold text-text">{deadlineDays} dagar kvar</span>
                    <span className="mt-1 block text-xs font-normal text-muted">
                      Deadline: {formatDeadlineDate(project.deceasedDate!)}
                    </span>
                  </span>
                )}
              </span>
            }
            onClick={() => setOpenModal('progress')}
          />
        </div>
        <div data-tour="members">
          <MetricCard
            icon={<TbUsers size={20} />}
            label="Familjemedlemmar"
            value={project.members.length}
            hint={project.members.length === 1 ? '1 medlem' : `${project.members.length} medlemmar`}
            onClick={() => setOpenModal('members')}
            centered
          />
        </div>
        <div data-tour="activity">
          <MetricCard
            icon={<TbBell size={20} />}
            label="Senaste aktivitet"
            value={lastActivity ? formatRelativeTime(lastActivity.timestamp) : '—'}
            valueClassName="text-lg"
            hint={lastActivity ? `${lastActivity.user.name} ${formatActivityAction(lastActivity.action)}` : 'Ingen aktivitet än'}
            onClick={() => setOpenModal('activity')}
            centered
          />
        </div>
      </div>

      <div data-tour="phases" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PHASES.map((phase) => {
          const tasks = project.tasks.filter((t) => t.phase === phase);
          if (tasks.length === 0) return null;
          const status = phaseStatus(tasks);
          const countedTasks = tasksForProgress(tasks);
          const doneCount = countedTasks.filter((t) => t.completed).length;
          return (
            <Link
              key={phase}
              to={`/projects/${id}/${PHASE_ROUTE_SLUG[phase]}`}
              className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-text">{phase}</h2>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {doneCount} av {countedTasks.length} klara
              </p>
              <p className="mt-2 flex-1 text-sm text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
              <p className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-dark">
                Gå till denna fas <TbArrowRight size={16} />
              </p>
            </Link>
          );
        })}
        <Link
          to={`/projects/${id}/bouppteckning`}
          className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-text">Boupptecknings-guide</h2>
          <p className="mt-2 flex-1 text-sm text-muted">
            Steg-för-steg genom Skatteverkets bouppteckningsprocess, med din inventering och ekonomi sammanställd.
          </p>
          <p className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-dark">
            Öppna guiden <TbArrowRight size={16} />
          </p>
        </Link>
      </div>

      {inviteModalOpen && (
        <InviteModal onClose={() => setInviteModalOpen(false)} onInvite={inviteMember} />
      )}

      {openModal === 'progress' && (
        <ProgressOverviewModal tasks={project.tasks} deceasedDate={project.deceasedDate} onClose={() => setOpenModal(null)} />
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

      {openModal === 'rename' && (
        <RenameProjectModal
          projectId={id!}
          currentName={project.deceasedName}
          currentDeceasedDate={project.deceasedDate}
          onClose={() => setOpenModal(null)}
          onRenamed={(deceasedName, deceasedDate) => {
            setProject((prev) => (prev ? { ...prev, deceasedName, deceasedDate } : prev));
            window.dispatchEvent(new CustomEvent('dodsbo:project-renamed', { detail: { projectId: id, deceasedName } }));
            showToast('Dödsboets namn uppdaterat');
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text shadow-lg">
          {toast}
        </div>
      )}

      <GuidedTour isOpen={showTour} onFinish={finishTour} />

      {deadlineWarningDays !== null && (
        <DeadlineWarningModal daysRemaining={deadlineWarningDays} onClose={() => setDeadlineWarningDays(null)} />
      )}
    </div>
  );
}
