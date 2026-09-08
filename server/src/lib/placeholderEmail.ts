const PLACEHOLDER_EMAIL_DOMAIN = 'users.dodsboguiden.se';

export function makePlaceholderEmail(prefix: string, id: string): string {
  return `${prefix}_${id}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

export function isPlaceholderEmail(email: string): boolean {
  return email.endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
}
