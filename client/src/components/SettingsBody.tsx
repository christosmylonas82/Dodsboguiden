import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbPencil, TbDownload, TbFileText, TbTrash, TbLogout2, TbHistory, TbChevronRight } from 'react-icons/tb';
import { apiFetch, ApiError, BASE_URL, getToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { ActivityEntry, ProjectSummary, User } from '../lib/types';
import { exportGdprDataToPdf } from '../lib/export';
import { ChangeEmailModal } from './ChangeEmailModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteProjectPermanentlyModal } from './DeleteProjectPermanentlyModal';
import { ImageUploadModal } from './ImageUploadModal';
import { EditNameModal } from './EditNameModal';
import { RecentActivityModal } from './RecentActivityModal';
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

function memberSinceDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
}

function AccountField({
  label,
  value,
  muted,
  hint,
  editLabel,
  onEdit,
}: {
  label: string;
  value: string;
  muted?: boolean;
  hint?: string;
  editLabel: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className={`truncate ${muted ? 'italic text-muted' : 'text-text'}`}>{value}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex w-32 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
        >
          <TbPencil size={16} />
          {editLabel}
        </button>
      )}
    </div>
  );
}

function SectionCard({
  title,
  children,
  danger,
}: {
  title: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-xl border ${danger ? 'border-danger' : 'border-border'} bg-surface p-4 shadow-sm`}>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function SettingsBody({ onClose, projectId }: { onClose?: () => void; projectId?: string }) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [archivedProjects, setArchivedProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const [editNameModalOpen, setEditNameModalOpen] = useState(false);
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

  async function openActivityLog() {
    if (!projectId) return;
    setLoadingActivity(true);
    try {
      const data = await apiFetch<ActivityEntry[]>(`/projects/${projectId}/activity`);
      setActivity(data);
      setActivityModalOpen(true);
    } finally {
      setLoadingActivity(false);
    }
  }

  function flashMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
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

  async function handleExport(format: 'json' | 'pdf') {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/auth/export-data`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (format === 'pdf') {
      const payload = await res.json();
      await exportGdprDataToPdf(payload);
      return;
    }

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
      onClose?.();
      logout();
      navigate('/login?accountDeleted=1');
    } finally {
      setDeletingAccount(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div className="rounded-lg border border-border bg-primary-light px-4 py-2.5 text-sm text-text">
          {message}
        </div>
      )}

      <SectionCard title="Kontouppgifter">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} imageUrl={user.profileImageUrl ?? user.profilePicture} userId={user.id} size="lg" />
          <div className="text-sm text-muted">Medlem sedan {memberSinceDate(user.createdAt)}</div>
        </div>

        <div className="mt-4 flex flex-col divide-y divide-border border-t border-border">
          <AccountField label="Namn" value={user.name} onEdit={() => setEditNameModalOpen(true)} editLabel="Ändra" />
          <AccountField
            label="E-post"
            value={user.emailIsPlaceholder ? 'Ingen e-post registrerad' : user.email}
            muted={user.emailIsPlaceholder}
            hint={!user.emailEditable ? 'Kopplad till ditt Google-konto' : undefined}
            onEdit={user.emailEditable ? () => setEmailModalOpen(true) : undefined}
            editLabel={user.emailIsPlaceholder ? 'Registrera' : 'Ändra'}
          />
          <AccountField
            label="Lösenord"
            value={user.hasPassword ? '••••••••' : 'Inloggning via Google/Facebook'}
            muted={!user.hasPassword}
            onEdit={user.hasPassword ? () => setPasswordModalOpen(true) : undefined}
            editLabel="Ändra"
          />
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Ladda upp bild
          </button>
          {!confirmingImageRemove ? (
            <button
              type="button"
              onClick={() => setConfirmingImageRemove(true)}
              disabled={!user.profileImageUrl}
              className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light disabled:opacity-40"
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
      </SectionCard>

      {projectId && (
        <SectionCard title="Aktivitetslogg">
          <button
            type="button"
            onClick={openActivityLog}
            disabled={loadingActivity}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-transparent px-4 py-3 text-left text-sm text-text transition hover:bg-primary-light disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              <TbHistory size={18} className="text-muted" />
              {loadingActivity ? 'Laddar…' : 'Visa senaste aktivitet'}
            </span>
            <TbChevronRight size={16} className="text-muted" />
          </button>
        </SectionCard>
      )}

      <SectionCard title="Arkiverade dödsbon">
        {loading ? (
          <p className="text-sm text-muted">Laddar…</p>
        ) : archivedProjects.length === 0 ? (
          <p className="text-sm text-muted">Du har inga arkiverade dödsbon.</p>
        ) : (
          <ul className="flex flex-col gap-3">
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
      </SectionCard>

      <SectionCard title="Din data">
        <p className="text-sm leading-relaxed text-muted">
          Du har rätt att när som helst få ut eller radera dina personuppgifter.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-5 py-3 text-sm text-text hover:bg-primary-light"
          >
            <TbDownload size={16} />
            Ladda ner som JSON
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-5 py-3 text-sm text-text hover:bg-primary-light"
          >
            <TbFileText size={16} />
            Ladda ner som PDF
          </button>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-danger bg-transparent px-5 py-3 text-sm text-danger hover:bg-danger-light"
            >
              <TbTrash size={16} />
              Radera konto
            </button>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <p className="text-sm font-medium text-danger">Är du säker? Detta går inte att ångra.</p>
              <div className="flex gap-3">
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
                  className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Villkor">
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-medium text-text">Integritetspolicy</span> — Dödsbo Guide samlar bara in de
          uppgifter som behövs för att koordinera ett enkelt dödsbo: namn, e-post, och de checklistor och
          aktiviteter du och dina familjemedlemmar skapar tillsammans. Vi ger ingen juridisk rådgivning. Du kan
          när som helst exportera eller radera dina uppgifter på den här sidan.
        </p>
      </SectionCard>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-medium text-text hover:bg-primary-light"
      >
        <TbLogout2 size={18} />
        Logga ut
      </button>

      {onClose && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      )}

      {editNameModalOpen && (
        <EditNameModal
          currentName={user.name}
          onClose={() => setEditNameModalOpen(false)}
          onUpdated={(updated) => {
            updateUser(updated);
            flashMessage('Inställningar uppdaterat');
          }}
        />
      )}
      {emailModalOpen && (
        <ChangeEmailModal
          currentEmail={user.email}
          requiresPassword={!user.emailIsPlaceholder}
          onClose={() => setEmailModalOpen(false)}
          onUpdated={(updated) => {
            updateUser(updated);
            flashMessage(user.emailIsPlaceholder ? 'E-post registrerad' : 'Email uppdaterad');
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
      {activityModalOpen && projectId && (
        <RecentActivityModal projectId={projectId} activity={activity} onClose={() => setActivityModalOpen(false)} />
      )}
    </div>
  );
}
