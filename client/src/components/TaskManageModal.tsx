import { useState } from 'react';
import type { ProjectMember, Task, TaskStatus } from '../lib/types';
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER, TASK_STATUS_TONES } from '../lib/taskStatus';
import { ModalOverlay } from './ModalOverlay';

export function TaskManageModal({
  task,
  members,
  onClose,
  onSave,
}: {
  task: Task;
  members: ProjectMember[];
  onClose: () => void;
  onSave: (updates: { status: TaskStatus; assignedTo: string | null }) => Promise<void>;
}) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [assignedTo, setAssignedTo] = useState<string>(task.assignedTo ?? '');
  const [saving, setSaving] = useState(false);

  const assignableMembers = members.filter((m) => m.userId && m.user);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ status, assignedTo: assignedTo || null });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-text">{task.title}</h3>

        <div className="mt-5">
          <p className="text-sm font-medium text-muted">Status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TASK_STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  status === s
                    ? `border-transparent font-medium ${
                        TASK_STATUS_TONES[s] === 'success'
                          ? 'bg-success text-white'
                          : TASK_STATUS_TONES[s] === 'warning'
                            ? 'bg-warning text-white'
                            : 'bg-primary text-white'
                      }`
                    : 'border-border bg-surface text-text hover:bg-primary-light'
                }`}
              >
                {TASK_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="assignee" className="text-sm font-medium text-muted">
            Tilldela familjemedlem
          </label>
          <select
            id="assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2.5 text-text focus:border-primary focus:outline-none"
          >
            <option value="">Ingen</option>
            {assignableMembers.map((m) => (
              <option key={m.id} value={m.userId!}>
                {m.user!.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Sparar…' : 'Spara'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
