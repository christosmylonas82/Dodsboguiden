import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { ActivityEntry } from '../lib/types';
import { formatActivityAction, formatTimestamp } from '../lib/activity';
import { Avatar } from '../components/Avatar';

export function ProjectActivityPage() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<ActivityEntry[]>(`/projects/${id}/activity`).then(setActivity);
  }, [id]);

  if (!activity) return <p className="text-muted">Laddar…</p>;

  return (
    <div>
      <Link
        to={`/projects/${id}/dashboard`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-dark"
      >
        <TbArrowLeft size={16} />
        Tillbaka till översikt
      </Link>
      <p className="mt-3 text-xs text-muted">Dashboard &gt; Aktivitetslogg</p>

      <h1 className="mt-2 text-3xl font-semibold text-text">Aktivitetslogg</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {activity.length === 0 ? (
          <p className="text-sm text-muted">Ingen aktivitet än.</p>
        ) : (
          <ul className="flex flex-col">
            {activity.map((entry) => (
              <li key={entry.id} className="flex gap-3 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0">
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
      </div>
    </div>
  );
}
