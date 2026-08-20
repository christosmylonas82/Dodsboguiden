import { useEffect, useState } from 'react';
import { TbAlertTriangle, TbExternalLink, TbCopy, TbCheck } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { PostManagementTask, PostTaskType, ProjectDetail } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

const TASK_META: Record<PostTaskType, { title: string; description: string; link: { label: string; href: string } }> = {
  ADDRESS_CHANGE: {
    title: '1. Adressändring (SKV 8403)',
    description:
      'Om dödsboet har en annan adress än vid dödsfallet är det viktigt att göra en adressändring — annars eftersänds inte deklarationsblanketten, utan Posten skickar tillbaka den till Skatteverket.',
    link: { label: 'Skatteverket — adressändring för dödsbo', href: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/anmalnyadressfordodsbo.4.3528414214b3f8758056b6.html' },
  },
  MAIL_FORWARDING: {
    title: '2. Eftersändning (12 månader)',
    description: 'Den som har hand om dödsboet kan beställa eftersändning av post i 12 månader.',
    link: { label: 'adressandring.se', href: 'https://www.adressandring.se' },
  },
  AD_BLOCK: {
    title: '3. Reklamspärr (SPAR)',
    description:
      'För att spärra direktadresserad reklam till den avlidne i SPAR (Statens personadressregister), mejla spar@skatteverket.se med namn och personnummer.',
    link: { label: 'spar.se', href: 'https://www.spar.se' },
  },
};

const TASK_ORDER: PostTaskType[] = ['ADDRESS_CHANGE', 'MAIL_FORWARDING', 'AD_BLOCK'];

function aprilDeadline(deceasedDate: string): { label: string; daysLeft: number } {
  const death = new Date(deceasedDate);
  const deadlineYear = death.getFullYear() + 1;
  const deadline = new Date(deadlineYear, 3, 1); // April 1 — the earliest point "in April", so the countdown never overstates time left
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { label: `april ${deadlineYear}`, daysLeft };
}

export function PostManagementModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<PostManagementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<ProjectDetail>(`/projects/${projectId}`),
      apiFetch<PostManagementTask[]>(`/projects/${projectId}/post-management`),
    ]).then(([p, t]) => {
      setProject(p);
      setTasks(t);
    }).finally(() => setLoading(false));
  }, [projectId]);

  function taskFor(type: PostTaskType) {
    return tasks.find((t) => t.taskType === type) ?? null;
  }

  async function ensureTask(type: PostTaskType): Promise<PostManagementTask> {
    const existing = taskFor(type);
    if (existing) return existing;
    const created = await apiFetch<PostManagementTask>(`/projects/${projectId}/post-management`, {
      method: 'POST',
      body: JSON.stringify({ taskType: type }),
    });
    setTasks((prev) => [...prev, created]);
    return created;
  }

  async function toggleDone(type: PostTaskType) {
    const task = await ensureTask(type);
    const nextStatus = task.status === 'DONE' ? 'PENDING' : 'DONE';
    const updated = await apiFetch<PostManagementTask>(`/projects/${projectId}/post-management/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function saveAddress() {
    const task = await ensureTask('ADDRESS_CHANGE');
    const updated = await apiFetch<PostManagementTask>(`/projects/${projectId}/post-management/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ newAddress }),
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function copySparTemplate() {
    const text = `Namn: ${project?.deceasedName ?? '[den avlidnes namn]'}\nPersonnummer: [personnummer]\n\nJag vill spärra direktadresserad reklam för ovanstående person.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const deadline = project?.deceasedDate ? aprilDeadline(project.deceasedDate) : null;

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Post- & adresshantering</h3>
          <button type="button" onClick={onClose} aria-label="Stäng" className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : (
          <>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning bg-warning-light p-4 text-sm">
              <TbAlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="font-semibold text-text">Adressändringen bör vara klar innan april</p>
                {deadline ? (
                  <p className="mt-1 text-text">
                    {deadline.daysLeft >= 0
                      ? `Ungefär ${deadline.daysLeft} dagar kvar till ${deadline.label}.`
                      : `${deadline.label} har passerat.`}
                  </p>
                ) : (
                  <p className="mt-1 text-text">Inget dödsdatum är angivet för dödsboet.</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {TASK_ORDER.map((type) => {
                const meta = TASK_META[type];
                const task = taskFor(type);
                const done = task?.status === 'DONE';
                return (
                  <div key={type} className="rounded-xl border border-border bg-bg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-text">{meta.title}</h4>
                      <button
                        type="button"
                        onClick={() => toggleDone(type)}
                        className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          done ? 'border-success bg-success-light text-success' : 'border-border bg-transparent text-text hover:bg-primary-light'
                        }`}
                      >
                        {done ? '✓ Klart' : 'Markera som gjord'}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">{meta.description}</p>

                    {type === 'ADDRESS_CHANGE' && (
                      <div className="mt-3 flex gap-2">
                        <input
                          placeholder="Ny adress för dödsboet"
                          defaultValue={task?.newAddress ?? ''}
                          onChange={(e) => setNewAddress(e.target.value)}
                          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={saveAddress}
                          className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-primary-light"
                        >
                          Spara
                        </button>
                      </div>
                    )}

                    {type === 'AD_BLOCK' && (
                      <button
                        type="button"
                        onClick={copySparTemplate}
                        className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-primary-light"
                      >
                        {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
                        {copied ? 'Kopierad!' : 'Kopiera mejl till SPAR'}
                      </button>
                    )}

                    <a
                      href={meta.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:underline"
                    >
                      {meta.link.label}
                      <TbExternalLink size={12} />
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <button type="button" onClick={onClose} className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light">
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
