import type { Task } from '../lib/types';
import { PHASES, phaseStatus } from '../lib/phases';
import { tasksForProgress } from '../lib/taskStatus';
import { HELP_TEXT } from '../lib/helpText';
import { HelpIcon } from './HelpIcon';
import { ModalOverlay } from './ModalOverlay';
import { ProgressBar } from './ProgressBar';

export function ProgressOverviewModal({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  const countedTasks = tasksForProgress(tasks);
  const doneCount = countedTasks.filter((t) => t.completed).length;
  const totalPercent = countedTasks.length ? Math.round((doneCount / countedTasks.length) * 100) : 0;

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Framsteg överblick</h3>
          <div className="flex items-center gap-1">
            <HelpIcon text={HELP_TEXT.progressOverviewModal} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-text">
            Totalt: {totalPercent}% klart ({doneCount} av {countedTasks.length})
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
            const countedPhaseTasks = tasksForProgress(phaseTasks);
            const phaseDone = countedPhaseTasks.filter((t) => t.completed).length;
            const percent = countedPhaseTasks.length ? Math.round((phaseDone / countedPhaseTasks.length) * 100) : 100;
            const status = phaseStatus(phaseTasks);
            return (
              <div key={phase}>
                <p className="text-sm font-medium text-text">{phase}</p>
                <div className="mt-2">
                  <ProgressBar percent={percent} tone={status.tone} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {phaseDone} av {countedPhaseTasks.length} klara
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
