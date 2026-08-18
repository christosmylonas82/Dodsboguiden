import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface AccountStats {
  newToday: number;
  newThisWeek: number;
  totalActive: number;
}

interface ResetStats {
  requestsToday: number;
  requestsThisWeek: number;
  usedToday: number;
  expiredUnused: number;
}

interface FailedLoginStats {
  failedToday: number;
  failedThisWeek: number;
  successToday: number;
}

interface AuthEvent {
  id: string;
  action: string;
  email: string;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  isNewIp: boolean;
  timestamp: string;
}

type Range = 'today' | 'week' | 'all';

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: 'Idag', value: 'today' },
  { label: 'Denna vecka', value: 'week' },
  { label: 'Alla', value: 'all' },
];

export function AdminAuthPage() {
  const [accounts, setAccounts] = useState<AccountStats | null>(null);
  const [reset, setReset] = useState<ResetStats | null>(null);
  const [failedLogin, setFailedLogin] = useState<FailedLoginStats | null>(null);
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const [range, setRange] = useState<Range>('today');
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<{ accounts: AccountStats }>('/admin/auth/account-stats'),
      apiFetch<{ reset: ResetStats }>('/admin/auth/reset-stats'),
      apiFetch<{ failedLogin: FailedLoginStats }>('/admin/auth/failed-login-stats'),
    ])
      .then(([accountData, resetData, failedData]) => {
        setAccounts(accountData.accounts);
        setReset(resetData.reset);
        setFailedLogin(failedData.failedLogin);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setEventsLoading(true);
    apiFetch<{ events: AuthEvent[] }>(`/admin/auth/activity-log?range=${range}`)
      .then((data) => setEvents(data.events))
      .finally(() => setEventsLoading(false));
  }, [range]);

  if (loading) return <p className="text-sm text-muted">Laddar autentiseringsdata…</p>;

  return (
    <div>
      <h2 className="mb-5 text-xl font-semibold text-text">Autentiseringsövervakning</h2>

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs text-muted">Nya konton idag</div>
          <div className="mt-1.5 text-2xl font-semibold text-text">{accounts?.newToday ?? 0}</div>
          <div className="mt-3 text-xs text-muted">Denna vecka: {accounts?.newThisWeek ?? 0}</div>
          <div className="mt-1 text-xs text-muted">Aktiva totalt: {accounts?.totalActive ?? 0}</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs text-muted">Lösenordsåterställningar idag</div>
          <div className="mt-1.5 text-2xl font-semibold text-text">{reset?.requestsToday ?? 0}</div>
          <div className="mt-3 text-xs text-muted">Denna vecka: {reset?.requestsThisWeek ?? 0}</div>
          <div className="mt-1 text-xs text-muted">Använda idag: {reset?.usedToday ?? 0}</div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs text-muted">Misslyckade inloggningar idag</div>
          <div className="mt-1.5 text-2xl font-semibold text-danger">{failedLogin?.failedToday ?? 0}</div>
          <div className="mt-3 text-xs text-muted">Denna vecka: {failedLogin?.failedThisWeek ?? 0}</div>
          <div className="mt-1 text-xs text-muted">Lyckade idag: {failedLogin?.successToday ?? 0}</div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text">Senaste autentiseringsevent</h3>
          <div className="flex gap-1.5">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  range === opt.value
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-transparent text-text hover:bg-primary-light'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Åtgärd</th>
                <th className="px-4 py-3 font-medium">Användare</th>
                <th className="px-4 py-3 font-medium">IP-adress</th>
                <th className="px-4 py-3 font-medium">Plats</th>
                <th className="px-4 py-3 font-medium">Tidpunkt</th>
              </tr>
            </thead>
            <tbody>
              {eventsLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    Laddar…
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    Inga events
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text">
                      {event.action}
                      {event.isNewIp && (
                        <span className="ml-2 rounded-full bg-warning-light px-2 py-0.5 text-xs font-medium text-warning">
                          Ny IP
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text">{event.email}</td>
                    <td className="px-4 py-3 text-muted">{event.ipAddress ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">
                      {event.city || event.country ? `${event.city ?? '?'}, ${event.country ?? '?'}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">{new Date(event.timestamp).toLocaleString('sv-SE')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
