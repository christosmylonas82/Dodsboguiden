import { useState } from 'react';
import { TbChevronDown, TbCopy, TbCheck, TbPhone, TbExternalLink } from 'react-icons/tb';
import { CONTACT_REGISTRY } from '../lib/contactRegistry';
import { ModalOverlay } from './ModalOverlay';

export function ContactRegistryModal({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function toggleCategory(category: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function copyTemplate(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
  }

  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Kontaktregister — myndigheter & företag</h3>
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
          Direktlänkar till alla myndigheter som är relevanta för dödsboet — Skatteverket, Pensionsmyndigheten,
          Lantmäteriet och andra. Sorgestöd-organisationer finns här också.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {CONTACT_REGISTRY.map((category) => (
            <div key={category.category}>
              <button
                type="button"
                onClick={() => toggleCategory(category.category)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-text hover:bg-primary-light"
              >
                {category.category}
                <TbChevronDown
                  size={16}
                  className={`transition-transform ${expanded.has(category.category) ? 'rotate-180' : ''}`}
                />
              </button>

              {expanded.has(category.category) && (
                <div className="mt-2 flex flex-col gap-2">
                  {category.contacts.map((contact) => {
                    const id = `${category.category}-${contact.name}`;
                    return (
                      <div key={id} className="rounded-lg border border-border bg-bg p-3">
                        <div className="text-sm font-medium text-text">{contact.name}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text">
                          <TbPhone size={14} className="text-muted" />
                          {contact.phone ? (
                            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-primary-dark hover:underline">
                              {contact.phone}
                            </a>
                          ) : (
                            contact.contactHint
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-muted">{contact.description}</div>

                        {contact.template && (
                          <div className="mt-2 rounded-md bg-surface p-2 text-xs text-muted italic">
                            &ldquo;{contact.template}&rdquo;
                          </div>
                        )}

                        <div className="mt-2 flex gap-2">
                          {contact.template && (
                            <button
                              type="button"
                              onClick={() => copyTemplate(contact.template as string, id)}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text hover:bg-primary-light"
                            >
                              {copiedId === id ? <TbCheck size={14} /> : <TbCopy size={14} />}
                              {copiedId === id ? 'Kopierad!' : 'Kopiera meddelande'}
                            </button>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone.replace(/\s/g, '')}`}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary bg-transparent px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-primary-light"
                            >
                              <TbPhone size={14} />
                              Ring
                            </a>
                          )}
                          {contact.website && (
                            <a
                              href={`https://${contact.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary bg-transparent px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-primary-light"
                            >
                              <TbExternalLink size={14} />
                              Öppna webbplats
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
