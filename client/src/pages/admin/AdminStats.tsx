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
import { TbDownload, TbTrendingUp, TbTrendingDown, TbMinus } from 'react-icons/tb';
import { apiFetch, ApiError, BASE_URL, getToken } from '../../lib/api';
import { QUESTION_LABELS, RESULT_LABELS, type QuizAnswers, type QuizResult } from '../../lib/quiz';

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

interface Trend {
  direction: 'up' | 'down' | 'flat';
  percentChange: number;
}

interface QuizStats {
  total: number;
  resultBreakdown: { result: QuizResult; count: number }[];
  questionBreakdown: Record<keyof QuizAnswers, { answer: string; count: number }[]>;
}

const RESULT_COLORS: Record<QuizResult, string> = {
  fits: '#10b981',
  warning: '#f59e0b',
  'no-fit': '#ef4444',
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function isoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  return isoDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

export function AdminStatsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectsPerDay[]>([]);
  const [featureData, setFeatureData] = useState<FeatureUsage[]>([]);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(isoDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [quizLoading, setQuizLoading] = useState(true);

  useEffect(() => {
    apiFetch<Overview>('/admin/statistics')
      .then(setOverview)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    apiFetch<QuizStats>('/admin/quiz-stats')
      .then(setQuizStats)
      .finally(() => setQuizLoading(false));
  }, []);

  useEffect(() => {
    setChartsLoading(true);
    const params = new URLSearchParams({ startDate, endDate });
    Promise.all([
      apiFetch<{ data: ProjectsPerDay[]; trend: Trend }>(`/admin/stats/projects-per-day?${params}`),
      apiFetch<{ data: FeatureUsage[] }>(`/admin/stats/feature-usage?${params}`),
    ])
      .then(([projectsPerDay, featureUsage]) => {
        setProjectsData(projectsPerDay.data);
        setTrend(projectsPerDay.trend);
        setFeatureData(featureUsage.data);
      })
      .finally(() => setChartsLoading(false));
  }, [startDate, endDate]);

  function applyPreset(days: number) {
    setEndDate(isoDate(new Date()));
    setStartDate(daysAgo(days));
  }

  async function handleExportCsv(dataType: 'projects' | 'features') {
    setExportError(null);
    try {
      const params = new URLSearchParams({ startDate, endDate, dataType });
      const res = await fetch(`${BASE_URL}/admin/stats/export/csv?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new ApiError(res.status, 'Export misslyckades');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dodsboguiden-stats-${dataType}-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof ApiError ? err.message : 'Kunde inte exportera CSV');
    }
  }

  if (loading) return <p className="text-sm text-muted">Laddar statistik…</p>;

  const TrendIcon = trend?.direction === 'up' ? TbTrendingUp : trend?.direction === 'down' ? TbTrendingDown : TbMinus;
  const trendClass = trend?.direction === 'up' ? 'text-success' : trend?.direction === 'down' ? 'text-danger' : 'text-muted';

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
        <h3 className="mb-4 text-sm font-semibold text-text">Tidsperiod</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="statsStart" className="mb-1 block text-xs text-muted">
              Från
            </label>
            <input
              id="statsStart"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 rounded-lg border border-border bg-bg px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="statsEnd" className="mb-1 block text-xs text-muted">
              Till
            </label>
            <input
              id="statsEnd"
              type="date"
              value={endDate}
              min={startDate}
              max={isoDate(new Date())}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 rounded-lg border border-border bg-bg px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs text-text hover:bg-primary-light"
            >
              7 dagar
            </button>
            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs text-text hover:bg-primary-light"
            >
              30 dagar
            </button>
            <button
              type="button"
              onClick={() => applyPreset(90)}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-xs text-text hover:bg-primary-light"
            >
              90 dagar
            </button>
          </div>
        </div>
      </div>

      {exportError && (
        <div className="mb-4 rounded-lg border border-danger bg-danger-light px-4 py-2.5 text-sm text-danger">{exportError}</div>
      )}

      <div className="mb-8 rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-text">Dödsbon skapade per dag</h3>
            {trend && (
              <span className={`flex items-center gap-1 text-xs font-medium ${trendClass}`}>
                <TrendIcon size={14} />
                {trend.direction === 'up' ? '+' : ''}
                {trend.percentChange}%
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleExportCsv('projects')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text hover:bg-primary-light"
          >
            <TbDownload size={14} />
            CSV
          </button>
        </div>
        {chartsLoading ? (
          <p className="text-sm text-muted">Laddar…</p>
        ) : (
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
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text">Mest använda funktioner</h3>
          <button
            type="button"
            onClick={() => handleExportCsv('features')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text hover:bg-primary-light"
          >
            <TbDownload size={14} />
            CSV
          </button>
        </div>
        {chartsLoading ? (
          <p className="text-sm text-muted">Laddar…</p>
        ) : featureData.length === 0 ? (
          <p className="text-sm text-muted">Ingen aktivitet registrerad under perioden.</p>
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

      <h2 className="mb-5 mt-10 text-xl font-semibold text-text">Frågeformulär (lämplighetstest)</h2>

      {quizLoading ? (
        <p className="text-sm text-muted">Laddar quiz-statistik…</p>
      ) : !quizStats || quizStats.total === 0 ? (
        <p className="text-sm text-muted">Inga svar registrerade än.</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="text-xs text-muted">Totalt antal svar</div>
              <div className="mt-1.5 text-2xl font-semibold text-text">{quizStats.total}</div>
            </div>
            {quizStats.resultBreakdown.map((r) => (
              <div key={r.result} className="rounded-xl border border-border bg-surface p-5">
                <div className="text-xs text-muted">{RESULT_LABELS[r.result] ?? r.result}</div>
                <div className="mt-1.5 text-2xl font-semibold text-text">{r.count}</div>
                <div className="mt-1.5 text-xs text-muted">
                  {quizStats.total > 0 ? Math.round((r.count / quizStats.total) * 100) : 0}% av svaren
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8 rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-sm font-semibold text-text">Resultatfördelning</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={quizStats.resultBreakdown.map((r) => ({
                  label: RESULT_LABELS[r.result] ?? r.result,
                  count: r.count,
                  result: r.result,
                }))}
                layout="vertical"
                margin={{ left: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="label" type="category" width={160} stroke="var(--color-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                  }}
                />
                <Bar dataKey="count" name="Antal">
                  {quizStats.resultBreakdown.map((r) => (
                    <Cell key={r.result} fill={RESULT_COLORS[r.result] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
            {(Object.keys(QUESTION_LABELS) as (keyof QuizAnswers)[]).map((field) => {
              const rows = quizStats.questionBreakdown[field] ?? [];
              const labels = QUESTION_LABELS[field];
              if (rows.length === 0) return null;
              const chartData = rows.map((row) => ({
                label: labels.answers[row.answer] ?? row.answer,
                count: row.count,
              }));
              return (
                <div key={field} className="rounded-xl border border-border bg-surface p-5">
                  <h3 className="mb-4 text-sm font-semibold text-text">{labels.title}</h3>
                  <ResponsiveContainer width="100%" height={Math.max(140, chartData.length * 40)}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis type="number" stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
                      <YAxis dataKey="label" type="category" width={140} stroke="var(--color-muted)" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text)',
                        }}
                      />
                      <Bar dataKey="count" name="Antal">
                        {chartData.map((entry, index) => (
                          <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
