import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { TbUserPlus, TbArrowRight, TbPencil } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { ActivityEntry, ProjectDetail } from '../lib/types';
import { StatusLabel } from '../components/StatusLabel';
import { ProgressOverviewModal } from '../components/ProgressOverviewModal';
import { RecentActivityModal } from '../components/RecentActivityModal';
import { MembersModal } from '../components/MembersModal';
import { RenameProjectModal } from '../components/RenameProjectModal';
import { DodsboDropdown } from '../components/DodsboDropdown';
import { GuidedTour } from '../components/GuidedTour';
import { DeadlineWarningModal } from '../components/DeadlineWarningModal';
import { useAuth } from '../context/AuthContext';
import { formatActivityAction, formatRelativeTime } from '../lib/activity';
import { PHASE_DESCRIPTIONS, TASK_DESCRIPTIONS } from '../lib/taskDescriptions';
import { PHASES, phaseStatus } from '../lib/phases';
import { PHASE_ROUTE_SLUG } from '../lib/phaseRoutes';
import { tasksForProgress } from '../lib/taskStatus';
import { DEADLINE_REMINDER_MILESTONES, daysUntilDeadline, formatDeadlineDate } from '../lib/deadline';
import { findNextStep } from '../lib/nextStep';

export function DashboardHubPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, markOnboardingSeen } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
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
  const doneProjectTaskCount = countedProjectTasks.filter((t) => t.completed).length;
  const progress = countedProjectTasks.length ? Math.round((doneProjectTaskCount / countedProjectTasks.length) * 100) : 0;
  const hasStarted = countedProjectTasks.some((t) => t.completed || t.status === 'IN_PROGRESS');
  const lastActivity = activity[0];
  const isAdmin = project.members.find((m) => m.userId === user?.id)?.role === 'ADMIN';
  const deadlineDays = project.deceasedDate ? daysUntilDeadline(project.deceasedDate) : null;
  const overallStatus =
    progress === 100 ? { tone: 'success' as const, label: 'Klar' } : hasStarted ? { tone: 'primary' as const, label: 'Pågår' } : { tone: 'neutral' as const, label: 'Ej påbörjad' };
  const nextStep = findNextStep(project.tasks);
  const nextStepDescription = nextStep ? (TASK_DESCRIPTIONS[nextStep.task.title] ?? nextStep.task.description) : null;

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
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
          <p className="mt-1 text-sm text-muted">Vi hjälper dig att ta en sak i taget.</p>
          <div className="mt-2">
            <StatusLabel tone={overallStatus.tone}>{overallStatus.label}</StatusLabel>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal('members')}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-primary-dark sm:w-auto"
        >
          <TbUserPlus size={20} />
          Bjud in familjemedlem
        </button>
      </div>

      {nextStep ? (
        <section className="mt-12 border-l-4 border-primary bg-bg py-5 pr-4 pl-5 sm:pr-6">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Nästa steg</p>
          <h2 className="mt-1 text-xl font-semibold text-text">{nextStep.task.title}</h2>
          {nextStepDescription && <p className="mt-1.5 text-sm text-muted">{nextStepDescription}</p>}
          <Link
            to={`/projects/${id}/${PHASE_ROUTE_SLUG[nextStep.phase]}`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            {nextStep.ctaLabel} <TbArrowRight size={16} />
          </Link>
        </section>
      ) : (
        <section className="mt-12 border-l-4 border-success bg-bg py-5 pr-4 pl-5 sm:pr-6">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Nästa steg</p>
          <h2 className="mt-1 text-xl font-semibold text-text">Alla uppgifter är klara</h2>
          <p className="mt-1.5 text-sm text-muted">
            Ta gärna en titt på boupptecknings-guiden för att se vad som återstår inför bouppteckningen.
          </p>
          <Link
            to={`/projects/${id}/bouppteckning`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            Visa <TbArrowRight size={16} />
          </Link>
        </section>
      )}

      <section className="mt-12" data-tour="progress">
        <button
          type="button"
          onClick={() => setOpenModal('progress')}
          className="block w-full bg-transparent p-0 text-left"
        >
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Övergripande framsteg</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[28px] leading-none font-semibold text-text">{progress}%</span>
            {deadlineDays !== null && (
              <span className="text-sm text-muted">
                {deadlineDays} dagar kvar till bouppteckning ({formatDeadlineDate(project.deceasedDate!)})
              </span>
            )}
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-light">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </button>
      </section>

      <section className="mt-12" data-tour="phases">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Faser</p>
        <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                className="flex flex-col gap-3 rounded border border-border bg-surface p-5 transition hover:border-primary-dark/30 hover:bg-primary-light"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-text">{phase}</h3>
                  <StatusLabel tone={status.tone}>{status.label}</StatusLabel>
                </div>
                <p className="flex-1 text-sm text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
                <div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${countedTasks.length ? (doneCount / countedTasks.length) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {doneCount} av {countedTasks.length} klara
                  </p>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
                  Gå till denna fas <TbArrowRight size={16} />
                </p>
              </Link>
            );
          })}
          <Link
            to={`/projects/${id}/bouppteckning`}
            className="flex flex-col gap-3 rounded border border-border bg-surface p-5 transition hover:border-primary-dark/30 hover:bg-primary-light"
          >
            <h3 className="text-lg font-semibold text-text">Boupptecknings-guide</h3>
            <p className="flex-1 text-sm text-muted">
              Steg-för-steg genom Skatteverkets bouppteckningsprocess, med din inventering och ekonomi sammanställd.
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
              Öppna guiden <TbArrowRight size={16} />
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            data-tour="members"
            onClick={() => setOpenModal('members')}
            className="bg-transparent p-0 text-left text-sm text-muted transition hover:text-text"
          >
            <strong className="font-semibold text-text">{project.members.length}</strong>{' '}
            {project.members.length === 1 ? 'familjemedlem' : 'familjemedlemmar'} →
          </button>
          <button
            type="button"
            data-tour="activity"
            onClick={() => setOpenModal('activity')}
            className="bg-transparent p-0 text-left text-sm text-muted transition hover:text-text"
          >
            {lastActivity
              ? `${lastActivity.user.name} ${formatActivityAction(lastActivity.action)} · ${formatRelativeTime(lastActivity.timestamp)}`
              : 'Ingen aktivitet än'}{' '}
            →
          </button>
        </div>
      </section>

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
          onInvited={inviteMember}
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
