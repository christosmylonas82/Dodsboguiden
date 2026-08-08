import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import type { ProjectSummary } from '../lib/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [deceasedName, setDeceasedName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ProjectSummary[]>('/projects').then(setProjects).catch(() => setProjects([]));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const project = await apiFetch<{ id: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify({ deceasedName }),
      });
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte skapa dödsbo');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1>Mina dödsbon</h1>

      <div className="card">
        <h2>Starta ett nytt dödsbo</h2>
        <form onSubmit={handleCreate}>
          <div className="form-field">
            <label htmlFor="deceasedName">Den avlidnes namn</label>
            <input
              id="deceasedName"
              type="text"
              required
              value={deceasedName}
              onChange={(e) => setDeceasedName(e.target.value)}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={creating}>
            {creating ? 'Skapar…' : 'Skapa dödsbo'}
          </button>
        </form>
      </div>

      {projects === null && <p>Laddar…</p>}
      {projects?.length === 0 && <p>Du har inga dödsbon ännu.</p>}
      {projects?.map((p) => (
        <Link key={p.id} to={`/projects/${p.id}`} className="project-list-item">
          <div className="card">
            <h3>{p.deceasedName}</h3>
            <p style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              {p.memberCount} {p.memberCount === 1 ? 'medlem' : 'medlemmar'} · {p.progress}% klart
            </p>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
