import { useEffect, useState } from 'react';
import { TbTrash } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { InventoryItem, InventoryStatus } from '../lib/types';
import { INVENTORY_STATUS_LABELS, INVENTORY_STATUS_ORDER } from '../lib/inventoryStatus';
import { ExportMenu } from './ExportMenu';
import { ModalOverlay } from './ModalOverlay';

export function InventoryModal({
  projectId,
  projectName,
  onClose,
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
}) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'ALL'>('ALL');

  useEffect(() => {
    apiFetch<InventoryItem[]>(`/projects/${projectId}/inventory`)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleAddRow() {
    const item = await apiFetch<InventoryItem>(`/projects/${projectId}/inventory`, {
      method: 'POST',
      body: JSON.stringify({ type: '', value: 0 }),
    });
    setItems((prev) => [...prev, item]);
  }

  function updateLocal(itemId: string, patch: Partial<InventoryItem>) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));
  }

  async function saveField(itemId: string, patch: Partial<InventoryItem>) {
    await apiFetch<InventoryItem>(`/projects/${projectId}/inventory/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  async function handleDelete(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await apiFetch(`/projects/${projectId}/inventory/${itemId}`, { method: 'DELETE' });
  }

  function isDebt(item: InventoryItem): boolean {
    return item.type.toLowerCase().includes('skuld') || item.value < 0;
  }

  const totalAssets = items
    .filter((i) => !isDebt(i) && i.value > 0)
    .reduce((sum, i) => sum + i.value, 0);
  const totalDebts = items.filter(isDebt).reduce((sum, i) => sum + Math.abs(i.value), 0);
  const netValue = totalAssets - totalDebts;

  const displayedItems = statusFilter === 'ALL' ? items : items.filter((i) => i.status === statusFilter);

  function formatCurrency(value: number): string {
    return `${value.toLocaleString('sv-SE')} kr`;
  }

  function exportOptions() {
    return {
      title: 'Inventarielista',
      deceasedName: projectName,
      headers: ['Typ', 'Värde (kr)', 'Status', 'Kommentarer'],
      rows: items.map((i) => [i.type || '—', String(i.value), INVENTORY_STATUS_LABELS[i.status], i.comments ?? '—']),
      footerLines: [
        `Totalt tillgångar: ${formatCurrency(totalAssets)}`,
        `Totalt skulder: ${formatCurrency(totalDebts)}`,
        `Netto värde: ${formatCurrency(netValue)}`,
      ],
      filenamePrefix: 'inventarielista',
    };
  }

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Inventarielista</h3>
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

        <p className="mt-2 text-sm text-muted italic">
          Kataloger allt som fanns i dödsboet — bankkonton, fastigheter, fordon, skulder. Systemet räknar automatiskt
          sammanfattning av tillgångar och skulder.
        </p>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              {items.length === 0 ? 'Inga poster tillagda' : `${items.length} ${items.length === 1 ? 'post tillagd' : 'poster tillagda'}`}
            </p>

            {items.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(['ALL', ...INVENTORY_STATUS_ORDER] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      statusFilter === s
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-transparent text-text hover:bg-primary-light'
                    }`}
                  >
                    {s === 'ALL' ? 'Alla' : INVENTORY_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="py-2 pr-3 font-medium">Typ</th>
                      <th className="py-2 pr-3 font-medium">Värde (kr)</th>
                      <th className="py-2 pr-3 font-medium">Status</th>
                      <th className="py-2 pr-3 font-medium">Kommentarer</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="py-2 pr-3">
                          <input
                            value={item.type}
                            onChange={(e) => updateLocal(item.id, { type: e.target.value })}
                            onBlur={(e) => saveField(item.id, { type: e.target.value })}
                            placeholder="T.ex. Bankkonto"
                            className="w-full rounded-lg border border-border px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={valueDrafts[item.id] ?? String(item.value)}
                            onChange={(e) => {
                              const input = e.target.value;
                              if (input === '' || input === '-' || /^-?\d*\.?\d*$/.test(input)) {
                                setValueDrafts((prev) => ({ ...prev, [item.id]: input }));
                              }
                            }}
                            onBlur={() => {
                              const numValue = parseFloat(valueDrafts[item.id] ?? '') || 0;
                              setValueDrafts((prev) => {
                                const { [item.id]: _removed, ...rest } = prev;
                                return rest;
                              });
                              updateLocal(item.id, { value: numValue });
                              saveField(item.id, { value: numValue });
                            }}
                            className="w-28 rounded-lg border border-border px-2 py-1.5 text-right text-text focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <select
                            value={item.status}
                            onChange={(e) => {
                              const status = e.target.value as InventoryStatus;
                              updateLocal(item.id, { status });
                              saveField(item.id, { status });
                            }}
                            className="rounded-lg border border-border px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          >
                            {INVENTORY_STATUS_ORDER.map((s) => (
                              <option key={s} value={s}>
                                {INVENTORY_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={item.comments ?? ''}
                            onChange={(e) => updateLocal(item.id, { comments: e.target.value })}
                            onBlur={(e) => saveField(item.id, { comments: e.target.value })}
                            className="w-full rounded-lg border border-border px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            aria-label="Ta bort rad"
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

            {items.length > 0 && (
              <div className="mt-4 rounded-lg border-t border-border bg-bg p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Sammanfattning</p>
                <div className="mt-2 flex items-center justify-between text-sm text-text">
                  <span>Totalt tillgångar:</span>
                  <strong>{formatCurrency(totalAssets)}</strong>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm text-text">
                  <span>Totalt skulder:</span>
                  <strong>{formatCurrency(totalDebts)}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-text">
                  <span>Netto värde:</span>
                  <strong>{formatCurrency(netValue)}</strong>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-between gap-3">
              <button
                type="button"
                onClick={handleAddRow}
                className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
              >
                + Lägg till rad
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark"
              >
                Stäng
              </button>
            </div>
          </>
        )}
      </div>
    </ModalOverlay>
  );
}
