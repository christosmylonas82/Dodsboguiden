import { randomBytes } from 'node:crypto';

const TRANSLITERATE: Record<string, string> = { å: 'a', ä: 'a', ö: 'o' };

function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[åäö]/g, (ch) => TRANSLITERATE[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || 'dodsbo';
}

/** e.g. "Erik Andersson" -> "erik-andersson-a1b2c3" — the random suffix keeps same-name projects from colliding. */
export function generateProjectSlug(deceasedName: string): string {
  return `${slugifyName(deceasedName)}-${randomBytes(3).toString('hex')}`;
}
