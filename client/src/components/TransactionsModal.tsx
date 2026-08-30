import { useEffect, useState, type FormEvent } from 'react';
import { TbTrash } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { Transaction, TransactionCategory, TransactionType } from '../lib/types';
import { ExportMenu } from './ExportMenu';
import { HelpIcon } from './HelpIcon';
import { ModalOverlay } from './ModalOverlay';
import { HELP_TEXT } from '../lib/helpText';

const TYPE_LABELS: Record<TransactionType, string> = { COST: 'Kostnad', INCOME: 'Intäkt' };

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  BEGRAVNING: 'Begravning',
  JURIDIK: 'Juridik',
  MYNDIGHETER: 'Myndigheter',
  FORSALJNING: 'Försäljning av egendom',
  OVRIGT: 'Övrigt',
};

const CATEGORY_ORDER: TransactionCategory[] = ['BEGRAVNING', 'JURIDIK', 'MYNDIGHETER', 'FORSALJNING', 'OVRIGT'];

type Filter = 'ALL' | TransactionType;

export function TransactionsModal({
  projectId,
  projectName,
  onClose,
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});

  const [type, setType] = useState<TransactionType>('COST');
  const [category, setCategory] = useState<TransactionCategory>('OVRIGT');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    apiFetch<Transaction[]>(`/projects/${projectId}/transactions`)
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const amountNumber = parseInt(amount, 10);
      const transaction = await apiFetch<Transaction>(`/projects/${projectId}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          category,
          description,
          amount: amountNumber,
          date: new Date(`${date}T00:00:00`).toISOString(),
          notes: notes || undefined,
        }),
      });
      setTransactions((prev) => [transaction, ...prev]);
      setType('COST');
      setCategory('OVRIGT');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte lägga till transaktion');
    } finally {
      setSubmitting(false);
    }
  }

  function updateLocal(id: string, patch: Partial<Transaction>) {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function saveField(id: string, patch: Partial<Transaction>) {
    await apiFetch<Transaction>(`/projects/${projectId}/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  async function handleDelete(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiFetch(`/projects/${projectId}/transactions/${id}`, { method: 'DELETE' });
    } catch {
      apiFetch<Transaction[]>(`/projects/${projectId}/transactions`).then(setTransactions);
    }
  }

  const totalCosts = transactions.filter((t) => t.type === 'COST').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalCosts;
  const displayed = filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter);

  function formatCurrency(value: number): string {
    return `${value.toLocaleString('sv-SE')} kr`;
  }

  function exportOptions() {
    return {
      title: 'Ekonomi',
      deceasedName: projectName,
      headers: ['Datum', 'Typ', 'Kategori', 'Beskrivning', 'Belopp (kr)', 'Noteringar'],
      rows: transactions.map((t) => [
        new Date(t.date).toLocaleDateString('sv-SE'),
        TYPE_LABELS[t.type],
        CATEGORY_LABELS[t.category],
        t.description,
        t.type === 'COST' ? `-${t.amount}` : String(t.amount),
        t.notes ?? '—',
      ]),
      footerLines: [
        `Totalt kostnader: -${formatCurrency(totalCosts)}`,
        `Totalt intäkter: +${formatCurrency(totalIncome)}`,
        `Netto: ${balance >= 0 ? '+' : ''}${formatCurrency(balance)}`,
      ],
      filenamePrefix: 'ekonomi',
    };
  }

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Ekonomi</h3>
          <div className="flex items-center gap-1">
            <HelpIcon text={HELP_TEXT.transactionsModal} />
            <ExportMenu
              onExportPdf={async () => (await import('../lib/export')).exportTableToPdf(exportOptions())}
              onExportDocx={async () => (await import('../lib/export')).exportTableToDocx(exportOptions())}
              onExportCsv={async () => (await import('../lib/export')).exportTableToCsv(exportOptions())}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted italic">
          Spåra ekonomiska utgifter för dödsboet — begravning, juridik, administration. En helt översikt över pengar
          som går ut för att hantera dödsboet.
        </p>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : (
          <>
            {transactions.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-bg p-3">
                  <div className="text-xs text-muted">Kostnader</div>
                  <div className="mt-1 text-base font-semibold text-danger">-{formatCurrency(totalCosts)}</div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <div className="text-xs text-muted">Intäkter</div>
                  <div className="mt-1 text-base font-semibold text-success">+{formatCurrency(totalIncome)}</div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <div className="text-xs text-muted">Netto</div>
                  <div className={`mt-1 text-base font-semibold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {balance >= 0 ? '+' : ''}
                    {formatCurrency(balance)}
                  </div>
                </div>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="mt-3 flex gap-1.5">
                {(['ALL', 'COST', 'INCOME'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      filter === f
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-transparent text-text hover:bg-primary-light'
                    }`}
                  >
                    {f === 'ALL' ? 'Alla' : TYPE_LABELS[f]}
                  </button>
                ))}
              </div>
            )}

            {displayed.length === 0 ? (
              <p className="mt-5 text-sm text-muted">Inga transaktioner registrerade än.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="py-2 pr-3 font-medium">Datum</th>
                      <th className="py-2 pr-3 font-medium">Typ</th>
                      <th className="py-2 pr-3 font-medium">Kategori</th>
                      <th className="py-2 pr-3 font-medium">Beskrivning</th>
                      <th className="py-2 pr-3 font-medium">Noteringar</th>
                      <th className="py-2 pr-3 text-right font-medium">Belopp</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0">
                        <td className="py-2 pr-3">
                          <input
                            type="date"
                            value={t.date.slice(0, 10)}
                            onChange={(e) => {
                              const iso = new Date(`${e.target.value}T00:00:00`).toISOString();
                              updateLocal(t.id, { date: iso });
                              saveField(t.id, { date: iso });
                            }}
                            className="rounded-lg border border-border px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            value={t.type}
                            onChange={(e) => {
                              const type = e.target.value as TransactionType;
                              updateLocal(t.id, { type });
                              saveField(t.id, { type });
                            }}
                            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          >
                            {(['COST', 'INCOME'] as const).map((ty) => (
                              <option key={ty} value={ty}>
                                {TYPE_LABELS[ty]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            value={t.category}
                            onChange={(e) => {
                              const category = e.target.value as TransactionCategory;
                              updateLocal(t.id, { category });
                              saveField(t.id, { category });
                            }}
                            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          >
                            {CATEGORY_ORDER.map((c) => (
                              <option key={c} value={c}>
                                {CATEGORY_LABELS[c]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={t.description}
                            onChange={(e) => updateLocal(t.id, { description: e.target.value })}
                            onBlur={(e) => saveField(t.id, { description: e.target.value })}
                            className="w-full rounded-lg border border-border px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={t.notes ?? ''}
                            onChange={(e) => updateLocal(t.id, { notes: e.target.value })}
                            onBlur={(e) => saveField(t.id, { notes: e.target.value || null })}
                            className="w-full rounded-lg border border-border px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={amountDrafts[t.id] ?? String(t.amount)}
                            onChange={(e) => {
                              const input = e.target.value;
                              if (input === '' || /^\d*$/.test(input)) {
                                setAmountDrafts((prev) => ({ ...prev, [t.id]: input }));
                              }
                            }}
                            onBlur={() => {
                              const amount = parseInt(amountDrafts[t.id] ?? '', 10) || 0;
                              setAmountDrafts((prev) => {
                                const { [t.id]: _removed, ...rest } = prev;
                                return rest;
                              });
                              updateLocal(t.id, { amount });
                              saveField(t.id, { amount });
                            }}
                            className={`w-24 rounded-lg border border-border px-2 py-1.5 text-right focus:border-primary focus:outline-none ${t.type === 'COST' ? 'text-danger' : 'text-success'}`}
                          />
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            aria-label="Ta bort transaktion"
                            className="rounded-lg bg-transparent p-1 text-muted hover:bg-danger-light hover:text-danger"
                          >
                            <TbTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!showAddForm ? (
              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
                >
                  Stäng
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
                >
                  + Lägg till transaktion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 border-t border-border pt-5">
                <p className="text-sm font-medium text-text">Lägg till transaktion</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="h-11 rounded-lg border border-border bg-surface px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  >
                    <option value="COST">Kostnad</option>
                    <option value="INCOME">Intäkt</option>
                  </select>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="h-11 rounded-lg border border-border bg-surface px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  >
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder="Beskrivning, t.ex. Begravningsbyrå - ceremoni"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none sm:col-span-2"
                  />
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Belopp (kr)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  />
                  <input
                    placeholder="Noteringar (valfritt)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none sm:col-span-2"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-danger">{error}</p>}
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
                  >
                    {submitting ? 'Lägger till…' : '+ Lägg till'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </ModalOverlay>
  );
}
