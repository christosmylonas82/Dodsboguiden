import { useEffect, useState } from 'react';
import { TbTrash } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { InventoryItem } from '../lib/types';
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

  function formatCurrency(value: number): string {
    return `${value.toLocaleString('sv-SE')} kr`;
  }

  function exportOptions() {
    return {
      title: 'Inventarielista',
      deceasedName: projectName,
      headers: ['Typ', 'Värde (kr)', 'Kommentarer'],
      rows: items.map((i) => [i.type || '—', String(i.value), i.comments ?? '—']),
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

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              {items.length === 0 ? 'Inga poster tillagda' : `${items.length} ${items.length === 1 ? 'post tillagd' : 'poster tillagda'}`}
            </p>

            {items.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="py-2 pr-3 font-medium">Typ</th>
                      <th className="py-2 pr-3 font-medium">Värde (kr)</th>
                      <th className="py-2 pr-3 font-medium">Kommentarer</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
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
                            type="number"
                            value={item.value}
                            onChange={(e) => updateLocal(item.id, { value: Number(e.target.value) })}
                            onBlur={(e) => saveField(item.id, { value: Number(e.target.value) })}
                            className="w-28 rounded-lg border border-border px-2 py-1.5 text-text focus:border-primary focus:outline-none"
                          />
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
