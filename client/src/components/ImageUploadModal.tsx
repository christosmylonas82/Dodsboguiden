import { useRef, useState, type DragEvent } from 'react';
import { TbUpload } from 'react-icons/tb';
import { apiFetch, ApiError } from '../lib/api';
import type { User } from '../lib/types';
import { ModalOverlay } from './ModalOverlay';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const OUTPUT_SIZE = 320;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Kunde inte läsa bilden'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Kunde inte läsa filen'));
    reader.readAsDataURL(file);
  });
}

function cropAndResize(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d')!;

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;

  ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export function ImageUploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (user: User) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Filen måste vara JPG, PNG eller WebP');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('Filen får vara högst 5 MB');
      return;
    }

    try {
      const img = await fileToImage(file);
      setPreview(cropAndResize(img));
    } catch {
      setError('Kunde inte läsa bilden');
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleUpload() {
    if (!preview) return;
    setUploading(true);
    setError(null);
    try {
      const user = await apiFetch<User>('/auth/profile-image', {
        method: 'PUT',
        body: JSON.stringify({ imageDataUrl: preview }),
      });
      onUploaded(user);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte ladda upp bilden');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <h3 className="text-lg font-semibold text-text">Ladda upp profilbild</h3>
        <p className="mt-1 text-sm text-muted">Välj en bild (JPG, PNG eller WebP, upp till 5 MB).</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 w-full rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
        >
          Välj fil från datorn
        </button>

        <p className="mt-3 text-center text-xs text-muted">eller dra och släpp en bild här</p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mt-2 flex h-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition ${
            dragOver ? 'border-primary bg-primary-light' : 'border-border'
          }`}
        >
          {preview ? (
            <img src={preview} alt="Förhandsvisning" className="h-28 w-28 rounded-full border-2 border-border object-cover" />
          ) : (
            <>
              <TbUpload size={28} className="text-muted" />
              <span className="text-sm text-muted">Dra bild här</span>
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!preview || uploading}
            className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {uploading ? 'Laddar upp…' : 'Ladda upp'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
