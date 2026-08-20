import { useEffect, useState } from 'react';
import { TbExternalLink } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { DigitalHeritageItem, DigitalHeritageStatus } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

const PLATFORMS: { name: string; url: string }[] = [
  { name: 'Facebook', url: 'https://www.facebook.com' },
  { name: 'Google/YouTube', url: 'https://support.google.com' },
  { name: 'Instagram', url: 'https://help.instagram.com' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com' },
  { name: 'X (Twitter)', url: 'https://help.x.com' },
  { name: 'Snapchat', url: 'https://help.snapchat.com' },
  { name: 'TikTok', url: 'https://support.tiktok.com' },
];

const ARCHIVES: { name: string; url: string; description: string }[] = [
  { name: 'Vita arkivet', url: 'https://www.vitaarkivet.se', description: 'Arkiv för dödsönskemål' },
  { name: 'Livsarkivet', url: 'https://www.livsarkivet.se', description: 'Arkiv för att bevara minnen' },
  { name: 'Begravningsarkivet (Fenix Begravning)', url: 'https://www.fenixbegravning.se', description: 'Begravningsarkiv' },
  { name: 'Lavendla-arkivet', url: 'https://www.lavendla.se', description: 'Arkiv för dödsönskemål' },
];

const STATUS_LABELS: Record<DigitalHeritageStatus, string> = {
  NOT_STARTED: 'Inte hanterad',
  MEMORIAL: 'Minneskonto',
  DELETED: 'Raderad',
  ARCHIVED: 'Arkiverad',
};

const STATUS_ORDER: DigitalHeritageStatus[] = ['NOT_STARTED', 'MEMORIAL', 'DELETED', 'ARCHIVED'];

export function DigitalHeritageModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'social' | 'archive'>('social');
  const [items, setItems] = useState<DigitalHeritageItem[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ items: DigitalHeritageItem[]; selectedArchive: string | null }>(`/projects/${projectId}/digital-heritage`)
      .then((data) => {
        setItems(data.items);
        setSelectedArchive(data.selectedArchive);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  function itemFor(platform: string) {
    return items.find((i) => i.platform === platform) ?? null;
  }

  async function ensureItem(platform: string): Promise<DigitalHeritageItem> {
    const existing = itemFor(platform);
    if (existing) return existing;
    const created = await apiFetch<DigitalHeritageItem>(`/projects/${projectId}/digital-heritage`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
    setItems((prev) => [...prev, created]);
    return created;
  }

  async function setStatus(platform: string, status: DigitalHeritageStatus) {
    const item = await ensureItem(platform);
    const updated = await apiFetch<DigitalHeritageItem>(`/projects/${projectId}/digital-heritage/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function toggleArchive(name: string) {
    const next = selectedArchive === name ? null : name;
    setSelectedArchive(next);
    await apiFetch(`/projects/${projectId}/digital-heritage/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ selectedArchive: next }),
    });
  }

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Digitalt arv</h3>
          <button type="button" onClick={onClose} aria-label="Stäng" className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text">
            ✕
          </button>
        </div>

        <div className="mt-4 flex gap-1.5 border-b border-border">
          <button
            type="button"
            onClick={() => setTab('social')}
            className={`px-3 py-2 text-sm font-medium ${tab === 'social' ? 'border-b-2 border-primary text-text' : 'text-muted hover:text-text'}`}
          >
            Sociala medier
          </button>
          <button
            type="button"
            onClick={() => setTab('archive')}
            className={`px-3 py-2 text-sm font-medium ${tab === 'archive' ? 'border-b-2 border-primary text-text' : 'text-muted hover:text-text'}`}
          >
            Arkiv & minnen
          </button>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : tab === 'social' ? (
          <div className="mt-4 flex flex-col gap-2">
            {PLATFORMS.map((platform) => {
              const item = itemFor(platform.name);
              const status = item?.status ?? 'NOT_STARTED';
              return (
                <div key={platform.name} className="rounded-lg border border-border bg-bg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-text">{platform.name}</span>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary-dark hover:underline"
                    >
                      Öppna <TbExternalLink size={12} />
                    </a>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(platform.name, s)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                          status === s ? 'border-primary bg-primary text-white' : 'border-border bg-transparent text-text hover:bg-primary-light'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs text-muted">Vill ni bevara en digital minnessamling? Välj de arkiv ni vill använda.</p>
            {ARCHIVES.map((archive) => (
              <div key={archive.name} className="rounded-lg border border-border bg-bg p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-text">{archive.name}</div>
                    <div className="text-xs text-muted">{archive.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleArchive(archive.name)}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                      selectedArchive === archive.name
                        ? 'border-success bg-success-light text-success'
                        : 'border-border bg-transparent text-text hover:bg-primary-light'
                    }`}
                  >
                    {selectedArchive === archive.name ? '✓ Valt' : 'Välj'}
                  </button>
                </div>
                <a
                  href={archive.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary-dark hover:underline"
                >
                  Öppna webbplats <TbExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <button type="button" onClick={onClose} className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light">
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
