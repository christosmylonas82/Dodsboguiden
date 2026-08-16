export function CookieBanner({ onClose, onViewCookies }: { onClose: () => void; onViewCookies: () => void }) {
  return (
    <div className="fixed bottom-6 left-6 z-[70] max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-lg">
      <h3 className="text-sm font-semibold text-text">🍪 Vi använder cookies</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Vi använder nödvändiga cookies för att tjänsten ska fungera (inloggning, säkerhet). Läs mer i vår
        cookiespolicy.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text hover:bg-primary-light"
        >
          Stäng
        </button>
        <button
          type="button"
          onClick={onViewCookies}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Se cookiespolicy
        </button>
      </div>
    </div>
  );
}
