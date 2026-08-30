import { TbAlertTriangle } from 'react-icons/tb';
import { ModalOverlay } from './ModalOverlay';

export function DeadlineWarningModal({
  daysRemaining,
  onClose,
}: {
  daysRemaining: number;
  onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-warning bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start gap-3">
          <TbAlertTriangle size={24} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <h3 className="text-lg font-semibold text-text">Dags att skynda på bouppteckningen</h3>
            <p className="mt-2 text-sm text-text">
              Ni har ungefär <strong>{daysRemaining}</strong> dagar kvar innan bouppteckningen ska ha kommit in till
              Skatteverket.
            </p>
            <p className="mt-2 text-sm text-muted">
              Öppna Boupptecknings-guiden för att se vad som återstår.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
