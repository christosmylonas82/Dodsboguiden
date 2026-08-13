import { SettingsBody } from './SettingsBody';
import { ModalOverlay } from './ModalOverlay';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Inställningar</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>
        <div className="mt-5">
          <SettingsBody onClose={onClose} />
        </div>
      </div>
    </ModalOverlay>
  );
}
