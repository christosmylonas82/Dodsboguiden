import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiFetch } from '../../lib/api';

interface ProjectsPerDay {
  date: string;
  projects: number;
}

interface FeatureUsage {
  feature: string;
  uses: number;
}

interface Overview {
  totalProjects: number;
  projectsLast7Days: number;
  projectsLast30Days: number;
  avgMembersPerProject: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AdminStatsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectsPerDay[]>([]);
  const [featureData, setFeatureData] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Overview>('/admin/statistics'),
      apiFetch<{ data: ProjectsPerDay[] }>('/admin/stats/projects-per-day'),
      apiFetch<{ data: FeatureUsage[] }>('/admin/stats/feature-usage'),
    ])
      .then(([overviewData, projectsPerDay, featureUsage]) => {
        setOverview(overviewData);
        setProjectsData(projectsPerDay.data);
        setFeatureData(featureUsage.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Laddar statistik…</p>;

  return (
    <div>
      <h2 className="mb-5 text-xl font-semibold text-text">Statistik</h2>

      {overview && (
        <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs text-muted">Totalt dödsbon</div>
            <div className="mt-1.5 text-2xl font-semibold text-text">{overview.totalProjects}</div>
            <div className="mt-1.5 text-xs text-muted">+{overview.projectsLast7Days} senaste 7 dagar</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs text-muted">Genomsnittliga medlemmar per dödsbo</div>
            <div className="mt-1.5 text-2xl font-semibold text-text">{overview.avgMembersPerProject}</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs text-muted">Uppgifter slutförda</div>
            <div className="mt-1.5 text-2xl font-semibold text-text">{overview.completionRate}%</div>
            <div className="mt-1.5 text-xs text-muted">
              {overview.completedTasks} av {overview.totalTasks}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs text-muted">Dödsbon senaste 30 dagar</div>
            <div className="mt-1.5 text-2xl font-semibold text-text">{overview.projectsLast30Days}</div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">Dödsbon skapade per dag (7 dagar)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projectsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted)" fontSize={12} />
            <YAxis stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="projects"
              name="Dödsbon"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">Mest använda funktioner (30 dagar)</h3>
        {featureData.length === 0 ? (
          <p className="text-sm text-muted">Ingen aktivitet registrerad ännu.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
              <YAxis dataKey="feature" type="category" width={150} stroke="var(--color-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                }}
              />
              <Bar dataKey="uses" name="Användningar">
                {featureData.map((entry, index) => (
                  <Cell key={entry.feature} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
