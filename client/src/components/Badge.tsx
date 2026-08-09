import type { ReactNode } from 'react';

export type BadgeTone = 'success' | 'warning' | 'neutral' | 'danger';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  neutral: 'bg-primary-light text-muted',
  danger: 'bg-danger-light text-danger',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
