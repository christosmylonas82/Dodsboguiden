import { useState, type FormEvent } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { ApiError } from '../lib/api';

export function EmailPromptModal({
  onSave,
  onSkip,
}: {
  onSave: (email: string) => Promise<void>;
  onSkip: () => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSave(email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte spara e-postadressen');
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onSkip}>
      <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)] sm:p-6">
        <h3 className="text-lg font-semibold text-text">Vill du registrera din e-post?</h3>
        <p className="mt-2 text-sm text-muted">
          Med en e-postadress kan vi skicka notifieringar om ditt dödsbo, till exempel när någon bjuder in dig eller
          en deadline närmar sig.
        </p>

        {showInput ? (
          <form onSubmit={handleSubmit} className="mt-4">
            <label htmlFor="promptEmail" className="text-xs font-medium uppercase tracking-wide text-muted">
              E-postadress
            </label>
            <input
              id="promptEmail"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
            />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Sparar…' : 'Spara e-post'}
            </button>
          </form>
        ) : (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="flex-1 rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              Ja, registrera
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
            >
              Nej, fortsätt utan
            </button>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
