import { useState } from 'react';
import { TbTrash, TbClock } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { PendingInvitation, ProjectMember } from '../lib/types';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { ModalOverlay } from './ModalOverlay';
import { DeleteMemberConfirmModal } from './DeleteMemberConfirmModal';

export function MembersModal({
  projectId,
  projectName,
  members,
  pendingInvitations,
  currentUserId,
  isAdmin,
  onClose,
  onMemberRemoved,
  onInvitationRevoked,
}: {
  projectId: string;
  projectName: string;
  members: ProjectMember[];
  pendingInvitations: PendingInvitation[];
  currentUserId?: string;
  isAdmin: boolean;
  onClose: () => void;
  onMemberRemoved: (memberId: string) => void;
  onInvitationRevoked: (invitationId: string) => void;
}) {
  const [memberToDelete, setMemberToDelete] = useState<ProjectMember | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke(invitationId: string) {
    setRevokingId(invitationId);
    setError(null);
    try {
      await apiFetch(`/invitations/${invitationId}`, { method: 'DELETE' });
      onInvitationRevoked(invitationId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte dra tillbaka inbjudan');
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Familjemedlemmar</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">Medlemmar ({members.length})</p>
        <ul className="mt-2 flex flex-col gap-3">
          {members.map((m) => {
            const isSelf = m.userId === currentUserId;
            return (
              <li key={m.id} className="flex min-h-[64px] items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={m.user?.name ?? m.email} imageUrl={m.user?.profileImageUrl} userId={m.userId ?? m.id} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{m.user?.name ?? m.email}</p>
                    {m.user && <p className="truncate text-xs text-muted">{m.email}</p>}
                    {!m.userId && <p className="text-xs text-muted">Inbjuden, väntar på registrering</p>}
                  </div>
                </div>
                <div className="flex h-full shrink-0 items-center gap-2">
                  <Badge tone={m.role === 'ADMIN' ? 'success' : 'neutral'}>
                    {`${m.role === 'ADMIN' ? 'Admin' : 'Medlem'}${isSelf ? ' (Du)' : ''}`}
                  </Badge>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setMemberToDelete(m)}
                      aria-label="Ta bort medlem"
                      tabIndex={isSelf ? -1 : 0}
                      className={`flex items-center justify-center rounded-lg bg-transparent p-1.5 text-muted hover:bg-danger-light hover:text-danger ${
                        isSelf ? 'invisible' : ''
                      }`}
                    >
                      <TbTrash size={16} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {pendingInvitations.length > 0 && (
          <>
            <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted">
              Väntande inbjudningar ({pendingInvitations.length})
            </p>
            <ul className="mt-2 flex flex-col gap-3">
              {pendingInvitations.map((invite) => (
                <li key={invite.id} className="flex min-h-[64px] items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={invite.invitedUser?.name ?? invite.invitedEmail}
                      imageUrl={invite.invitedUser?.profileImageUrl}
                      userId={invite.invitedUser?.id ?? invite.id}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text">{invite.invitedUser?.name ?? invite.invitedEmail}</p>
                      <p className="truncate text-xs text-muted">
                        {invite.invitedUser ? invite.invitedEmail : '(ny användare)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-full shrink-0 items-center gap-2">
                    <span className="flex h-6 items-center gap-1 whitespace-nowrap rounded-full bg-warning-light px-3 text-xs font-medium text-warning">
                      <TbClock size={14} />
                      Inbjudan väntar
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(invite.id)}
                        disabled={revokingId === invite.id}
                        aria-label="Dra tillbaka inbjudan"
                        title="Dra tillbaka inbjudan"
                        className="flex items-center justify-center rounded-lg bg-transparent p-1.5 text-muted hover:bg-danger-light hover:text-danger disabled:opacity-60"
                      >
                        <TbTrash size={16} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

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

      {memberToDelete && (
        <DeleteMemberConfirmModal
          projectId={projectId}
          projectName={projectName}
          member={memberToDelete}
          onClose={() => setMemberToDelete(null)}
          onRemoved={() => {
            onMemberRemoved(memberToDelete.id);
            setMemberToDelete(null);
          }}
        />
      )}
    </ModalOverlay>
  );
}
