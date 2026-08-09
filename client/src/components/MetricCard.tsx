import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        {icon && <span className="shrink-0 text-muted">{icon}</span>}
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold text-text">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
