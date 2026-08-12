import { useState } from 'react';
import { TbAlertTriangle } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import { ModalOverlay } from './ModalOverlay';

export function DeleteProjectPermanentlyModal({
  projectId,
  deceasedName,
  onClose,
  onDeleted,
}: {
  projectId: string;
  deceasedName: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const matches = confirmationText === deceasedName;

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await apiFetch(`/projects/${projectId}/permanent`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmationText }),
      });
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte radera dödsboet');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-danger bg-surface p-6 shadow-lg">
        <div className="flex items-center gap-2">
          <TbAlertTriangle size={22} className="text-danger" />
          <h3 className="text-lg font-semibold text-text">Radera permanent?</h3>
        </div>

        <p className="mt-4 text-sm font-medium text-danger">VARNING – DENNA ÅTGÄRD KAN INTE ÅNGRAS</p>

        <p className="mt-3 text-sm text-text">
          Du är på väg att permanent radera <span className="font-semibold">”{deceasedName}”</span>.
        </p>

        <p className="mt-3 text-sm text-muted">Allt kommer att raderas för alltid:</p>
        <ul className="mt-1 flex flex-col gap-1 pl-5 text-sm text-muted">
          <li className="list-disc">Alla uppgifter i checklistan</li>
          <li className="list-disc">Alla kontakter</li>
          <li className="list-disc">All inventarieinformation</li>
          <li className="list-disc">All aktivitetshistorik</li>
        </ul>

        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="confirmationText" className="text-sm font-medium text-text">
            Skriv dödsboets namn för att bekräfta
          </label>
          <input
            id="confirmationText"
            type="text"
            autoFocus
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={deceasedName}
            className="rounded-lg border border-border px-3 py-2.5 text-text focus:border-danger focus:outline-none"
          />
        </div>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

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
            onClick={handleDelete}
            disabled={!matches || deleting}
            className="rounded-lg bg-danger px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {deleting ? 'Raderar…' : 'Radera permanent'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
