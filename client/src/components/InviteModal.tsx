import { useState, type FormEvent } from 'react';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
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
              className="rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            />
          </div>
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
              {submitting ? 'Bjuder in…' : 'Bjud in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
