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
      className={`inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-medium leading-none ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
