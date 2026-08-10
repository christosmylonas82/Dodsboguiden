import type { ProjectMember } from '../lib/types';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { ModalOverlay } from './ModalOverlay';

export function MembersModal({ members, onClose }: { members: ProjectMember[]; onClose: () => void }) {
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
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar name={m.user?.name ?? m.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text">{m.user?.name ?? m.email}</p>
                {m.user && <p className="truncate text-xs text-muted">{m.email}</p>}
                {!m.userId && <p className="text-xs text-muted">Inbjuden, väntar på registrering</p>}
              </div>
              <Badge tone={m.role === 'ADMIN' ? 'success' : 'neutral'}>
                {m.role === 'ADMIN' ? 'Admin' : 'Medlem'}
              </Badge>
            </li>
          ))}
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
    </ModalOverlay>
  );
}
