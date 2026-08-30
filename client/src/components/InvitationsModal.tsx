import { useEffect, useState } from 'react';
import { TbCircleCheck, TbCircleX, TbMailbox } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { Invitation, InvitationStatus } from '../lib/types';
import { formatTimestamp } from '../lib/activity';
import { HELP_TEXT } from '../lib/helpText';
import { Badge } from './Badge';
import { HelpIcon } from './HelpIcon';
import { ModalOverlay } from './ModalOverlay';

const STATUS_BADGE: Record<InvitationStatus, { tone: 'warning' | 'success' | 'danger'; label: string }> = {
  PENDING: { tone: 'warning', label: 'Väntande' },
  ACCEPTED: { tone: 'success', label: 'Accepterad' },
  DECLINED: { tone: 'danger', label: 'Nekad' },
};

export function InvitationsModal({
  onClose,
  onHandled,
}: {
  onClose: () => void;
  onHandled: (message: string) => void;
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Invitation[]>('/invitations')
      .then(setInvitations)
      .finally(() => setLoading(false));
  }, []);

  function updateStatus(id: string, status: InvitationStatus) {
    setInvitations((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function handleAccept(invitation: Invitation) {
    setBusyId(invitation.id);
    try {
      await apiFetch(`/invitations/${invitation.id}/accept`, { method: 'POST' });
      updateStatus(invitation.id, 'ACCEPTED');
      onHandled(`Du är nu medlem i ${invitation.project.deceasedName}`);
    } catch (err) {
      onHandled(err instanceof ApiError ? err.message : 'Kunde inte acceptera inbjudan');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(invitation: Invitation) {
    setBusyId(invitation.id);
    try {
      await apiFetch(`/invitations/${invitation.id}/decline`, { method: 'POST' });
      updateStatus(invitation.id, 'DECLINED');
      onHandled('Inbjudan nekad');
    } catch (err) {
      onHandled(err instanceof ApiError ? err.message : 'Kunde inte neka inbjudan');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Inbjudningar</h3>
          <div className="flex items-center gap-1">
            <HelpIcon text={HELP_TEXT.invitationsModal} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text"
            >
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted">Laddar…</p>
        ) : invitations.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Du har inga inbjudningar.</p>
        ) : (
          <>
            <ul className="mt-4 flex flex-col gap-3">
              {invitations.map((invitation) => {
                const badge = STATUS_BADGE[invitation.status];
                const isBusy = busyId === invitation.id;
                const isPending = invitation.status === 'PENDING';
                return (
                  <li
                    key={invitation.id}
                    className={`rounded-xl border p-4 ${
                      isPending ? 'border-primary-dark/20 bg-primary-light' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary-dark">
                          <TbMailbox size={18} />
                        </span>
                        <div>
                          {isPending && (
                            <p className="text-sm font-semibold text-primary-dark">Du är inbjuden till ett dödsbo!</p>
                          )}
                          <p className="mt-0.5 font-medium text-text">{invitation.project.deceasedName}</p>
                          <p className="mt-0.5 text-sm text-muted">
                            {invitation.senderUser.name} ({invitation.senderUser.email}) bjuder in dig att
                            samarbeta för att hålla ordning på dödsboet.
                          </p>
                          <p className="mt-1 text-xs text-muted">{formatTimestamp(invitation.createdAt)}</p>
                        </div>
                      </div>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <div className="mt-3 flex gap-3">
                      {invitation.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDecline(invitation)}
                            disabled={isBusy}
                            className="rounded-lg border border-border bg-transparent px-4 py-1.5 text-sm text-text hover:bg-primary-light disabled:opacity-60"
                          >
                            Neka
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAccept(invitation)}
                            disabled={isBusy}
                            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
                          >
                            Acceptera
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-4 py-1.5 text-sm text-muted opacity-70"
                        >
                          {invitation.status === 'ACCEPTED' ? <TbCircleCheck size={16} /> : <TbCircleX size={16} />}
                          {invitation.status === 'ACCEPTED' ? 'Accepterad' : 'Nekad'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <div className="mt-6 flex justify-end">
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
