import type { BadgeTone } from './Badge';

const DOT_COLOR: Record<BadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  neutral: 'bg-muted',
  danger: 'bg-danger',
  primary: 'bg-primary',
};

/**
 * Discreet text-only status indicator (colored dot + uppercase label), used
 * in place of the heavier pill-shaped Badge within the project dashboard,
 * where a row of loud colored badges reads as more "SaaS template" than the
 * calm, content-first tone the dashboard is going for.
 */
export function StatusLabel({ tone, children }: { tone: BadgeTone; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLOR[tone]}`} />
      {children}
    </span>
  );
}
