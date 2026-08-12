import { useState } from 'react';
import { TbTrash } from 'react-icons/tb';
import type { ProjectMember } from '../lib/types';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { ModalOverlay } from './ModalOverlay';
import { DeleteMemberConfirmModal } from './DeleteMemberConfirmModal';

export function MembersModal({
  projectId,
  projectName,
  members,
  currentUserId,
  isAdmin,
  onClose,
  onMemberRemoved,
}: {
  projectId: string;
  projectName: string;
  members: ProjectMember[];
  currentUserId?: string;
  isAdmin: boolean;
  onClose: () => void;
  onMemberRemoved: (memberId: string) => void;
}) {
  const [memberToDelete, setMemberToDelete] = useState<ProjectMember | null>(null);

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

        <ul className="mt-5 flex flex-col gap-3">
          {members.map((m) => {
            const isSelf = m.userId === currentUserId;
            return (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar name={m.user?.name ?? m.email} imageUrl={m.user?.profileImageUrl} userId={m.userId ?? m.id} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text">{m.user?.name ?? m.email}</p>
                  {m.user && <p className="truncate text-xs text-muted">{m.email}</p>}
                  {!m.userId && <p className="text-xs text-muted">Inbjuden, väntar på registrering</p>}
                </div>
                <Badge tone={m.role === 'ADMIN' ? 'success' : 'neutral'}>
                  {m.role === 'ADMIN' ? 'Admin' : 'Medlem'}
                  {isSelf ? ' (Du)' : ''}
                </Badge>
                {isAdmin && !isSelf && (
                  <button
                    type="button"
                    onClick={() => setMemberToDelete(m)}
                    aria-label="Ta bort medlem"
                    className="rounded-lg bg-transparent p-1.5 text-muted hover:bg-danger-light hover:text-danger"
                  >
                    <TbTrash size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

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
