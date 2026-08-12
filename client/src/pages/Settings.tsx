import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, ApiError, BASE_URL, getToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Invitation, ProjectSummary } from '../lib/types';
import { formatTimestamp } from '../lib/activity';
import { ChangeEmailModal } from '../components/ChangeEmailModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { DeleteProjectPermanentlyModal } from '../components/DeleteProjectPermanentlyModal';

const RETENTION_DAYS = 30;

function daysRemaining(deletedAt: string): number {
  const elapsedMs = Date.now() - new Date(deletedAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  return Math.max(0, RETENTION_DAYS - elapsedDays);
}

function deletionDate(deletedAt: string): string {
  const date = new Date(deletedAt);
  date.setDate(date.getDate() + RETENTION_DAYS);
  return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function reload() {
    const [invites, projects] = await Promise.all([
      apiFetch<Invitation[]>('/invitations'),
      apiFetch<ProjectSummary[]>('/projects?includeArchived=true'),
    ]);
    setInvitations(invites);
    setArchivedProjects(projects.filter((p) => p.deletedAt));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  function flashMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAcceptInvitation(invitation: Invitation) {
    try {
      await apiFetch(`/invitations/${invitation.id}/accept`, { method: 'POST' });
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
      flashMessage(`Du är nu medlem i ${invitation.project.deceasedName}`);
    } catch (err) {
      flashMessage(err instanceof ApiError ? err.message : 'Kunde inte acceptera inbjudan');
    }
  }

  async function handleDeclineInvitation(invitation: Invitation) {
    try {
      await apiFetch(`/invitations/${invitation.id}/decline`, { method: 'POST' });
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
      flashMessage('Inbjudan nekad');
    } catch (err) {
      flashMessage(err instanceof ApiError ? err.message : 'Kunde inte neka inbjudan');
    }
  }

  async function handleRestore(project: ProjectSummary) {
    try {
      await apiFetch(`/projects/${project.id}/restore`, { method: 'PATCH' });
      setArchivedProjects((prev) => prev.filter((p) => p.id !== project.id));
      flashMessage('Dödsbo återställt');
    } catch (err) {
      flashMessage(err instanceof ApiError ? err.message : 'Kunde inte återställa dödsboet');
    }
  }

  async function handleExport() {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/auth/export-data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dodsboguiden-data-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      await apiFetch('/auth/account', { method: 'DELETE' });
      logout();
      navigate('/login');
    } finally {
      setDeletingAccount(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-text">Inställningar</h1>

      {message && (
        <div className="mt-4 rounded-lg border border-border bg-primary-light px-4 py-2.5 text-sm text-text">
          {message}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Konto</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Email</p>
            <p className="text-text">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm text-text hover:bg-primary-light"
          >
            Ändra email
          </button>
        </div>
        <hr className="my-4 border-border" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Lösenord</p>
            <p className="text-text">••••••••</p>
          </div>
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm text-text hover:bg-primary-light"
          >
            Ändra lösenord
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Mottagna inbjudningar {invitations.length > 0 && `(${invitations.length})`}</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted">Laddar…</p>
        ) : invitations.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Du har inga väntande inbjudningar.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-text">{invitation.project.deceasedName}</p>
                <p className="text-sm text-muted">
                  Inbjuden av: {invitation.senderUser.name} ({formatTimestamp(invitation.createdAt)})
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleDeclineInvitation(invitation)}
                    className="rounded-lg border border-border bg-transparent px-4 py-1.5 text-sm text-text hover:bg-primary-light"
                  >
                    Neka
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptInvitation(invitation)}
                    className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    Acceptera
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Arkiverade dödsbon</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted">Laddar…</p>
        ) : archivedProjects.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Du har inga arkiverade dödsbon.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {archivedProjects.map((project) => (
              <li key={project.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-text">{project.deceasedName}</p>
                <p className="text-sm text-muted">
                  Raderas permanent: {deletionDate(project.deletedAt!)} ({daysRemaining(project.deletedAt!)} dagar kvar)
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleRestore(project)}
                    className="rounded-lg border border-border bg-transparent px-4 py-1.5 text-sm text-text hover:bg-primary-light"
                  >
                    Återställ
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(project)}
                    className="rounded-lg border border-danger bg-transparent px-4 py-1.5 text-sm text-danger hover:bg-danger-light"
                  >
                    Radera permanent
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Exportera dina uppgifter</h2>
        <p className="mt-1 text-sm text-muted">Ladda ner en kopia av all data vi har om dig och dina dödsbon.</p>
        <button
          type="button"
          onClick={handleExport}
          className="mt-4 rounded-lg border border-border bg-transparent px-4 py-2 text-sm text-text hover:bg-primary-light"
        >
          Exportera data
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-danger bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Radera konto</h2>
        <p className="mt-1 text-sm text-muted">
          Detta raderar ditt konto permanent. Delade dödsbon påverkas inte för övriga medlemmar.
        </p>
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Radera mitt konto
          </button>
        ) : (
          <div className="mt-4">
            <p className="text-sm font-medium text-danger">Är du säker? Detta går inte att ångra.</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {deletingAccount ? 'Raderar…' : 'Ja, radera mitt konto'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm text-text hover:bg-primary-light"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Integritetspolicy</h2>
        <p className="mt-1 text-sm text-muted">
          Dödsbo Guide samlar bara in de uppgifter som behövs för att koordinera ett enkelt dödsbo: namn,
          e-post, och de checklistor och aktiviteter du och dina familjemedlemmar skapar tillsammans. Vi ger
          ingen juridisk rådgivning. Du kan när som helst exportera eller radera dina uppgifter på den här
          sidan.
        </p>
      </div>

      {emailModalOpen && (
        <ChangeEmailModal
          currentEmail={user.email}
          onClose={() => setEmailModalOpen(false)}
          onUpdated={(updated) => {
            updateUser(updated);
            flashMessage('Email uppdaterad');
          }}
        />
      )}
      {passwordModalOpen && (
        <ChangePasswordModal
          onClose={() => {
            setPasswordModalOpen(false);
            flashMessage('Lösenord uppdaterat');
          }}
        />
      )}
      {projectToDelete && (
        <DeleteProjectPermanentlyModal
          projectId={projectToDelete.id}
          deceasedName={projectToDelete.deceasedName}
          onClose={() => setProjectToDelete(null)}
          onDeleted={() => {
            setArchivedProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
            flashMessage('Dödsbo raderat permanent');
          }}
        />
      )}
    </div>
  );
}
