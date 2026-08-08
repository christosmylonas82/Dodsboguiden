import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface AuditEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  admin: { id: string; name: string };
}

export function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    apiFetch<AuditEntry[]>('/admin/audit-log').then(setEntries);
  }, []);

  if (!entries) return <p>Laddar…</p>;

  return (
    <div>
      <h1>Granskningslogg</h1>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Åtgärd</th>
              <th>Mål</th>
              <th>Tid</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={4}>Inga händelser ännu.</td>
              </tr>
            )}
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{e.admin.name}</td>
                <td>{e.action}</td>
                <td>{e.targetType} / {e.targetId}</td>
                <td>{new Date(e.timestamp).toLocaleString('sv-SE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
