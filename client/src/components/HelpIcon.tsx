import { useState } from 'react';
import { TbHelpCircle } from 'react-icons/tb';

export function HelpIcon({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="Hjälp"
        className="flex items-center justify-center rounded-full bg-transparent p-0.5 text-muted hover:text-primary-dark"
      >
        <TbHelpCircle size={14} />
      </button>
      {open && (
        <span className="absolute top-full left-1/2 z-50 mt-1.5 w-56 -translate-x-1/2 rounded-lg border border-border bg-surface p-2.5 text-xs leading-snug font-normal text-text shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
