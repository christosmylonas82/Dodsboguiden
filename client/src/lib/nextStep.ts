import type { Task } from './types';
import { PHASES } from './phases';
import { tasksForProgress } from './taskStatus';

export type NextStepCtaLabel = 'Börja' | 'Fortsätt' | 'Visa';

export interface NextStepResult {
  task: Task;
  phase: Task['phase'];
  ctaLabel: NextStepCtaLabel;
}

/**
 * Derives the single most relevant "next thing to do" from already-loaded
 * project tasks — first incomplete task, walking phases in their natural
 * order. Pure client-side derivation (no new endpoint) so this stays a
 * UI-only concern.
 */
export function findNextStep(allTasks: Task[]): NextStepResult | null {
  for (const phase of PHASES) {
    const phaseTasks = tasksForProgress(allTasks.filter((t) => t.phase === phase));
    const next = phaseTasks.find((t) => !t.completed);
    if (!next) continue;
    const anyStarted = phaseTasks.some((t) => t.completed || t.status === 'IN_PROGRESS');
    const ctaLabel: NextStepCtaLabel = next.status === 'IN_PROGRESS' || anyStarted ? 'Fortsätt' : 'Börja';
    return { task: next, phase, ctaLabel };
  }
  return null;
}
