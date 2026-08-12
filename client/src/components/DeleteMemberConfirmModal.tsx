import { useState } from 'react';
import { TbAlertTriangle } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { ProjectMember } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

export function DeleteMemberConfirmModal({
  projectId,
  projectName,
  member,
  onClose,
  onRemoved,
}: {
  projectId: string;
  projectName: string;
  member: ProjectMember;
  onClose: () => void;
  onRemoved: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setError(null);
    setRemoving(true);
    try {
      await apiFetch(`/projects/${projectId}/members/${member.id}`, { method: 'DELETE' });
      onRemoved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte ta bort medlemmen');
    } finally {
      setRemoving(false);
    }
  }

  const memberName = member.user?.name ?? member.email;

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-danger bg-surface p-6 shadow-lg">
        <div className="flex items-center gap-2">
          <TbAlertTriangle size={22} className="text-danger" />
          <h3 className="text-lg font-semibold text-text">Ta bort medlem?</h3>
        </div>

        <p className="mt-4 text-sm text-text">
          Du är på väg att ta bort <span className="font-semibold">”{memberName}”</span> från dödsboet{' '}
          <span className="font-semibold">”{projectName}”</span>.
        </p>
        <p className="mt-3 text-sm text-muted">
          Denna medlem kommer inte längre ha tillgång till dödsboet. Du kan bjuda in dem igen senare.
        </p>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="rounded-lg bg-danger px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {removing ? 'Tar bort…' : 'Ta bort medlem'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
