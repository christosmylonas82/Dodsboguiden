import { useState } from 'react';
import { PolicyModal } from './PolicyModal';

type PolicyKey = 'terms' | 'privacy' | 'cookies';

const POLICIES: Record<PolicyKey, { title: string; path: string }> = {
  terms: { title: 'Användarvillkor', path: '/policies/terms.md' },
  privacy: { title: 'Integritetspolicy', path: '/policies/privacy.md' },
  cookies: { title: 'Cookiespolicy', path: '/policies/cookies.md' },
};

export function Footer() {
  const [openPolicy, setOpenPolicy] = useState<PolicyKey | null>(null);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-8 text-center">
        <p className="text-sm font-medium text-text">Här för er, steg för steg.</p>
        <p className="mt-1 text-sm text-muted">© 2026 Dödsbo Guide — Gratis dödsbohantering</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => setOpenPolicy('terms')}
            className="bg-transparent p-0 text-sm text-muted hover:text-text"
          >
            Användarvillkor
          </button>
          <button
            type="button"
            onClick={() => setOpenPolicy('privacy')}
            className="bg-transparent p-0 text-sm text-muted hover:text-text"
          >
            Integritetspolicy
          </button>
          <button
            type="button"
            onClick={() => setOpenPolicy('cookies')}
            className="bg-transparent p-0 text-sm text-muted hover:text-text"
          >
            Cookiespolicy
          </button>
        </div>
      </div>

      {openPolicy && (
        <PolicyModal
          title={POLICIES[openPolicy].title}
          path={POLICIES[openPolicy].path}
          onClose={() => setOpenPolicy(null)}
        />
      )}
    </footer>
  );
}
