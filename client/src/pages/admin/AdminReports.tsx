import { useEffect, useState } from 'react';
import { TbCheck, TbRefresh } from 'react-icons/tb';
import { apiFetch, ApiError } from '../../lib/api';
import { Badge } from '../../components/Badge';

interface AdminReport {
  id: string;
  message: string;
  pageUrl: string | null;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt: string | null;
  user: { id: string; name: string; email: string };
}

type StatusFilter = 'ALL' | 'OPEN' | 'RESOLVED';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Alla', value: 'ALL' },
  { label: 'Öppna', value: 'OPEN' },
  { label: 'Lösta', value: 'RESOLVED' },
];

export function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('OPEN');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const params = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
    apiFetch<AdminReport[]>(`/admin/reports${params}`).then(setReports);
  }, [statusFilter]);

  function flashMessage(text: string, tone: 'success' | 'error' = 'success') {
    setMessage({ text, tone });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleToggleStatus(reportId: string, nextStatus: 'OPEN' | 'RESOLVED') {
    setActionLoading(reportId);
    try {
      const { report } = await apiFetch<{ report: AdminReport }>(`/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setReports((prev) => {
        if (!prev) return prev;
        if (statusFilter !== 'ALL' && report.status !== statusFilter) {
          return prev.filter((r) => r.id !== reportId);
        }
        return prev.map((r) => (r.id === reportId ? report : r));
      });
      flashMessage(nextStatus === 'RESOLVED' ? 'Rapport markerad som löst' : 'Rapport återöppnad');
    } catch (err) {
      flashMessage(err instanceof ApiError ? err.message : 'Kunde inte uppdatera rapporten', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <h2 className="mb-5 text-xl font-semibold text-text">Rapporterade problem</h2>

      {message && (
        <div
          className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${
            message.tone === 'success' ? 'border-border bg-primary-light text-text' : 'border-danger bg-danger-light text-danger'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4 flex gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
              statusFilter === opt.value
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-transparent text-text hover:bg-primary-light'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {reports === null ? (
        <p className="text-sm text-muted">Laddar…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted">Inga rapporter hittades.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Rapportör</th>
                <th className="px-4 py-3 font-medium">Meddelande</th>
                <th className="px-4 py-3 font-medium">Sida</th>
                <th className="px-4 py-3 font-medium">Skapad</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const isLoading = actionLoading === r.id;
                return (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text">
                      <div>{r.user.name}</div>
                      <div className="text-xs text-muted">{r.user.email}</div>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-text">
                      <span className="line-clamp-2" title={r.message}>
                        {r.message}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{r.pageUrl ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{new Date(r.createdAt).toLocaleString('sv-SE')}</td>
                    <td className="px-4 py-3">
                      <Badge tone={r.status === 'RESOLVED' ? 'success' : 'warning'}>
                        {r.status === 'RESOLVED' ? 'Löst' : 'Öppen'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {r.status === 'OPEN' ? (
                          <button
                            type="button"
                            title="Markera som löst"
                            onClick={() => handleToggleStatus(r.id, 'RESOLVED')}
                            disabled={isLoading}
                            className="flex items-center gap-1 rounded-lg border border-border bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text disabled:opacity-60"
                          >
                            <TbCheck size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Öppna igen"
                            onClick={() => handleToggleStatus(r.id, 'OPEN')}
                            disabled={isLoading}
                            className="flex items-center gap-1 rounded-lg border border-border bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text disabled:opacity-60"
                          >
                            <TbRefresh size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
