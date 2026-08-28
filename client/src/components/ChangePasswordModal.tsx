import { useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import { ModalOverlay } from './ModalOverlay';

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Lösenorden matchar inte');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte ändra lösenord');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <h3 className="text-lg font-semibold text-text">Ändra lösenord</h3>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currentPassword" className="text-sm text-muted">
              Nuvarande lösenord
            </label>
            <input
              id="currentPassword"
              type="password"
              autoFocus
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="text-sm text-muted">
              Nytt lösenord
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-muted">Minst 8 tecken, med både versaler, gemener och siffror.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmNewPassword" className="text-sm text-muted">
              Bekräfta nytt lösenord
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {submitting ? 'Uppdaterar…' : 'Uppdatera lösenord'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
