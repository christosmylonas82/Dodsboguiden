export interface PasswordRequirement {
  key: 'length' | 'uppercase' | 'lowercase' | 'digit' | 'special';
  label: string;
  test: (password: string) => boolean;
}

const SPECIAL_CHAR_PATTERN = /[!@#$%^&*\-_+=]/;

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: 'length', label: 'Minst 8 tecken', test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'En stor bokstav (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'En liten bokstav (a-z)', test: (p) => /[a-z]/.test(p) },
  { key: 'digit', label: 'En siffra (0-9)', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'Ett specialtecken (!@#$%^&*-_+=)', test: (p) => SPECIAL_CHAR_PATTERN.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));
}

// Kept identical to the backend's message (server/src/lib/password.ts) so the
// two never drift out of sync.
export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must contain 8+ chars, uppercase, lowercase, digit, and special character';
