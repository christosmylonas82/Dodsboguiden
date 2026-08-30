import { useEffect, useRef, useState } from 'react';
import { TbDotsVertical, TbArchive } from 'react-icons/tb';
import { ArchiveProjectModal } from './ArchiveProjectModal';

export function DodsboDropdown({
  projectId,
  deceasedName,
  onArchived,
}: {
  projectId: string;
  deceasedName: string;
  onArchived: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Fler alternativ"
        title="Fler alternativ"
        className="rounded-lg bg-transparent p-1.5 text-muted transition hover:bg-primary-light hover:text-text"
      >
        <TbDotsVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setArchiveModalOpen(true);
            }}
            className="flex w-full items-center gap-2 bg-transparent px-4 py-2.5 text-left text-sm text-text hover:bg-primary-light"
          >
            <TbArchive size={16} />
            Arkivera dödsbo
          </button>
        </div>
      )}

      {archiveModalOpen && (
        <ArchiveProjectModal
          projectId={projectId}
          deceasedName={deceasedName}
          onClose={() => setArchiveModalOpen(false)}
          onArchived={() => {
            setArchiveModalOpen(false);
            onArchived();
          }}
        />
      )}
    </div>
  );
}
