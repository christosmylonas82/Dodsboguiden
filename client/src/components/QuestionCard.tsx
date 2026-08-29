import { ProgressBar } from './ProgressBar';

export function QuestionCard({
  questionNumber,
  totalQuestions,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  subtitle?: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={(questionNumber / totalQuestions) * 100} />
        </div>
        <span className="text-sm font-medium text-muted">
          Fråga {questionNumber} av {totalQuestions}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-text">{title}</h3>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}

      <div className="mt-5 flex flex-col gap-2.5">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 transition ${
              selected === option.value
                ? 'border-primary bg-primary-light'
                : 'border-border bg-transparent hover:bg-primary-light'
            }`}
          >
            <input
              type="radio"
              checked={selected === option.value}
              onChange={() => onSelect(option.value)}
              className="h-5 w-5 shrink-0 accent-[var(--color-primary)]"
            />
            <span className="text-sm font-medium text-text">{option.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Tillbaka
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          Nästa
        </button>
      </div>
    </div>
  );
}
