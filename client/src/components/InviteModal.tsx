import { useState, type FormEvent } from 'react';
import { ModalOverlay } from './ModalOverlay';

export function InviteModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onInvite(email);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte bjuda in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <h3 className="text-lg font-semibold text-text">Bjud in familjemedlem</h3>
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="inviteEmail" className="text-sm text-muted">
              E-postadress
            </label>
            <input
              id="inviteEmail"
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
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
              disabled={submitting}
              className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Bjuder in…' : 'Bjud in'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
