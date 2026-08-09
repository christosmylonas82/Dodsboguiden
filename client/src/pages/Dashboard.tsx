import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, ApiError } from '../lib/api';
import type { ProjectSummary } from '../lib/types';
import { Badge } from '../components/Badge';

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
      <h1 className="text-3xl font-semibold text-text">Mina dödsbon</h1>
      <p className="mt-1 text-muted">Håll koll på bouppteckningen tillsammans med din familj.</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Starta ett nytt dödsbo</h2>
        <form onSubmit={handleCreate} className="mt-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="deceasedName" className="text-sm text-muted">
              Den avlidnes namn
            </label>
            <input
              id="deceasedName"
              type="text"
              required
              value={deceasedName}
              onChange={(e) => setDeceasedName(e.target.value)}
              className="rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            />
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {creating ? 'Skapar…' : 'Skapa dödsbo'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        {projects === null && <p className="text-muted">Laddar…</p>}
        {projects?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted">
            Du har inga dödsbon ännu.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {projects?.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="block rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-text">{p.deceasedName}</h3>
                <Badge tone={p.progress === 100 ? 'success' : p.progress === 0 ? 'neutral' : 'warning'}>
                  {p.progress === 100 ? 'Klar' : p.progress === 0 ? 'Ej påbörjad' : 'Pågår'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {p.memberCount} {p.memberCount === 1 ? 'medlem' : 'medlemmar'} · {p.progress}% klart
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-light">
                <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
