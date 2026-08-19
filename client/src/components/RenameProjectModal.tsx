import { useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import type { ProjectDetail } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

export function RenameProjectModal({
  projectId,
  currentName,
  currentDeceasedDate,
  onClose,
  onRenamed,
}: {
  projectId: string;
  currentName: string;
  currentDeceasedDate?: string | null;
  onClose: () => void;
  onRenamed: (deceasedName: string, deceasedDate: string | null) => void;
}) {
  const [name, setName] = useState(currentName);
  const [deceasedDate, setDeceasedDate] = useState(currentDeceasedDate ? currentDeceasedDate.split('T')[0] : '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setSubmitting(true);
    try {
      const updated = await apiFetch<ProjectDetail>(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          deceasedName: trimmed,
          deceasedDate: deceasedDate ? new Date(`${deceasedDate}T00:00:00Z`).toISOString() : null,
        }),
      });
      onRenamed(updated.deceasedName, updated.deceasedDate);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte uppdatera namnet');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-text">Redigera dödsboets namn</h3>
        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="deceasedName" className="text-sm text-muted">
            Den avlidnes namn
          </label>
          <input
            id="deceasedName"
            type="text"
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
          />

          <label htmlFor="deceasedDate" className="mt-4 block text-sm text-muted">
            Dödsdatum (valfritt)
          </label>
          <input
            id="deceasedDate"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={deceasedDate}
            onChange={(e) => setDeceasedDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted">Används för att räkna ut deadlinen för bouppteckning (4 månader).</p>

          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-text hover:bg-primary-light"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Sparar…' : 'Spara'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
