import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  TbAddressBook,
  TbClipboardList,
  TbBulb,
  TbSettings,
  TbHome,
  TbMenu2,
  TbX,
  TbLogout2,
  TbMailbox,
  TbPhoneCall,
  TbCoin,
  TbFiles,
  TbShieldLock,
  TbRoute,
} from 'react-icons/tb';
import dodsboguidenLogo from '../assets/dodsboguiden-logo.png';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Invitation, ProjectDetail } from '../lib/types';
import { ContactsModal } from './ContactsModal';
import { ContactRegistryModal } from './ContactRegistryModal';
import { InventoryModal } from './InventoryModal';
import { TransactionsModal } from './TransactionsModal';
import { DocumentsModal } from './DocumentsModal';
import { NotificationsBell } from './NotificationsBell';
import { TipsModal } from './TipsModal';
import { InvitationsModal } from './InvitationsModal';
import { SettingsModal } from './SettingsModal';
import { Footer } from './Footer';
import { CookieBanner } from './CookieBanner';
import { PolicyModal } from './PolicyModal';
import { ThemeToggle } from './ThemeToggle';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { useTheme } from '../hooks/useTheme';

const itemClass =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-primary-light hover:text-text';

const navButtonClass =
  'group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-primary-light hover:text-text md:justify-center md:gap-1 md:px-2.5';

function NavLabel({ text }: { text: string }) {
  return (
    <>
      <span className="md:hidden">{text}</span>
      <span className="pointer-events-none absolute top-full left-1/2 z-40 mt-1.5 hidden -translate-x-1/2 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium whitespace-nowrap text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-active:opacity-100 md:block">
        {text}
      </span>
    </>
  );
}

type ModalKey =
  | 'contacts'
  | 'contactRegistry'
  | 'inventory'
  | 'transactions'
  | 'documents'
  | 'tips'
  | 'invitations'
  | 'settings';

export function Layout() {
  const { user, logout, markTipsSeen } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const { id: projectId } = useParams<{ id?: string }>();
  const isInProject = Boolean(projectId);
  const [openModal, setOpenModal] = useState<ModalKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [cookiesModalOpen, setCookiesModalOpen] = useState(false);
  const { shouldShowBanner, dismiss: dismissCookieBanner } = useCookieConsent();
  useTheme();

  useEffect(() => {
    if (!projectId) {
      setProjectName('');
      return;
    }
    apiFetch<ProjectDetail>(`/projects/${projectId}`)
      .then((p) => setProjectName(p.deceasedName))
      .catch(() => setProjectName(''));
  }, [projectId, user?.id]);

  useEffect(() => {
    function handleRenamed(e: Event) {
      const detail = (e as CustomEvent<{ projectId: string; deceasedName: string }>).detail;
      if (detail.projectId === projectId) {
        setProjectName(detail.deceasedName);
      }
    }
    window.addEventListener('dodsbo:project-renamed', handleRenamed);
    return () => window.removeEventListener('dodsbo:project-renamed', handleRenamed);
  }, [projectId]);

  useEffect(() => {
    function handleArchived() {
      showToast('Dödsboet arkiverat');
    }
    window.addEventListener('dodsbo:project-archived', handleArchived);
    return () => window.removeEventListener('dodsbo:project-archived', handleArchived);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) {
      setInvitationCount(0);
      return;
    }
    refreshInvitationCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function refreshInvitationCount() {
    apiFetch<Invitation[]>('/invitations')
      .then((invitations) => setInvitationCount(invitations.filter((i) => i.status === 'PENDING').length))
      .catch(() => setInvitationCount(0));
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function openModalAndCloseMenu(modal: ModalKey) {
    setOpenModal(modal);
    setMobileMenuOpen(false);
  }

  function startGuidedTour() {
    if (!projectId) return;
    navigate(`/projects/${projectId}/dashboard`, { state: { startTour: true } });
    setMobileMenuOpen(false);
  }

  function closeTipsModal() {
    setOpenModal(null);
    if (user && !user.hasSeenTipsOnboarding) {
      markTipsSeen();
    }
  }

  const navItems = isInProject ? (
    <>
      <button
        type="button"
        data-tour="contacts"
        onClick={() => openModalAndCloseMenu('contacts')}
        className={`${navButtonClass} bg-transparent`}
      >
        <TbAddressBook size={24} />
        <NavLabel text="Kontaktlista" />
      </button>
      <button
        type="button"
        data-tour="inventory"
        onClick={() => openModalAndCloseMenu('inventory')}
        className={`${navButtonClass} bg-transparent`}
      >
        <TbClipboardList size={24} />
        <NavLabel text="Inventarielista" />
      </button>
      <button
        type="button"
        data-tour="documents"
        onClick={() => openModalAndCloseMenu('documents')}
        className={`${navButtonClass} bg-transparent`}
      >
        <TbFiles size={24} />
        <NavLabel text="Dokument" />
      </button>
      <button
        type="button"
        data-tour="transactions"
        onClick={() => openModalAndCloseMenu('transactions')}
        className={`${navButtonClass} bg-transparent`}
      >
        <TbCoin size={24} />
        <NavLabel text="Ekonomi" />
      </button>
      <button
        type="button"
        data-tour="contactRegistry"
        onClick={() => openModalAndCloseMenu('contactRegistry')}
        className={`${navButtonClass} bg-transparent`}
      >
        <TbPhoneCall size={24} />
        <NavLabel text="Myndigheter & företag" />
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={() => openModalAndCloseMenu('invitations')}
        className={`${itemClass} bg-transparent`}
      >
        <TbMailbox size={20} />
        Inbjudningar
        {invitationCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1.5 text-xs font-semibold text-white">
            {invitationCount}
          </span>
        )}
      </button>
      <button type="button" onClick={() => openModalAndCloseMenu('tips')} className={`${itemClass} bg-transparent`}>
        <TbBulb size={20} />
        Tips
      </button>
    </>
  );

  const settingsNavItems = (
    <>
      <button
        type="button"
        data-tour="settings"
        onClick={() => openModalAndCloseMenu('settings')}
        className={`${navButtonClass} bg-transparent`}
      >
        <TbSettings size={24} />
        <NavLabel text="Inställningar" />
      </button>
      {user?.role === 'ADMIN' && (
        <Link
          to="/admin/dashboard"
          className={`${navButtonClass} bg-transparent`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <TbShieldLock size={24} />
          <NavLabel text="Admin" />
        </Link>
      )}
    </>
  );

  const logoutButton = (
    <button
      onClick={() => {
        logout();
        setMobileMenuOpen(false);
      }}
      className="flex items-center gap-2 rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-medium text-text transition hover:bg-primary-light"
    >
      <TbLogout2 size={18} />
      Logga ut
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="flex w-full items-center px-3 py-2 md:px-6">
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            {isAuthPage ? (
              <Link
                to="/"
                aria-label="Dödsboguiden"
                className="flex shrink-0 items-center rounded-md bg-white px-1.5 py-1 transition hover:opacity-90 md:px-3 md:py-1.5"
              >
                <img src={dodsboguidenLogo} alt="Dödsboguiden" className="h-5 w-auto shrink-0 md:h-10" />
              </Link>
            ) : (
              <span className="flex shrink-0 items-center rounded-md bg-white px-1.5 py-1 md:px-3 md:py-1.5">
                <img src={dodsboguidenLogo} alt="Dödsboguiden" className="h-5 w-auto shrink-0 md:h-10" />
              </span>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="hidden items-center gap-2 text-lg font-bold text-text transition hover:text-primary-dark md:flex"
              >
                <TbHome size={24} className="text-primary-dark" />
                Översikt dödsbon
              </Link>
            )}
          </div>

          {user ? (
            <>
              <nav className="hidden items-center justify-center gap-1 md:flex">
                {navItems}
                {settingsNavItems}
              </nav>

              <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
                {isInProject && (
                  <button
                    type="button"
                    onClick={startGuidedTour}
                    aria-label="Guidad tur"
                    title="Guidad tur"
                    className="rounded-lg bg-transparent p-2 text-muted hover:bg-primary-light hover:text-text"
                  >
                    <TbRoute size={20} />
                  </button>
                )}
                <div data-tour="notifications">
                  <NotificationsBell />
                </div>
                <div data-tour="theme">
                  <ThemeToggle />
                </div>
                {logoutButton}
              </div>

              <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
                {isInProject && (
                  <button
                    type="button"
                    onClick={startGuidedTour}
                    aria-label="Guidad tur"
                    title="Guidad tur"
                    className="rounded-lg bg-transparent p-2 text-muted hover:bg-primary-light hover:text-text"
                  >
                    <TbRoute size={20} />
                  </button>
                )}
                <NotificationsBell />
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-label={mobileMenuOpen ? 'Stäng meny' : 'Öppna meny'}
                  className="rounded-lg p-2 text-text hover:bg-primary-light"
                >
                  {mobileMenuOpen ? <TbX size={22} /> : <TbMenu2 size={22} />}
                </button>
              </div>
            </>
          ) : (
            <nav className="flex flex-1 items-center justify-end gap-3 text-sm">
              <ThemeToggle />
              <Link to="/login" className="text-text hover:text-primary-dark">
                Logga in
              </Link>
              <Link to="/register" className="rounded-lg bg-primary px-3 py-1.5 text-white hover:bg-primary-dark">
                Registrera dig
              </Link>
            </nav>
          )}
        </div>

        {user && mobileMenuOpen && (
          <nav className="flex flex-col gap-1 border-t border-border p-4 md:hidden">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={itemClass}>
              <TbHome size={20} />
              Översikt dödsbon
            </Link>
            {navItems}
            {settingsNavItems}
            <div className="my-1 h-px w-full bg-border" />
            {logoutButton}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Outlet />
      </main>

      <Footer />

      {shouldShowBanner && (
        <CookieBanner
          onClose={dismissCookieBanner}
          onViewCookies={() => {
            dismissCookieBanner();
            setCookiesModalOpen(true);
          }}
        />
      )}
      {cookiesModalOpen && (
        <PolicyModal
          title="Cookiespolicy"
          path="/policies/cookies.md"
          onClose={() => setCookiesModalOpen(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text shadow-lg">
          {toast}
        </div>
      )}

      {openModal === 'contacts' && projectId && (
        <ContactsModal projectId={projectId} projectName={projectName} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'contactRegistry' && <ContactRegistryModal onClose={() => setOpenModal(null)} />}
      {openModal === 'inventory' && projectId && (
        <InventoryModal projectId={projectId} projectName={projectName} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'transactions' && projectId && (
        <TransactionsModal projectId={projectId} projectName={projectName} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'documents' && projectId && (
        <DocumentsModal projectId={projectId} projectName={projectName} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'tips' && <TipsModal onClose={closeTipsModal} />}
      {openModal === 'invitations' && (
        <InvitationsModal
          onClose={() => setOpenModal(null)}
          onHandled={(message) => {
            showToast(message);
            refreshInvitationCount();
          }}
        />
      )}
      {openModal === 'settings' && <SettingsModal onClose={() => setOpenModal(null)} />}
    </div>
  );
}
