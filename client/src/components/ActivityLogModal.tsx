import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import type { ActivityEntry } from '../lib/types';
import { formatActivityAction, formatTimestamp } from '../lib/activity';
import { Avatar } from './Avatar';
import { ModalOverlay } from './ModalOverlay';

export function ActivityLogModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ActivityEntry[]>(`/projects/${projectId}/activity?limit=15`)
      .then(setActivity)
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Aktivitetslogg</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : activity.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Ingen aktivitet än.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {activity.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <Avatar name={entry.user.name} imageUrl={entry.user.profileImageUrl} userId={entry.user.id} size="sm" />
                <div className="text-sm text-text">
                  <span className="font-medium">{entry.user.name}</span> {formatActivityAction(entry.action)}
                  <p className="text-xs text-muted">{formatTimestamp(entry.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <hr className="my-5 border-border" />

        <p className="text-sm text-muted">
          Se{' '}
          <Link to={`/projects/${projectId}/activity`} onClick={onClose} className="text-primary hover:underline">
            all aktivitet i Aktivitetsloggen
          </Link>
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
