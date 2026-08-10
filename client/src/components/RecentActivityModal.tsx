import { Link } from 'react-router-dom';
import type { ActivityEntry } from '../lib/types';
import { formatActivityAction, formatTimestamp } from '../lib/activity';
import { ModalOverlay } from './ModalOverlay';

export function RecentActivityModal({
  projectId,
  activity,
  onClose,
}: {
  projectId: string;
  activity: ActivityEntry[];
  onClose: () => void;
}) {
  const recent = activity.slice(0, 5);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Senaste aktivitet</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        {recent.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Ingen aktivitet än.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {recent.map((entry) => (
              <li key={entry.id} className="text-sm text-text">
                <span className="font-medium">{entry.user.name}</span> {formatActivityAction(entry.action)}
                <p className="text-xs text-muted">{formatTimestamp(entry.timestamp)}</p>
              </li>
            ))}
          </ul>
        )}

        <hr className="my-5 border-border" />

        <p className="text-sm text-muted">
          För att se utökad aktivitet, gå in på{' '}
          <Link to={`/projects/${projectId}/activity`} onClick={onClose} className="text-primary hover:underline">
            Aktivitetsloggen
          </Link>
        </p>
      </div>
    </ModalOverlay>
  );
}
