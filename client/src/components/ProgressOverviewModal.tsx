import type { Task } from '../lib/types';
import { PHASES, phaseStatus } from '../lib/phases';
import { ModalOverlay } from './ModalOverlay';
import { ProgressBar } from './ProgressBar';

export function ProgressOverviewModal({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  const doneCount = tasks.filter((t) => t.completed).length;
  const totalPercent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Framsteg överblick</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-text">
            Totalt: {totalPercent}% klart ({doneCount} av {tasks.length})
          </p>
          <div className="mt-2">
            <ProgressBar percent={totalPercent} />
          </div>
        </div>

        <hr className="my-5 border-border" />

        <div className="flex flex-col gap-4">
          {PHASES.map((phase) => {
            const phaseTasks = tasks.filter((t) => t.phase === phase);
            if (phaseTasks.length === 0) return null;
            const phaseDone = phaseTasks.filter((t) => t.completed).length;
            const percent = Math.round((phaseDone / phaseTasks.length) * 100);
            const status = phaseStatus(phaseTasks);
            return (
              <div key={phase}>
                <p className="text-sm font-medium text-text">{phase}</p>
                <div className="mt-2">
                  <ProgressBar percent={percent} tone={status.tone} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {phaseDone} av {phaseTasks.length} klara
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
