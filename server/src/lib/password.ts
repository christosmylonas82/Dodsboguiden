import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must contain 8+ chars, uppercase, lowercase, digit, and special character';

const SPECIAL_CHAR_PATTERN = /[!@#$%^&*\-_+=]/;

/** Returns null when the password meets all requirements, otherwise the shared error message. */
export function validatePassword(password: string): string | null {
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !SPECIAL_CHAR_PATTERN.test(password)
  ) {
    return PASSWORD_REQUIREMENTS_MESSAGE;
  }
  return null;
}
