import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { PolicyModal } from '../components/PolicyModal';

type Tab = 'login' | 'register';

function fieldClass(hasError: boolean) {
  return `mt-1.5 w-full rounded-lg border px-3 py-2.5 text-text focus:outline-none ${
    hasError ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'
  }`;
}

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(location.pathname === '/register' ? 'register' : 'login');

  function selectTab(next: Tab) {
    setTab(next);
    navigate(next === 'register' ? '/register' : '/login', { replace: true });
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex gap-1 rounded-lg bg-bg p-1">
        <button
          type="button"
          onClick={() => selectTab('login')}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition ${
            tab === 'login' ? 'bg-primary text-white' : 'bg-transparent text-muted hover:text-text'
          }`}
        >
          Logga in
        </button>
        <button
          type="button"
          onClick={() => selectTab('register')}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition ${
            tab === 'register' ? 'bg-primary text-white' : 'bg-transparent text-muted hover:text-text'
          }`}
        >
          Skapa konto
        </button>
      </div>

      <div className="mt-6">
        {tab === 'login' ? (
          <LoginForm onSwitchToRegister={() => selectTab('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => selectTab('login')} />
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotHint, setShowForgotHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte logga in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="loginEmail" className="text-xs font-medium uppercase tracking-wide text-muted">
          E-post
        </label>
        <input
          id="loginEmail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass(false)}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="loginPassword" className="text-xs font-medium uppercase tracking-wide text-muted">
          Lösenord
        </label>
        <input
          id="loginPassword"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass(false)}
        />
      </div>

      <div className="mt-2 text-right">
        <button
          type="button"
          onClick={() => setShowForgotHint((prev) => !prev)}
          className="bg-transparent p-0 text-xs text-primary-dark underline"
        >
          Glömt lösenord?
        </button>
        {showForgotHint && (
          <p className="mt-1 text-xs text-muted">
            Lösenordsåterställning finns inte än — kontakta support@dodsboguiden.se.
          </p>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? 'Loggar in…' : 'Logga in'}
      </button>

      <p className="mt-4 text-center text-sm text-muted">
        Inget konto än?{' '}
        <button type="button" onClick={onSwitchToRegister} className="bg-transparent p-0 text-primary-dark underline">
          Skapa konto
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = 'Förnamn är obligatoriskt';
    if (!lastName.trim()) next.lastName = 'Efternamn är obligatoriskt';
    if (!email.trim()) {
      next.email = 'E-postadress är obligatorisk';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Ogiltig e-postadress';
    }
    if (!password) {
      next.password = 'Lösenord är obligatoriskt';
    } else if (password.length < 8) {
      next.password = 'Lösenordet måste vara minst 8 tecken';
    }
    if (!consent) {
      next.consent = 'Du måste godkänna användarvillkoren och integritetspolicyn';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await register(email, fullName, password, consent);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err instanceof ApiError ? err.message : 'Kunde inte skapa konto' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-xs text-muted">* Obligatoriska fält</p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="text-xs font-medium uppercase tracking-wide text-muted">
            Förnamn *
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={fieldClass(Boolean(errors.firstName))}
          />
          {errors.firstName && <p className="mt-1 text-xs text-danger">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="text-xs font-medium uppercase tracking-wide text-muted">
            Efternamn *
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={fieldClass(Boolean(errors.lastName))}
          />
          {errors.lastName && <p className="mt-1 text-xs text-danger">{errors.lastName}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="registerEmail" className="text-xs font-medium uppercase tracking-wide text-muted">
          E-postadress *
        </label>
        <input
          id="registerEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass(Boolean(errors.email))}
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
      </div>

      <div className="mt-4">
        <label htmlFor="registerPassword" className="text-xs font-medium uppercase tracking-wide text-muted">
          Lösenord *
        </label>
        <input
          id="registerPassword"
          type="password"
          placeholder="Minst 8 tecken"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass(Boolean(errors.password))}
        />
        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
      </div>

      <div className="mt-5 rounded-xl bg-primary-light p-4 text-sm leading-relaxed text-text">
        <p className="font-medium">ℹ️ Är denna tjänst rätt för mig?</p>
        <p className="mt-2">Dödsbo Guide passar för dödsbon där:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Den avlidne hade sitt permanenta hemvist i Sverige</li>
          <li>Ingen testamentarisk förordning ändrar arvfördelningen</li>
        </ul>
        <p className="mt-2">Familjesituationen motsvarar en av följande:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Sambo utan registrerat partnerskap — med eller utan barn över 18</li>
          <li>Gifta makar med enbart gemensamma barn</li>
          <li>Änka eller änkling med barn från tidigare äktenskap</li>
          <li>Ogift eller frånskild person — med eller utan barn</li>
        </ul>
        <p className="mt-2">Behöver du juridisk rådgivning? Kontakta en advokat eller boutredningsman.</p>
      </div>

      <div className="mt-5">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm leading-relaxed text-text">
            Jag godkänner{' '}
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="bg-transparent p-0 text-sm text-primary-dark underline"
            >
              användarvillkoren
            </button>{' '}
            och{' '}
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="bg-transparent p-0 text-sm text-primary-dark underline"
            >
              integritetspolicyn (GDPR)
            </button>{' '}
            *
          </span>
        </label>
        {errors.consent && <p className="mt-1.5 text-xs text-danger">{errors.consent}</p>}
      </div>

      {errors.submit && <p className="mt-4 text-sm text-danger">{errors.submit}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? 'Skapar konto…' : 'Skapa konto'}
      </button>

      <p className="mt-4 text-center text-sm text-muted">
        Har du redan ett konto?{' '}
        <button type="button" onClick={onSwitchToLogin} className="bg-transparent p-0 text-primary-dark underline">
          Logga in
        </button>
      </p>

      {termsOpen && (
        <PolicyModal title="Användarvillkor" path="/policies/terms.md" onClose={() => setTermsOpen(false)} />
      )}
      {privacyOpen && (
        <PolicyModal title="Integritetspolicy" path="/policies/privacy.md" onClose={() => setPrivacyOpen(false)} />
      )}
    </form>
  );
}
