import { useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import type { User } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

export function EditNameModal({
  currentName,
  onClose,
  onUpdated,
}: {
  currentName: string;
  onClose: () => void;
  onUpdated: (user: User) => void;
}) {
  const [firstName, setFirstName] = useState(currentName.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(currentName.split(' ').slice(1).join(' '));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!trimmed) return;
    setError(null);
    setSubmitting(true);
    try {
      const updated = await apiFetch<User>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ name: trimmed }),
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte uppdatera namnet');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <h3 className="text-lg font-semibold text-text">Redigera namn</h3>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="editFirstName" className="text-sm text-muted">
              Förnamn
            </label>
            <input
              id="editFirstName"
              type="text"
              autoFocus
              maxLength={50}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="editLastName" className="text-sm text-muted">
              Efternamn
            </label>
            <input
              id="editLastName"
              type="text"
              maxLength={50}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="mt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Sparar…' : 'Spara'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
