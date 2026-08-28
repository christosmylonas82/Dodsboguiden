import type { BadgeTone } from './Badge';

const FILL_CLASS: Record<BadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  neutral: 'bg-muted',
  danger: 'bg-danger',
  primary: 'bg-primary',
};

export function ProgressBar({ percent, tone }: { percent: number; tone?: BadgeTone }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-primary-light">
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${tone ? FILL_CLASS[tone] : 'bg-primary'}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
