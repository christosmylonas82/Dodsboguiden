import { useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import type { User } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

export function ChangeEmailModal({
  currentEmail,
  onClose,
  onUpdated,
}: {
  currentEmail: string;
  onClose: () => void;
  onUpdated: (user: User) => void;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const updated = await apiFetch<User>('/auth/email', {
        method: 'PUT',
        body: JSON.stringify({ newEmail, password }),
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte ändra email');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-text">Ändra email</h3>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted">Nuvarande email</p>
            <p className="text-sm text-text">{currentEmail}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newEmail" className="text-sm text-muted">
              Nytt email
            </label>
            <input
              id="newEmail"
              type="email"
              autoFocus
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm text-muted">
              Bekräfta lösenord
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="mt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Uppdaterar…' : 'Uppdatera email'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
