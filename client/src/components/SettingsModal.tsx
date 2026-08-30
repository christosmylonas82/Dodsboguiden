import { HELP_TEXT } from '../lib/helpText';
import { HelpIcon } from './HelpIcon';
import { SettingsBody } from './SettingsBody';
import { ModalOverlay } from './ModalOverlay';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Inställningar</h3>
          <div className="flex items-center gap-1">
            <HelpIcon text={HELP_TEXT.settingsModal} />
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
        <p className="mt-2 text-sm text-muted italic">
          Justera projektinställningar, användarroller och uppgifter för dödsboet. Hantera vem som har åtkomst och
          vad de kan göra.
        </p>
        <div className="mt-5">
          <SettingsBody onClose={onClose} />
        </div>
      </div>
    </ModalOverlay>
  );
}
