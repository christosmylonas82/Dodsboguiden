/** CLIENT_ORIGIN may hold a comma-separated list of allowed CORS origins. */
export function getAllowedOrigins(): string[] {
  return (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Anything that needs a single URL to build a link — email verification
 * redirects, password reset links — should use the first configured origin.
 */
export function getPrimaryClientOrigin(): string {
  return getAllowedOrigins()[0];
}
