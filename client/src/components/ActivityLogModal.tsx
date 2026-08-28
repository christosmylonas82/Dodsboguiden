import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import type { ActivityEntry } from '../lib/types';
import { formatActivityAction, formatTimestamp } from '../lib/activity';
import { Avatar } from './Avatar';
import { ExportMenu } from './ExportMenu';
import { ModalOverlay } from './ModalOverlay';

export function ActivityLogModal({
  projectId,
  projectName,
  onClose,
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
}) {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ActivityEntry[]>(`/projects/${projectId}/activity?limit=15`)
      .then(setActivity)
      .finally(() => setLoading(false));
  }, [projectId]);

  function exportOptions() {
    return {
      title: 'Aktivitetslogg',
      deceasedName: projectName,
      headers: ['Användare', 'Vad som gjordes', 'Tidpunkt'],
      rows: activity.map((entry) => [entry.user.name, formatActivityAction(entry.action), formatTimestamp(entry.timestamp)]),
      filenamePrefix: 'aktivitetslogg',
    };
  }

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Aktivitetslogg</h3>
          <div className="flex items-center gap-1">
            <ExportMenu
              onExportPdf={async () => (await import('../lib/export')).exportTableToPdf(exportOptions())}
              onExportDocx={async () => (await import('../lib/export')).exportTableToDocx(exportOptions())}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
            >
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : activity.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Ingen aktivitet än.</p>
        ) : (
          <ul className="mt-5 flex flex-col">
            {activity.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0">
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
          Se{' '}
          <Link to={`/projects/${projectId}/activity`} onClick={onClose} className="text-primary hover:underline">
            all aktivitet i Aktivitetsloggen
          </Link>
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
