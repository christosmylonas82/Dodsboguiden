import { useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import { ModalOverlay } from './ModalOverlay';

export function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte skicka meddelandet. Försök igen senare.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Kontakta oss</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="mt-5">
            <p className="rounded-lg border border-success bg-success-light px-4 py-2.5 text-sm text-text">
              Tack för ditt meddelande! Vi återkommer så snart vi kan.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              Stäng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contactName" className="text-sm text-muted">
                Namn
              </label>
              <input
                id="contactName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contactEmail" className="text-sm text-muted">
                E-post
              </label>
              <input
                id="contactEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border border-border px-4 text-text focus:border-2 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contactMessage" className="text-sm text-muted">
                Meddelande
              </label>
              <textarea
                id="contactMessage"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-lg border border-border px-4 py-2.5 text-text focus:border-2 focus:border-primary focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Skickar…' : 'Skicka meddelande'}
            </button>
          </form>
        )}
      </div>
    </ModalOverlay>
  );
}
