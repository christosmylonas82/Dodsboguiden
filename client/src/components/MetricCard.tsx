import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  hint,
  icon,
  onClick,
  headerRight,
  centered,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  onClick?: () => void;
  headerRight?: ReactNode;
  centered?: boolean;
}) {
  const content = (
    <>
      <div className={`flex items-center gap-2 ${headerRight ? 'justify-between' : centered ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0 text-muted">{icon}</span>}
          <span className="text-sm font-medium text-muted">{label}</span>
        </div>
        {headerRight}
      </div>
      <p className={`mt-2 text-3xl font-semibold text-text ${centered ? 'text-center' : ''}`}>{value}</p>
      {hint && <p className={`mt-1 text-sm text-muted ${centered ? 'text-center' : ''}`}>{hint}</p>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="h-full w-full rounded-xl border border-card-accent-border bg-card-accent p-5 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md"
      >
        {content}
      </button>
    );
  }

  return <div className="h-full w-full rounded-xl border border-card-accent-border bg-card-accent p-5 shadow-sm">{content}</div>;
}
