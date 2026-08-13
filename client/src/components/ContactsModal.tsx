import { useEffect, useState, type FormEvent } from 'react';
import { TbTrash } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { Contact } from '../lib/types';
import { ExportMenu } from './ExportMenu';
import { ModalOverlay } from './ModalOverlay';

export function ContactsModal({
  projectId,
  projectName,
  onClose,
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    apiFetch<Contact[]>(`/projects/${projectId}/contacts`)
      .then(setContacts)
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const contact = await apiFetch<Contact>(`/projects/${projectId}/contacts`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          relation,
          phone: phone || undefined,
          email: email || undefined,
          notes: notes || undefined,
        }),
      });
      setContacts((prev) => [...prev, contact]);
      setName('');
      setRelation('');
      setPhone('');
      setEmail('');
      setNotes('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte lägga till kontakt');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(contactId: string) {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    try {
      await apiFetch(`/projects/${projectId}/contacts/${contactId}`, { method: 'DELETE' });
    } catch {
      apiFetch<Contact[]>(`/projects/${projectId}/contacts`).then(setContacts);
    }
  }

  function exportOptions() {
    return {
      title: 'Kontaktlista',
      deceasedName: projectName,
      headers: ['Namn', 'Relation', 'Telefon', 'E-post'],
      rows: contacts.map((c) => [c.name, c.relation, c.phone ?? '—', c.email ?? '—']),
      filenamePrefix: 'kontaktlista',
    };
  }

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Kontaktlista</h3>
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
        ) : contacts.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Inga kontakter tillagda än.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 pr-3 font-medium">Namn</th>
                  <th className="py-2 pr-3 font-medium">Relation</th>
                  <th className="py-2 pr-3 font-medium">Telefon</th>
                  <th className="py-2 pr-3 font-medium">E-post</th>
                  <th className="py-2 pr-3 font-medium">Anteckningar</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 text-text">{c.name}</td>
                    <td className="py-2 pr-3 text-text">{c.relation}</td>
                    <td className="py-2 pr-3 text-text">{c.phone ?? '—'}</td>
                    <td className="py-2 pr-3 text-text">{c.email ?? '—'}</td>
                    <td className="py-2 pr-3 text-text">{c.notes ?? '—'}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        aria-label="Ta bort kontakt"
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

        <form onSubmit={handleSubmit} className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-medium text-text">Lägg till kontakt</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Namn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
            <input
              required
              placeholder="Relation (t.ex. Barn, Advokat)"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
            <input
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
            <input
              placeholder="Anteckningar"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:outline-none sm:col-span-2"
            />
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-transparent px-4 py-2 text-text hover:bg-primary-light"
            >
              Stäng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Lägger till…' : '+ Lägg till kontakt'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
