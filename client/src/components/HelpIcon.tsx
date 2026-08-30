import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TbHelpCircle } from 'react-icons/tb';

export function HelpIcon({ text, title }: { text: string; title?: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const popoverWidth = 288;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.max(16, Math.min(rect.right - popoverWidth, window.innerWidth - popoverWidth - 16));
      setPosition({ top: rect.bottom + 8, left });
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    }

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Hjälp"
        title="Hjälp"
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text"
      >
        <TbHelpCircle size={24} />
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: 'fixed', top: position.top, left: position.left }}
            className="z-[60] w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-4 text-sm text-text shadow-[0_16px_48px_-8px_rgba(15,15,15,0.24)]"
          >
            {title && <p className="mb-1.5 font-semibold text-text">{title}</p>}
            <p>{text}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
