import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Länken saknar en giltig token.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte återställa lösenordet');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold text-text">Återställ lösenord</h1>

      {done ? (
        <div className="mt-5">
          <p className="text-sm text-text">Ditt lösenord har uppdaterats.</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-primary-dark"
          >
            Logga in
          </button>
        </div>
      ) : !token ? (
        <p className="mt-5 text-sm text-danger">
          Länken saknar en token. Be en administratör om en ny återställningslänk.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="newPassword" className="text-xs font-medium uppercase tracking-wide text-muted">
            Nytt lösenord
          </label>
          <input
            id="newPassword"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
          />

          <label htmlFor="confirmPassword" className="mt-4 block text-xs font-medium uppercase tracking-wide text-muted">
            Bekräfta lösenord
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
          />

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? 'Sparar…' : 'Spara nytt lösenord'}
          </button>

          <p className="mt-4 text-center text-sm text-muted">
            <Link to="/login" className="text-primary-dark hover:underline">
              Tillbaka till inloggning
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
