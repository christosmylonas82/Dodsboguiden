import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ModalOverlay } from './ModalOverlay';

export function PolicyModal({
  title,
  path,
  onClose,
}: {
  title: string;
  path: string;
  onClose: () => void;
}) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(path)
      .then((res) => res.text())
      .then(setContent)
      .catch(() => setContent('Kunde inte ladda dokumentet.'))
      .finally(() => setLoading(false));
  }, [path]);

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : (
          <div className="policy-markdown mt-5 text-sm leading-relaxed text-text">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
