import { useEffect, useState } from 'react';
import { TbCrown, TbArrowBackUp, TbKey, TbTrash, TbCopy, TbSearch } from 'react-icons/tb';
import { apiFetch, ApiError } from '../../lib/api';
import { useAdmin } from '../../hooks/useAdmin';
import { Badge } from '../../components/Badge';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  deletedAt: string | null;
  _count: { memberships: number };
  lastLogin: { ipAddress: string | null; country: string | null; city: string | null; timestamp: string } | null;
}

type SortField = 'createdAt' | 'email' | 'name' | 'role';

export function AdminUsersPage() {
  const { user: currentUser } = useAdmin();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<SortField>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);
  const [resetLink, setResetLink] = useState<{ email: string; link: string } | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams({ sort, order });
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    apiFetch<AdminUser[]>(`/admin/users?${params.toString()}`).then(setUsers);
  }, [debouncedSearch, sort, order]);

  function flashMessage(text: string, tone: 'success' | 'error' = 'success') {
    setMessage({ text, tone });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleRoleChange(userId: string, role: 'ADMIN' | 'USER') {
    setActionLoading(userId);
    try {
      const { user } = await apiFetch<{ user: AdminUser }>(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev?.map((u) => (u.id === userId ? { ...u, role: user.role } : u)) ?? null);
      flashMessage(role === 'ADMIN' ? 'Användaren är nu admin' : 'Användaren är nu medlem');
    } catch (err) {
      flashMessage(err instanceof ApiError ? err.message : 'Kunde inte ändra roll', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPassword(userId: string, email: string) {
    setActionLoading(userId);
    try {
      const data = await apiFetch<{ email: string; resetLink: string }>(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      setResetLink({ email: data.email, link: data.resetLink });
    } catch (err) {
      flashMessage(err instanceof ApiError ? err.message : `Kunde inte skapa återställningslänk för ${email}`, 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(userId: string) {
    setActionLoading(userId);
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      setUsers((prev) => prev?.filter((u) => u.id !== userId) ?? null);
      flashMessage('Användare raderad');
    } catch (err) {
      flashMessage(err instanceof ApiError ? err.message : 'Kunde inte radera användare', 'error');
    } finally {
      setActionLoading(null);
      setConfirmingDeleteId(null);
    }
  }

  return (
    <div>
      <h2 className="mb-5 text-xl font-semibold text-text">Användarehantering</h2>

      {message && (
        <div
          className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${
            message.tone === 'success' ? 'border-border bg-primary-light text-text' : 'border-danger bg-danger-light text-danger'
          }`}
        >
          {message.text}
        </div>
      )}

      {resetLink && (
        <div className="mb-4 rounded-lg border border-border bg-primary-light p-4 text-sm text-text">
          <p className="font-medium">Återställningslänk för {resetLink.email}</p>
          <p className="mt-1 text-xs text-muted">
            Ingen e-posttjänst är kopplad ännu — kopiera länken och skicka den till användaren manuellt. Giltig i 24
            timmar.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={resetLink.link}
              onFocus={(e) => e.target.select()}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(resetLink.link)}
              className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text hover:bg-primary-light"
            >
              <TbCopy size={14} />
              Kopiera
            </button>
            <button
              type="button"
              onClick={() => setResetLink(null)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text hover:bg-primary-light"
            >
              Stäng
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <TbSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Sök efter e-post eller namn…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm text-text focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortField)}
          className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          <option value="createdAt">Datum</option>
          <option value="email">E-post</option>
          <option value="name">Namn</option>
          <option value="role">Roll</option>
        </select>
        <button
          type="button"
          onClick={() => setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text hover:bg-primary-light"
        >
          {order === 'desc' ? '↓ Fallande' : '↑ Stigande'}
        </button>
      </div>

      {users === null ? (
        <p className="text-sm text-muted">Laddar…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted">Inga användare hittades.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Namn</th>
                <th className="px-4 py-3 font-medium">E-post</th>
                <th className="px-4 py-3 font-medium">Roll</th>
                <th className="px-4 py-3 font-medium">Dödsbon</th>
                <th className="px-4 py-3 font-medium">Senaste inloggning</th>
                <th className="px-4 py-3 font-medium">Skapad</th>
                <th className="px-4 py-3 text-right font-medium">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isLoading = actionLoading === u.id;
                return (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text">{u.name}</td>
                    <td className="px-4 py-3 text-text">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={u.role === 'ADMIN' ? 'success' : 'neutral'}>{u.role === 'ADMIN' ? 'Admin' : 'Medlem'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text">{u._count.memberships}</td>
                    <td className="px-4 py-3 text-text">
                      {u.lastLogin?.ipAddress ? (
                        <div title={`${u.lastLogin.country ?? '?'} — ${u.lastLogin.city ?? '?'}`}>
                          <div>{u.lastLogin.ipAddress}</div>
                          <div className="mt-0.5 text-xs text-muted">
                            {u.lastLogin.city ?? 'Okänd plats'}, {u.lastLogin.country ?? '?'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">Aldrig</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString('sv-SE')}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {confirmingDeleteId === u.id ? (
                          <>
                            <span className="text-xs text-muted">Radera?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(u.id)}
                              disabled={isLoading}
                              className="rounded-lg bg-danger px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                            >
                              {isLoading ? 'Raderar…' : 'Ja'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteId(null)}
                              className="rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-xs text-text hover:bg-primary-light"
                            >
                              Avbryt
                            </button>
                          </>
                        ) : (
                          <>
                            {u.role === 'USER' ? (
                              <button
                                type="button"
                                title="Gör till admin"
                                onClick={() => handleRoleChange(u.id, 'ADMIN')}
                                disabled={isLoading}
                                className="flex items-center gap-1 rounded-lg border border-border bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text disabled:opacity-60"
                              >
                                <TbCrown size={16} />
                              </button>
                            ) : (
                              !isSelf && (
                                <button
                                  type="button"
                                  title="Demota till medlem"
                                  onClick={() => handleRoleChange(u.id, 'USER')}
                                  disabled={isLoading}
                                  className="flex items-center gap-1 rounded-lg border border-border bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text disabled:opacity-60"
                                >
                                  <TbArrowBackUp size={16} />
                                </button>
                              )
                            )}
                            <button
                              type="button"
                              title="Skicka återställningslänk"
                              onClick={() => handleResetPassword(u.id, u.email)}
                              disabled={isLoading}
                              className="flex items-center gap-1 rounded-lg border border-border bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text disabled:opacity-60"
                            >
                              <TbKey size={16} />
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                title="Radera användare"
                                onClick={() => setConfirmingDeleteId(u.id)}
                                disabled={isLoading}
                                className="flex items-center gap-1 rounded-lg border border-border bg-transparent p-1.5 text-muted hover:bg-danger-light hover:text-danger disabled:opacity-60"
                              >
                                <TbTrash size={16} />
                              </button>
                            )}
                          </>
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
