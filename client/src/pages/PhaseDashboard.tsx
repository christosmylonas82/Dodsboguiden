import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft, TbExternalLink, TbPlus } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { ProjectDetail, Task, TaskStatus } from '../lib/types';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { TaskManageModal } from '../components/TaskManageModal';
import { TaskCard } from '../components/TaskCard';
import { PHASE_DESCRIPTIONS, TASK_DESCRIPTIONS } from '../lib/taskDescriptions';
import { phaseStatus } from '../lib/phases';
import { tasksForProgress } from '../lib/taskStatus';

export function PhaseDashboardPage({ phase }: { phase: Task['phase'] }) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [managingTaskId, setManagingTaskId] = useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

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

  if (!project) return <p className="text-muted">Laddar…</p>;

  const tasks = project.tasks.filter((t) => t.phase === phase);
  const status = phaseStatus(tasks);
  const countedTasks = tasksForProgress(tasks);
  const doneCount = countedTasks.filter((t) => t.completed).length;
  const percent = countedTasks.length ? Math.round((doneCount / countedTasks.length) * 100) : 0;
  const managingTask = tasks.find((t) => t.id === managingTaskId) ?? null;

  return (
    <div>
      <Link to={`/projects/${id}/dashboard`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-dark">
        <TbArrowLeft size={16} />
        Tillbaka till dashboard
      </Link>
      <p className="mt-3 text-xs text-muted">Dashboard &gt; {phase}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-semibold text-text">{phase}</h1>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span className="text-sm text-muted">
          {doneCount} av {countedTasks.length} klara
        </span>
      </div>
      <p className="mt-1 text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
      <a
        href="https://www.efterlevandeguiden.se/checklista-efter-ett-dodsfall.html"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 text-xs text-muted hover:text-primary-dark hover:underline"
      >
        📖 Checklista baserad på Efterlevandeguiden
        <TbExternalLink size={12} />
      </a>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={percent} />
        </div>
        <span className="text-sm font-medium text-text">{percent}%</span>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {tasks.map((task) => {
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
        })}
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
