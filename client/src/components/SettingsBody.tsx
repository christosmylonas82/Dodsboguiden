import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, ApiError, BASE_URL, getToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { ProjectSummary, User } from '../lib/types';
import { ChangeEmailModal } from './ChangeEmailModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteProjectPermanentlyModal } from './DeleteProjectPermanentlyModal';
import { ImageUploadModal } from './ImageUploadModal';
import { Avatar } from './Avatar';

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

export function SettingsBody({ onClose }: { onClose?: () => void }) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [archivedProjects, setArchivedProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [nameDraft, setNameDraft] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmingImageRemove, setConfirmingImageRemove] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  async function reload() {
    const projects = await apiFetch<ProjectSummary[]>('/projects?includeArchived=true');
    setArchivedProjects(projects.filter((p) => p.deletedAt));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setNameDraft(user?.name ?? '');
  }, [user?.name]);

  function flashMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleNameBlur() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === user?.name) {
      setNameDraft(user?.name ?? '');
      return;
    }
    setSavingName(true);
    try {
      const updated = await apiFetch<User>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ name: trimmed }),
      });
      updateUser(updated);
      flashMessage('Namn uppdaterat');
    } catch (err) {
      setNameDraft(user?.name ?? '');
      flashMessage(err instanceof ApiError ? err.message : 'Kunde inte uppdatera namnet');
    } finally {
      setSavingName(false);
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

  async function handleRemoveImage() {
    setRemovingImage(true);
    try {
      const updated = await apiFetch<User>('/auth/profile-image', { method: 'DELETE' });
      updateUser(updated);
      flashMessage('Profilbild borttagen');
    } finally {
      setRemovingImage(false);
      setConfirmingImageRemove(false);
    }
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
      {message && (
        <div className="mb-4 rounded-lg border border-border bg-primary-light px-4 py-2.5 text-sm text-text">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Min profil</h2>
        <div className="mt-4 flex flex-col items-center gap-3">
          <Avatar name={user.name} imageUrl={user.profileImageUrl} userId={user.id} size="lg" />
          <div className="w-full max-w-xs">
            <label htmlFor="settingsName" className="text-sm text-muted">
              Namn
            </label>
            <input
              id="settingsName"
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleNameBlur}
              disabled={savingName}
              maxLength={100}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-center text-text focus:border-primary focus:outline-none disabled:opacity-60"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm text-text hover:bg-primary-light"
            >
              Ladda upp bild
            </button>
            {!confirmingImageRemove ? (
              <button
                type="button"
                onClick={() => setConfirmingImageRemove(true)}
                disabled={!user.profileImageUrl}
                className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm text-text hover:bg-primary-light disabled:opacity-40"
              >
                Ta bort bild
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={removingImage}
                  className="rounded-lg bg-danger px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {removingImage ? 'Tar bort…' : 'Bekräfta'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingImageRemove(false)}
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text hover:bg-primary-light"
                >
                  Avbryt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {onClose && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      )}

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
      {imageModalOpen && (
        <ImageUploadModal
          onClose={() => setImageModalOpen(false)}
          onUploaded={(updated) => {
            updateUser(updated);
            flashMessage('Profilbild uppdaterad');
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
