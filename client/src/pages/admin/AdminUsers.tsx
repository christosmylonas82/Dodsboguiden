import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  deletedAt: string | null;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  useEffect(() => {
    apiFetch<AdminUser[]>('/admin/users').then(setUsers);
  }, []);

  if (!users) return <p>Laddar…</p>;

  return (
    <div>
      <h1>Användare</h1>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Namn</th>
              <th>E-post</th>
              <th>Roll</th>
              <th>Skapad</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString('sv-SE')}</td>
                <td>{u.deletedAt ? 'Raderad' : 'Aktiv'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
