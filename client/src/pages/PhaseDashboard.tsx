import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft, TbPlus, TbDownload } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { ProjectDetail, Task, TaskStatus } from '../lib/types';
import { HelpIcon } from '../components/HelpIcon';
import { TaskManageModal } from '../components/TaskManageModal';
import { TaskCard } from '../components/TaskCard';
import { TASK_STATUS_LABELS } from '../lib/taskStatus';
import { PHASE_DESCRIPTIONS, TASK_DESCRIPTIONS } from '../lib/taskDescriptions';
import { tasksForProgress } from '../lib/taskStatus';
import { DUE_DATE_TEXT_CLASS, formatDueDateHuman } from '../lib/dueDateUtils';
import { SCENARIO_OPTIONS, type ScenarioKey } from '../lib/scenarios';
import type { ExportTableOptions } from '../lib/export';

type PhaseFilter = 'ALL' | 'IN_PROGRESS' | 'PENDING' | 'DONE';

const FILTERS: { value: PhaseFilter; label: string }[] = [
  { value: 'ALL', label: 'Alla uppgifter' },
  { value: 'IN_PROGRESS', label: 'Pågår' },
  { value: 'PENDING', label: 'Ej påbörjade' },
  { value: 'DONE', label: 'Klara' },
];

/**
 * Phase-local export dropdown: consolidates the two previously-separate
 * "Tom mall" / "Fullständig" ExportMenu instances into one menu grouped by
 * content, so the choice reads as "what do I get" instead of two unlabeled
 * buttons. Kept local to this page (not a change to the shared ExportMenu
 * component, which several other modals still use as-is).
 */
function PhaseExportMenu({
  blankOptions,
  filledOptions,
}: {
  blankOptions: () => ExportTableOptions;
  filledOptions: () => ExportTableOptions;
}) {
  const [open, setOpen] = useState(false);

  async function run(kind: 'pdf' | 'docx' | 'csv', options: ExportTableOptions) {
    const lib = await import('../lib/export');
    if (kind === 'pdf') lib.exportTableToPdf(options);
    else if (kind === 'docx') lib.exportTableToDocx(options);
    else lib.exportTableToCsv(options);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3.5 py-2 text-sm font-medium text-text transition hover:bg-primary-light"
      >
        <TbDownload size={16} />
        Exportera
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs font-semibold text-text">Aktuell checklista</p>
              <p className="text-[11px] text-muted">Status, ansvariga, deadlines och anteckningar</p>
              <div className="mt-1.5 flex gap-1.5">
                <button type="button" onClick={() => run('pdf', filledOptions())} className="rounded-md bg-transparent px-2 py-1 text-xs text-link hover:underline">
                  PDF
                </button>
                <button type="button" onClick={() => run('docx', filledOptions())} className="rounded-md bg-transparent px-2 py-1 text-xs text-link hover:underline">
                  Word
                </button>
                <button type="button" onClick={() => run('csv', filledOptions())} className="rounded-md bg-transparent px-2 py-1 text-xs text-link hover:underline">
                  CSV
                </button>
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-text">Tom checklista</p>
              <p className="text-[11px] text-muted">Originalversion utan ändringar</p>
              <div className="mt-1.5 flex gap-1.5">
                <button type="button" onClick={() => run('pdf', blankOptions())} className="rounded-md bg-transparent px-2 py-1 text-xs text-link hover:underline">
                  PDF
                </button>
                <button type="button" onClick={() => run('docx', blankOptions())} className="rounded-md bg-transparent px-2 py-1 text-xs text-link hover:underline">
                  Word
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function PhaseDashboardPage({ phase }: { phase: Task['phase'] }) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [managingTaskId, setManagingTaskId] = useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [filter, setFilter] = useState<PhaseFilter>('ALL');

  function toggleExpanded(taskId: string) {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  async function reload() {
    if (!id) return;
    const p = await apiFetch<ProjectDetail>(`/projects/${id}`);
    setProject(p);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const memberNameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    project?.members.forEach((m) => {
      if (m.userId && m.user) map.set(m.userId, m.user.name);
    });
    return map;
  }, [project]);

  async function toggleTask(task: Task) {
    if (!id) return;
    await apiFetch(`/projects/${id}/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !task.completed }),
    });
    reload();
  }

  async function saveTask(
    task: Task,
    updates: { status: TaskStatus; assignedTo: string | null; notes: string | null; dueDate: string | null },
  ) {
    if (!id) return;
    await apiFetch(`/projects/${id}/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    reload();
  }

  async function addCustomTask(e: FormEvent) {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!id || !title) return;
    setAddingTask(true);
    try {
      await apiFetch(`/projects/${id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, phase }),
      });
      setNewTaskTitle('');
      await reload();
    } finally {
      setAddingTask(false);
    }
  }

  async function deleteCustomTask(task: Task) {
    if (!id) return;
    await apiFetch(`/projects/${id}/tasks/${task.id}`, { method: 'DELETE' });
    reload();
  }

  async function toggleScenario(key: ScenarioKey, value: boolean) {
    if (!id) return;
    await apiFetch(`/projects/${id}/scenarios`, {
      method: 'PATCH',
      body: JSON.stringify({ [key]: value }),
    });
    reload();
  }

  if (!project) return <p className="text-muted">Laddar…</p>;

  const tasks = project.tasks.filter((t) => t.phase === phase);
  const countedTasks = tasksForProgress(tasks);
  const doneCount = countedTasks.filter((t) => t.completed).length;
  const percent = countedTasks.length ? Math.round((doneCount / countedTasks.length) * 100) : 0;
  const managingTask = tasks.find((t) => t.id === managingTaskId) ?? null;
  const phaseSlug = phase.replace(/\s+/g, '-').toLowerCase();
  const nextTask = tasks.find((t) => t.status === 'IN_PROGRESS') ?? tasks.find((t) => t.status === 'PENDING') ?? null;
  const nextTaskDescription = nextTask ? (TASK_DESCRIPTIONS[nextTask.title] ?? nextTask.description) : null;
  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter);

  function blankTemplateOptions(): ExportTableOptions {
    return {
      title: `Checklista (tom mall) — ${phase}`,
      deceasedName: project!.deceasedName,
      headers: ['Uppgift', 'Klar (datum)', 'Ansvarig', 'Kommentar'],
      rows: tasks.map((t) => [t.title, '', '', '']),
      filenamePrefix: `checklista-mall-${phaseSlug}`,
    };
  }

  function filledExportOptions(): ExportTableOptions {
    return {
      title: `Checklista — ${phase}`,
      deceasedName: project!.deceasedName,
      headers: ['Uppgift', 'Status', 'Ansvarig', 'Förfallodatum', 'Kommentar'],
      rows: tasks.map((t) => [
        t.title,
        TASK_STATUS_LABELS[t.status],
        t.assignedUser?.name ?? t.responsibleRole ?? '—',
        t.dueDate ? new Date(t.dueDate).toLocaleDateString('sv-SE') : '—',
        t.notes ?? '—',
      ]),
      filenamePrefix: `checklista-${phaseSlug}`,
    };
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/projects/${id}/dashboard`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <TbArrowLeft size={16} />
            Tillbaka till dashboard
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold text-text">{phase}</h1>
            <HelpIcon text={PHASE_DESCRIPTIONS[phase]} />
          </div>
          <p className="mt-1 text-sm text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
        </div>

        <div className="flex flex-row items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-start">
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] leading-none font-semibold text-text">{percent}%</span>
              <span className="text-xs tracking-wide text-muted uppercase">klar</span>
            </div>
            <div className="h-1.5 w-[120px] overflow-hidden rounded-full bg-primary-light">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-xs text-muted">
              {doneCount} av {countedTasks.length} klara
            </span>
          </div>
          <PhaseExportMenu blankOptions={blankTemplateOptions} filledOptions={filledExportOptions} />
        </div>
      </div>

      {nextTask ? (
        <section className="mt-8 border-l-4 border-primary bg-bg py-4 pr-4 pl-5">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Nästa steg</p>
          <h2 className="mt-1 text-lg font-semibold text-text">{nextTask.title}</h2>
          {nextTaskDescription && <p className="mt-1 text-sm text-muted">{nextTaskDescription}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {nextTask.dueDate && (
              <span className={`text-xs font-medium ${DUE_DATE_TEXT_CLASS[nextTask.dueDateStatus ?? 'no_date']}`}>
                Deadline {formatDueDateHuman(nextTask.dueDate)}
              </span>
            )}
            <button
              type="button"
              onClick={() => setManagingTaskId(nextTask.id)}
              className="bg-transparent p-0 text-sm font-medium text-primary-dark hover:underline"
            >
              Öppna uppgift →
            </button>
          </div>
        </section>
      ) : (
        <p className="mt-8 text-sm text-muted italic">Alla uppgifter i denna fas är klara!</p>
      )}

      {phase === 'Inför bouppteckning' && (
        <div className="mt-6 rounded-xl border border-border bg-bg p-4">
          <p className="text-sm font-medium text-text">Är dödsboet mer komplext?</p>
          <p className="mt-1 text-xs text-muted">
            Kryssa i det som stämmer så lägger vi till relevanta extra punkter i checklistan nedan.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {SCENARIO_OPTIONS.map((option) => (
              <label key={option.key} className="flex items-start gap-2.5 text-sm text-text">
                <input
                  type="checkbox"
                  checked={project[option.key]}
                  onChange={(e) => toggleScenario(option.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              filter === f.value
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-transparent text-text hover:bg-primary-light'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-col">
        {filteredTasks.length === 0 ? (
          <p className="py-6 text-sm text-muted">Inga uppgifter matchar filtret.</p>
        ) : (
          filteredTasks.map((task) => {
            const completedByName = task.completedBy ? memberNameByUserId.get(task.completedBy) : null;
            const description = task.description ?? TASK_DESCRIPTIONS[task.title] ?? null;
            return (
              <TaskCard
                key={task.id}
                task={task}
                description={description}
                completedByName={completedByName ?? null}
                expanded={expandedTaskIds.has(task.id)}
                onToggleExpanded={() => toggleExpanded(task.id)}
                onToggleComplete={() => toggleTask(task)}
                onManage={() => setManagingTaskId(task.id)}
                onDelete={() => deleteCustomTask(task)}
              />
            );
          })
        )}
      </div>

      <form
        onSubmit={addCustomTask}
        className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Lägg till egen uppgift…"
          className="flex-1 h-11 rounded-lg border border-border bg-surface px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={addingTask || !newTaskTitle.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          <TbPlus size={16} />
          Lägg till
        </button>
      </form>

      {managingTask && (
        <TaskManageModal
          task={managingTask}
          members={project.members}
          onClose={() => setManagingTaskId(null)}
          onSave={(updates) => saveTask(managingTask, updates)}
        />
      )}
    </div>
  );
}
