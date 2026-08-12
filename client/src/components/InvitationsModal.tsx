import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import type { Invitation } from '../lib/types';
import { formatTimestamp } from '../lib/activity';
import { ModalOverlay } from './ModalOverlay';

export function InvitationsModal({
  onClose,
  onHandled,
}: {
  onClose: () => void;
  onHandled: (message: string) => void;
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Invitation[]>('/invitations')
      .then(setInvitations)
      .finally(() => setLoading(false));
  }, []);

  async function handleAccept(invitation: Invitation) {
    try {
      await apiFetch(`/invitations/${invitation.id}/accept`, { method: 'POST' });
      onHandled(`Du är nu medlem i ${invitation.project.deceasedName}`);
      onClose();
    } catch (err) {
      onHandled(err instanceof ApiError ? err.message : 'Kunde inte acceptera inbjudan');
    }
  }

  async function handleDecline(invitation: Invitation) {
    try {
      await apiFetch(`/invitations/${invitation.id}/decline`, { method: 'POST' });
      onHandled('Inbjudan nekad');
      onClose();
    } catch (err) {
      onHandled(err instanceof ApiError ? err.message : 'Kunde inte neka inbjudan');
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Inbjudningar</h3>
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
        ) : invitations.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Du har inga väntande inbjudningar.</p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">Du är inbjuden till följande dödsbon:</p>
            <ul className="mt-3 flex flex-col gap-3">
              {invitations.map((invitation) => (
                <li key={invitation.id} className="rounded-lg border border-border p-4">
                  <p className="font-medium text-text">{invitation.project.deceasedName}</p>
                  <p className="text-sm text-muted">
                    Inbjuden av: {invitation.senderUser.name} ({formatTimestamp(invitation.createdAt)})
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleDecline(invitation)}
                      className="rounded-lg border border-border bg-transparent px-4 py-1.5 text-sm text-text hover:bg-primary-light"
                    >
                      Neka
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(invitation)}
                      className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      Acceptera
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
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
