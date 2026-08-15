import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { ModalOverlay } from './ModalOverlay';

export function ArchiveProjectModal({
  projectId,
  deceasedName,
  onClose,
  onArchived,
}: {
  projectId: string;
  deceasedName: string;
  onClose: () => void;
  onArchived: () => void;
}) {
  const [archiving, setArchiving] = useState(false);

  async function handleArchive() {
    setArchiving(true);
    try {
      await apiFetch(`/projects/${projectId}/archive`, { method: 'PATCH' });
      onArchived();
    } finally {
      setArchiving(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-text">Arkivera dödsbo</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Du är på väg att arkivera dödsboet &quot;{deceasedName}&quot;. Arkiverade dödsbon sparas i 30 dagar,
          sedan raderas de permanent automatiskt. Du kan återställa dödsboet när som helst under denna
          30-dagars period.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-text hover:bg-primary-light"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={archiving}
            className="rounded-lg bg-danger px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {archiving ? 'Arkiverar…' : 'Arkivera'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
