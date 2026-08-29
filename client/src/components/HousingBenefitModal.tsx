import { useEffect, useState } from 'react';
import { TbExternalLink, TbTrash } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { HousingBenefitNote } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

export function HousingBenefitModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [notes, setNotes] = useState<HousingBenefitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [age, setAge] = useState('');
  const [incomeBeforeTax, setIncomeBeforeTax] = useState('');
  const [assets, setAssets] = useState('');
  const [housingCost, setHousingCost] = useState('');

  useEffect(() => {
    apiFetch<HousingBenefitNote[]>(`/projects/${projectId}/housing-benefit`)
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [projectId]);

  const meetsAgeRequirement = age ? Number(age) >= 67 : null;

  async function handleSave() {
    setError(null);
    setSubmitting(true);
    try {
      const note = await apiFetch<HousingBenefitNote>(`/projects/${projectId}/housing-benefit`, {
        method: 'POST',
        body: JSON.stringify({
          age: Number(age),
          incomeBeforeTax: Number(incomeBeforeTax),
          assets: Number(assets),
          housingCost: Number(housingCost),
        }),
      });
      setNotes((prev) => [note, ...prev]);
      setAge('');
      setIncomeBeforeTax('');
      setAssets('');
      setHousingCost('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte spara');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiFetch(`/projects/${projectId}/housing-benefit/${id}`, { method: 'DELETE' });
    } catch {
      apiFetch<HousingBenefitNote[]>(`/projects/${projectId}/housing-benefit`).then(setNotes);
    }
  }

  const canSave = age && incomeBeforeTax && assets && housingCost;

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Bostadstillägg</h3>
          <button type="button" onClick={onClose} aria-label="Stäng" className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text">
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs text-muted">
          Pensionärer kan ha rätt till bostadstillägg och äldreförsörjningsstöd från Pensionsmyndigheten. Inkomster och
          tillgångar påverkar hur mycket. Vi räknar inte fram något belopp här — Pensionsmyndighetens preliminära
          beräkning ger det.
        </p>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : (
          <>
            <div className="mt-5 rounded-xl border border-border bg-bg p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted">Ålder</label>
                  <input
                    type="number"
                    min={0}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1 w-full h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Inkomst före skatt (kr/månad)</label>
                  <input
                    type="number"
                    min={0}
                    value={incomeBeforeTax}
                    onChange={(e) => setIncomeBeforeTax(e.target.value)}
                    className="mt-1 w-full h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Tillgångar utom bostad (kr)</label>
                  <input
                    type="number"
                    min={0}
                    value={assets}
                    onChange={(e) => setAssets(e.target.value)}
                    className="mt-1 w-full h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Boendekostnad (kr/månad)</label>
                  <input
                    type="number"
                    min={0}
                    value={housingCost}
                    onChange={(e) => setHousingCost(e.target.value)}
                    className="mt-1 w-full h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {meetsAgeRequirement !== null && (
                <div
                  className={`mt-4 rounded-lg border p-3 text-sm text-text ${
                    meetsAgeRequirement ? 'border-success bg-success-light' : 'border-danger bg-danger-light'
                  }`}
                >
                  {meetsAgeRequirement ? (
                    <>
                      Åldersvillkoret (67 år eller äldre) är uppfyllt. Din faktiska rätt till bostadstillägg avgörs av din
                      inkomst, dina tillgångar och boendekostnad — kontakta Pensionsmyndigheten för en preliminär
                      beräkning.
                    </>
                  ) : (
                    <>Bostadstillägg för pensionärer kräver att du är 67 år eller äldre.</>
                  )}
                  <a
                    href="https://www.pensionsmyndigheten.se"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-dark hover:underline"
                  >
                    Gör en preliminär beräkning hos Pensionsmyndigheten <TbExternalLink size={12} />
                  </a>
                </div>
              )}

              <div className="mt-4 text-xs text-muted">
                <p className="font-medium text-text">Ändringar du måste anmäla till Pensionsmyndigheten:</p>
                <ul className="mt-1 list-disc pl-5">
                  <li>Om inkomsten ändras</li>
                  <li>Om boendekostnaden ändras</li>
                  <li>Om du flyttar utomlands</li>
                  <li>Om dina tillgångar förändras</li>
                </ul>
              </div>

              {error && <p className="mt-2 text-sm text-danger">{error}</p>}

              <button
                type="button"
                onClick={handleSave}
                disabled={submitting || !canSave}
                className="mt-4 rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? 'Sparar…' : 'Spara i dödsboet'}
              </button>
            </div>

            {notes.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Sparade anteckningar</p>
                <div className="flex flex-col gap-2">
                  {notes.map((n) => (
                    <div key={n.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg p-3">
                      <div className="text-sm text-text">
                        {n.age} år, inkomst {n.incomeBeforeTax.toLocaleString('sv-SE')} kr/mån, tillgångar{' '}
                        {n.assets.toLocaleString('sv-SE')} kr, boende {n.housingCost.toLocaleString('sv-SE')} kr/mån
                      </div>
                      <button type="button" onClick={() => handleDelete(n.id)} aria-label="Ta bort" className="rounded-lg bg-transparent p-1 text-muted hover:bg-danger-light hover:text-danger">
                        <TbTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <button type="button" onClick={onClose} className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light">
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
