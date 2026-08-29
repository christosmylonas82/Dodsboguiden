import { useEffect, useState } from 'react';
import { TbExternalLink, TbTrash } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { PensionType, SurvivingPensionNote } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

export function SurvivingPensionModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [notes, setNotes] = useState<SurvivingPensionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [pensionType, setPensionType] = useState<PensionType | null>(null);
  const [childAge, setChildAge] = useState('');
  const [studyingGymnasium, setStudyingGymnasium] = useState(false);
  const [survivorAge, setSurvivorAge] = useState('');
  const [hasChildren, setHasChildren] = useState(false);

  useEffect(() => {
    apiFetch<SurvivingPensionNote[]>(`/projects/${projectId}/surviving-pension`)
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [projectId]);

  function resultText(): string | null {
    if (pensionType === 'BARNPENSION' && childAge) {
      const age = Number(childAge);
      const endYear = studyingGymnasium ? '20 års ålder (juni det år barnet fyller 20, vid gymnasiestudier)' : '18 års ålder';
      return `Barnpension och efterlevandestöd betalas normalt ut till barnet fyller 18 år. Vid studier på gymnasienivå kan det förlängas till och med juni det år barnet fyller 20 år. Med angiven ålder (${age} år): utbetalning till ${endYear}.`;
    }
    if (pensionType === 'OMSTALLNINGSPENSION' && survivorAge) {
      return `Omställningspension betalas normalt ut i ett år om du inte fyllt 67 år. Den förlängs i de flesta fall automatiskt om du har barn under en viss ålder.${
        hasChildren ? ' Eftersom du angett att du har barn kan förlängning ofta ske automatiskt — kontakta Pensionsmyndigheten för att bekräfta.' : ''
      }`;
    }
    return null;
  }

  async function handleSave() {
    if (!pensionType) return;
    setError(null);
    setSubmitting(true);
    try {
      const body =
        pensionType === 'BARNPENSION'
          ? { pensionType, childAge: Number(childAge), studyingGymnasium }
          : { pensionType, survivorAge: Number(survivorAge), hasChildren };
      const note = await apiFetch<SurvivingPensionNote>(`/projects/${projectId}/surviving-pension`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setNotes((prev) => [note, ...prev]);
      setPensionType(null);
      setChildAge('');
      setSurvivorAge('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte spara');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiFetch(`/projects/${projectId}/surviving-pension/${id}`, { method: 'DELETE' });
    } catch {
      apiFetch<SurvivingPensionNote[]>(`/projects/${projectId}/surviving-pension`).then(setNotes);
    }
  }

  const result = resultText();

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Efterlevandepension</h3>
          <button type="button" onClick={onClose} aria-label="Stäng" className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text">
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs text-muted">
          Denna guide visar preliminär vägledning om barnpension och omställningspension, baserad på Pensionsmyndighetens
          allmänna regler. Exakt belopp beräknas alltid av Pensionsmyndigheten — det räknar vi inte ut här.
        </p>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : (
          <>
            <div className="mt-5 rounded-xl border border-border bg-bg p-4">
              <p className="text-sm font-medium text-text">Vilken typ av pension gäller?</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPensionType('BARNPENSION')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    pensionType === 'BARNPENSION' ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text hover:bg-primary-light'
                  }`}
                >
                  Barnpension
                </button>
                <button
                  type="button"
                  onClick={() => setPensionType('OMSTALLNINGSPENSION')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    pensionType === 'OMSTALLNINGSPENSION' ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text hover:bg-primary-light'
                  }`}
                >
                  Omställningspension
                </button>
              </div>

              {pensionType === 'BARNPENSION' && (
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-muted">Barnets ålder</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      className="mt-1 w-full h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={studyingGymnasium} onChange={(e) => setStudyingGymnasium(e.target.checked)} />
                    Studerar på gymnasienivå
                  </label>
                </div>
              )}

              {pensionType === 'OMSTALLNINGSPENSION' && (
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-muted">Din ålder</label>
                    <input
                      type="number"
                      min={18}
                      max={67}
                      value={survivorAge}
                      onChange={(e) => setSurvivorAge(e.target.value)}
                      className="mt-1 w-full h-11 rounded-lg border border-border px-4 text-sm text-text focus:border-2 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={hasChildren} onChange={(e) => setHasChildren(e.target.checked)} />
                    Har barn
                  </label>
                </div>
              )}

              {result && (
                <div className="mt-4 rounded-lg border border-success bg-success-light p-3 text-sm text-text">
                  {result}
                  <a
                    href="https://www.pensionsmyndigheten.se"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-dark hover:underline"
                  >
                    Kontakta Pensionsmyndigheten för exakt belopp <TbExternalLink size={12} />
                  </a>
                </div>
              )}

              {error && <p className="mt-2 text-sm text-danger">{error}</p>}

              {pensionType && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting || (pensionType === 'BARNPENSION' ? !childAge : !survivorAge)}
                  className="mt-4 rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {submitting ? 'Sparar…' : 'Spara i dödsboet'}
                </button>
              )}
            </div>

            {notes.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Sparade anteckningar</p>
                <div className="flex flex-col gap-2">
                  {notes.map((n) => (
                    <div key={n.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg p-3">
                      <div className="text-sm text-text">
                        {n.pensionType === 'BARNPENSION'
                          ? `Barnpension — barn ${n.childAge} år${n.studyingGymnasium ? ', studerar gymnasiet' : ''}`
                          : `Omställningspension — ${n.survivorAge} år${n.hasChildren ? ', har barn' : ''}`}
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
