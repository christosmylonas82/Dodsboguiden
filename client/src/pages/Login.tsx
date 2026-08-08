import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte logga in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>Logga in</h1>
      <p>Vi finns här för att hjälpa dig genom en enkel bouppteckning.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">E-post</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="password">Lösenord</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Loggar in…' : 'Logga in'}</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Inget konto än? <Link to="/register">Registrera dig</Link>
      </p>
    </div>
  );
}
