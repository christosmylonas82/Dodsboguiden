import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TbPlus } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { ProjectSummary } from '../lib/types';
import { Badge } from '../components/Badge';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { TipsModal } from '../components/TipsModal';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, markTipsSeen } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tipsModalOpen, setTipsModalOpen] = useState(false);

  useEffect(() => {
    apiFetch<ProjectSummary[]>('/projects').then(setProjects).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (user && !user.hasSeenTipsOnboarding) {
      setTipsModalOpen(true);
    }
  }, [user]);

  function closeTipsModal() {
    setTipsModalOpen(false);
    if (user && !user.hasSeenTipsOnboarding) {
      markTipsSeen();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">Mina dödsbon</h1>
          <p className="mt-1 text-muted">Håll koll på bouppteckningen tillsammans med din familj.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-primary-dark"
        >
          <TbPlus size={20} />
          Skapa dödsbo
        </button>
      </div>

      <div className="mt-8">
        {projects === null && <p className="text-muted">Laddar…</p>}
        {projects?.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
            När du är redo finns vi här. Skapa ditt första dödsbo för att komma igång.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {projects?.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}/dashboard`}
              className="block rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-text">{p.deceasedName}</h3>
                <Badge tone={p.progress === 100 ? 'success' : p.hasStarted ? 'primary' : 'neutral'}>
                  {p.progress === 100 ? 'Klar' : p.hasStarted ? 'Pågår' : 'Ej påbörjad'}
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

      {createModalOpen && (
        <CreateProjectModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={(projectId) => navigate(`/projects/${projectId}/dashboard`)}
        />
      )}

      {tipsModalOpen && <TipsModal onClose={closeTipsModal} />}
    </div>
  );
}
