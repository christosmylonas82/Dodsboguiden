import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError('Du måste godkänna hur vi hanterar dina uppgifter för att fortsätta.');
      return;
    }
    setSubmitting(true);
    try {
      await register(email, name, password, consent);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte skapa konto');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>Skapa konto</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Namn</label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="email">E-post</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="password">Lösenord (minst 8 tecken)</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <label className="checkbox-field">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Jag godkänner att mina uppgifter behandlas enligt{' '}
          <Link to="/settings">integritetspolicyn</Link>.
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting} style={{ marginTop: '1rem' }}>
          {submitting ? 'Skapar konto…' : 'Skapa konto'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Har du redan ett konto? <Link to="/login">Logga in</Link>
      </p>
    </div>
  );
}
