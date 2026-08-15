import { Link } from 'react-router-dom';
import type { ActivityEntry } from '../lib/types';
import { formatActivityAction, formatTimestamp } from '../lib/activity';
import { Avatar } from './Avatar';
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
          <ul className="mt-5 flex flex-col">
            {recent.map((entry, index) => (
              <li
                key={entry.id}
                className={`flex items-start gap-3 py-3 first:pt-0 last:pb-0 ${
                  index < recent.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <Avatar name={entry.user.name} imageUrl={entry.user.profileImageUrl} userId={entry.user.id} size="md" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-text">{entry.user.name}</span>
                  <span className="text-sm text-muted">{formatActivityAction(entry.action)}</span>
                  <span className="text-xs text-muted/80">{formatTimestamp(entry.timestamp)}</span>
                </div>
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
