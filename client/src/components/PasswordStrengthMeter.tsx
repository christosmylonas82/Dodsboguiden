import { PASSWORD_REQUIREMENTS } from '../lib/passwordRequirements';

const STRENGTH_LABELS = ['Svagt', 'Svagt', 'Svagt', 'Medel', 'Medel', 'Starkt'] as const;
const STRENGTH_COLORS = ['bg-danger', 'bg-danger', 'bg-danger', 'bg-warning', 'bg-warning', 'bg-success'] as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  const results = PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    met: requirement.test(password),
  }));
  const metCount = results.filter((r) => r.met).length;

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${STRENGTH_COLORS[metCount]}`}
          style={{ width: `${(metCount / results.length) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted">Lösenordsstyrka: {STRENGTH_LABELS[metCount]}</p>
      <ul className="mt-1.5 grid grid-cols-1 gap-y-0.5 text-xs sm:grid-cols-2">
        {results.map((requirement) => (
          <li key={requirement.key} className={requirement.met ? 'text-success' : 'text-muted'}>
            {requirement.met ? '✓' : '○'} {requirement.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
