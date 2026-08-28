import { useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import { ModalOverlay } from './ModalOverlay';

export function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (projectId: string) => void;
}) {
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedDate, setDeceasedDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const project = await apiFetch<{ id: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          deceasedName,
          ...(deceasedDate ? { deceasedDate: new Date(`${deceasedDate}T00:00:00Z`).toISOString() } : {}),
        }),
      });
      onCreated(project.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte skapa dödsbo');
    } finally {
      setCreating(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <h3 className="text-lg font-semibold text-text">Skapa dödsbo</h3>
        <p className="mt-1.5 text-sm text-muted">
          Vi är ledsna för er förlust. Låt oss hjälpa er hålla koll, steg för steg.
        </p>
        <form onSubmit={handleCreate} className="mt-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="deceasedName" className="text-sm text-muted">
              Den avlidnes namn
            </label>
            <input
              id="deceasedName"
              type="text"
              autoFocus
              required
              value={deceasedName}
              onChange={(e) => setDeceasedName(e.target.value)}
              className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <label htmlFor="deceasedDate" className="text-sm text-muted">
              Dödsdatum (valfritt)
            </label>
            <input
              id="deceasedDate"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={deceasedDate}
              onChange={(e) => setDeceasedDate(e.target.value)}
              className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-muted">
              Om du anger ett datum räknar vi ut deadlinen för bouppteckning (4 månader) automatiskt.
            </p>
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-surface px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {creating ? 'Skapar…' : 'Skapa dödsbo'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
