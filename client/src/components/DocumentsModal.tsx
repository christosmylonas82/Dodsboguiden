import { useEffect, useState, type FormEvent } from 'react';
import { TbTrash, TbEye, TbDownload, TbFileTypePdf } from 'react-icons/tb';
import { apiFetch, ApiError, BASE_URL, getToken } from '../lib/api';
import type { DocumentType, ProjectDocument } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

const TYPE_LABELS: Record<DocumentType, string> = {
  DODSFALLSINTYG: 'Dödsfallsintyg',
  TESTAMENTE: 'Testamente',
  FULLMAKT: 'Fullmakt',
  FORSAKRING: 'Försäkringsdokument',
  OVRIGT: 'Övrigt',
};

const TYPE_ORDER: DocumentType[] = ['DODSFALLSINTYG', 'TESTAMENTE', 'FULLMAKT', 'FORSAKRING', 'OVRIGT'];

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function DocumentsModal({
  projectId,
  onClose,
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
}) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<{ title: string; dataUrl: string } | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('OVRIGT');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ProjectDocument[]>(`/projects/${projectId}/documents`)
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, [projectId]);

  function handleFileChange(selected: File | null) {
    setFileError(null);
    if (selected && selected.size > MAX_FILE_BYTES) {
      setFileError('Filen är för stor (max 8 MB).');
      setFile(null);
      return;
    }
    if (selected && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selected.type)) {
      setFileError('Endast PDF och Word-dokument stöds.');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Välj en fil att ladda upp.');
      return;
    }
    setSubmitting(true);
    try {
      const fileDataUrl = await readFileAsDataUrl(file);
      const document = await apiFetch<ProjectDocument>(`/projects/${projectId}/documents`, {
        method: 'POST',
        body: JSON.stringify({ title, type, description: description || undefined, fileDataUrl, fileName: file.name }),
      });
      setDocuments((prev) => [document, ...prev]);
      setTitle('');
      setType('OVRIGT');
      setDescription('');
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte ladda upp dokumentet');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      await apiFetch(`/projects/${projectId}/documents/${id}`, { method: 'DELETE' });
    } catch {
      apiFetch<ProjectDocument[]>(`/projects/${projectId}/documents`).then(setDocuments);
    }
  }

  async function fetchFileDataUrl(id: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/documents/${id}/file`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    return data.fileDataUrl as string;
  }

  async function handlePreview(doc: ProjectDocument) {
    const dataUrl = await fetchFileDataUrl(doc.id);
    setPreviewUrl({ title: doc.title, dataUrl });
  }

  async function handleDownload(doc: ProjectDocument) {
    const dataUrl = await fetchFileDataUrl(doc.id);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = doc.fileName;
    link.click();
  }

  const grouped = TYPE_ORDER.map((t) => ({ type: t, items: documents.filter((d) => d.type === t) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Dokument</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm text-muted italic">
          Ladda upp och hantera juridiska dokument — dödsattesten, testamente, bouppteckning, kontrakt och andra
          viktiga papper som gäller dödsboet.
        </p>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : documents.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Inga dokument uppladdade än.</p>
        ) : (
          <div className="mt-5 flex flex-col gap-5">
            {grouped.map((group) => (
              <div key={group.type}>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{TYPE_LABELS[group.type]}</p>
                <div className="flex flex-col gap-2">
                  {group.items.map((doc) => (
                    <div key={doc.id} className="rounded-lg border border-border bg-bg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-text">{doc.title}</div>
                          <div className="mt-0.5 truncate text-xs text-muted">
                            {doc.fileName} ({formatFileSize(doc.fileSize)}) — uppladdad av {doc.uploadedByUser.name}
                          </div>
                          {doc.description && <div className="mt-1 text-xs text-muted">{doc.description}</div>}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          {doc.mimeType === 'application/pdf' && (
                            <button
                              type="button"
                              onClick={() => handlePreview(doc)}
                              aria-label="Förhandsgranska"
                              title="Förhandsgranska"
                              className="rounded-lg bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text"
                            >
                              <TbEye size={16} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            aria-label="Ladda ner"
                            title="Ladda ner"
                            className="rounded-lg bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text"
                          >
                            <TbDownload size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            aria-label="Ta bort dokument"
                            title="Ta bort"
                            className="rounded-lg bg-transparent p-1.5 text-muted hover:bg-danger-light hover:text-danger"
                          >
                            <TbTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!showAddForm ? (
          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
            >
              Stäng
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark"
            >
              + Ladda upp dokument
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-medium text-text">Ladda upp dokument</p>
            <div className="mt-3 grid gap-3">
              <input
                required
                placeholder="Titel, t.ex. Dödsfallsintyg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                {TYPE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <input
                placeholder="Beskrivning (valfritt)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
              <div>
                <input
                  required
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-xs text-muted">Max 8 MB. PDF eller Word-dokument.</p>
                {fileError && <p className="mt-1 text-xs text-danger">{fileError}</p>}
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={submitting || !file}
                className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? 'Laddar upp…' : 'Ladda upp'}
              </button>
            </div>
          </form>
        )}
      </div>

      {previewUrl && (
        <ModalOverlay onClose={() => setPreviewUrl(null)} maxWidthClassName="max-w-4xl">
          <div className="flex h-[85vh] flex-col rounded-2xl border border-border bg-surface p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text">
                <TbFileTypePdf size={18} />
                {previewUrl.title}
              </div>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                aria-label="Stäng förhandsgranskning"
                className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
              >
                ✕
              </button>
            </div>
            <iframe title={previewUrl.title} src={previewUrl.dataUrl} className="min-h-0 flex-1 rounded-lg border border-border" />
          </div>
        </ModalOverlay>
      )}
    </ModalOverlay>
  );
}
