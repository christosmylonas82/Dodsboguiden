import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import {
  TbHistory,
  TbAddressBook,
  TbClipboardList,
  TbBulb,
  TbSettings,
  TbBook2,
  TbHome,
  TbMenu2,
  TbX,
  TbLogout2,
  TbMailbox,
  TbArchive,
} from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Invitation, ProjectDetail } from '../lib/types';
import { ContactsModal } from './ContactsModal';
import { InventoryModal } from './InventoryModal';
import { TipsModal } from './TipsModal';
import { ActivityLogModal } from './ActivityLogModal';
import { InvitationsModal } from './InvitationsModal';
import { SettingsModal } from './SettingsModal';
import { ArchiveProjectModal } from './ArchiveProjectModal';

const itemClass =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-primary-light hover:text-text';

type ModalKey = 'activity' | 'contacts' | 'inventory' | 'tips' | 'invitations' | 'settings' | 'archive';

export function Layout() {
  const { user, logout, markTipsSeen } = useAuth();
  const { id: projectId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isInProject = Boolean(projectId);
  const [openModal, setOpenModal] = useState<ModalKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectIsAdmin, setProjectIsAdmin] = useState(false);

  useEffect(() => {
    if (user && !user.hasSeenTipsOnboarding) {
      setOpenModal('tips');
    }
  }, [user]);

  useEffect(() => {
    if (!projectId) {
      setProjectName('');
      setProjectIsAdmin(false);
      return;
    }
    apiFetch<ProjectDetail>(`/projects/${projectId}`)
      .then((p) => {
        setProjectName(p.deceasedName);
        setProjectIsAdmin(p.members.some((m) => m.userId === user?.id && m.role === 'ADMIN'));
      })
      .catch(() => {
        setProjectName('');
        setProjectIsAdmin(false);
      });
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

  function closeTipsModal() {
    setOpenModal(null);
    if (user && !user.hasSeenTipsOnboarding) {
      markTipsSeen();
    }
  }

  const navItems = isInProject ? (
    <>
      <button type="button" onClick={() => openModalAndCloseMenu('activity')} className={`${itemClass} bg-transparent`}>
        <TbHistory size={20} />
        Aktivitetslogg
      </button>
      <button type="button" onClick={() => openModalAndCloseMenu('contacts')} className={`${itemClass} bg-transparent`}>
        <TbAddressBook size={20} />
        Kontaktlista
      </button>
      <button type="button" onClick={() => openModalAndCloseMenu('inventory')} className={`${itemClass} bg-transparent`}>
        <TbClipboardList size={20} />
        Inventarielista
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

  const rightItems = (
    <>
      {isInProject && projectIsAdmin && (
        <button type="button" onClick={() => openModalAndCloseMenu('archive')} className={`${itemClass} bg-transparent`}>
          <TbArchive size={20} />
          Arkivera dödsbo
        </button>
      )}
      <button type="button" onClick={() => openModalAndCloseMenu('settings')} className={`${itemClass} bg-transparent`}>
        <TbSettings size={20} />
        Inställningar
      </button>
      {user?.role === 'ADMIN' && (
        <Link to="/admin/dashboard" className={itemClass} onClick={() => setMobileMenuOpen(false)}>
          Admin
        </Link>
      )}
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
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          {isInProject ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-lg font-bold text-text transition hover:text-primary-dark"
            >
              <TbHome size={24} className="text-primary-dark" />
              Översikt
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-bold text-text transition hover:text-primary-dark"
            >
              <TbBook2 size={24} className="text-primary-dark" />
              Dödsbo Guide
            </Link>
          )}

          {user ? (
            <>
              <nav className="hidden items-center gap-1 md:flex">
                {navItems}
                <div className="mx-2 h-5 w-px bg-border" />
                {rightItems}
              </nav>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? 'Stäng meny' : 'Öppna meny'}
                className="rounded-lg p-2 text-text hover:bg-primary-light md:hidden"
              >
                {mobileMenuOpen ? <TbX size={22} /> : <TbMenu2 size={22} />}
              </button>
            </>
          ) : (
            <nav className="flex items-center gap-3 text-sm">
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
            {navItems}
            <div className="my-1 h-px w-full bg-border" />
            {rightItems}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Outlet />
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text shadow-lg">
          {toast}
        </div>
      )}

      {openModal === 'activity' && projectId && (
        <ActivityLogModal projectId={projectId} projectName={projectName} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'contacts' && projectId && (
        <ContactsModal projectId={projectId} projectName={projectName} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'inventory' && projectId && (
        <InventoryModal projectId={projectId} projectName={projectName} onClose={() => setOpenModal(null)} />
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
      {openModal === 'archive' && projectId && (
        <ArchiveProjectModal
          projectId={projectId}
          deceasedName={projectName}
          onClose={() => setOpenModal(null)}
          onArchived={() => {
            setOpenModal(null);
            navigate('/dashboard');
            showToast('Dödsboet arkiverat');
          }}
        />
      )}
    </div>
  );
}
