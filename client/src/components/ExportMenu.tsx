import { useState } from 'react';
import { TbDownload, TbFileTypePdf, TbFileTypeDocx, TbFileTypeCsv } from 'react-icons/tb';

export function ExportMenu({
  onExportPdf,
  onExportDocx,
  onExportCsv,
}: {
  onExportPdf: () => void;
  onExportDocx: () => void;
  onExportCsv?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Exportera"
        title="Exportera"
        className="rounded-lg bg-transparent p-1 text-muted hover:bg-primary-light hover:text-text"
      >
        <TbDownload size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <button
              type="button"
              onClick={() => {
                onExportPdf();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 bg-transparent px-3 py-2 text-left text-sm text-text hover:bg-primary-light"
            >
              <TbFileTypePdf size={16} />
              PDF
            </button>
            <button
              type="button"
              onClick={() => {
                onExportDocx();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 bg-transparent px-3 py-2 text-left text-sm text-text hover:bg-primary-light"
            >
              <TbFileTypeDocx size={16} />
              Word (.docx)
            </button>
            {onExportCsv && (
              <button
                type="button"
                onClick={() => {
                  onExportCsv();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 bg-transparent px-3 py-2 text-left text-sm text-text hover:bg-primary-light"
              >
                <TbFileTypeCsv size={16} />
                CSV
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
