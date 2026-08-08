import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    apiFetch<Statistics>('/admin/statistics').then(setStats);
  }, []);

  if (!stats) return <p>Laddar…</p>;

  const tiles: [string, number][] = [
    ['Aktiva användare', stats.activeUsers],
    ['Totalt användare', stats.totalUsers],
    ['Aktiva dödsbon', stats.activeProjects],
    ['Totalt dödsbon', stats.totalProjects],
    ['Uppgifter klara', stats.completedTasks],
    ['Uppgifter totalt', stats.totalTasks],
  ];

  return (
    <div>
      <h1>Admin – översikt</h1>
      <div className="stat-grid">
        {tiles.map(([label, value]) => (
          <div className="stat-tile" key={label}>
            <div className="value">{value}</div>
            <div className="label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
