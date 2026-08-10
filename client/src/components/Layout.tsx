import { useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import {
  TbHistory,
  TbAddressBook,
  TbClipboardList,
  TbBulb,
  TbSettings,
  TbBook2,
  TbMenu2,
  TbX,
  TbLogout2,
} from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import { ContactsModal } from './ContactsModal';
import { InventoryModal } from './InventoryModal';
import { TipsModal } from './TipsModal';

const itemClass =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-primary-light hover:text-text';

export function Layout() {
  const { user, logout } = useAuth();
  const { id: projectId } = useParams<{ id?: string }>();
  const [openModal, setOpenModal] = useState<'contacts' | 'inventory' | 'tips' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function openModalAndCloseMenu(modal: 'contacts' | 'inventory' | 'tips') {
    setOpenModal(modal);
    setMobileMenuOpen(false);
  }

  const navItems = projectId ? (
    <>
      <Link to={`/projects/${projectId}/activity`} className={itemClass} onClick={() => setMobileMenuOpen(false)}>
        <TbHistory size={20} />
        Aktivitetslogg
      </Link>
      <button type="button" onClick={() => openModalAndCloseMenu('contacts')} className={`${itemClass} bg-transparent`}>
        <TbAddressBook size={20} />
        Kontaktlista
      </button>
      <button type="button" onClick={() => openModalAndCloseMenu('inventory')} className={`${itemClass} bg-transparent`}>
        <TbClipboardList size={20} />
        Inventarielista
      </button>
      <button type="button" onClick={() => openModalAndCloseMenu('tips')} className={`${itemClass} bg-transparent`}>
        <TbBulb size={20} />
        Tips &amp; rekommendationer
      </button>
    </>
  ) : null;

  const rightItems = (
    <>
      <Link to="/settings" className={itemClass} onClick={() => setMobileMenuOpen(false)}>
        <TbSettings size={20} />
        Inställningar
      </Link>
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
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold text-text transition hover:text-primary-dark"
          >
            <TbBook2 size={24} className="text-primary-dark" />
            Dödsbo Guide
          </Link>

          {user ? (
            <>
              <nav className="hidden items-center gap-1 md:flex">
                {navItems}
                {navItems && <div className="mx-2 h-5 w-px bg-border" />}
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
            {navItems && <div className="my-1 h-px w-full bg-border" />}
            {rightItems}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Outlet />
      </main>

      {openModal === 'contacts' && projectId && (
        <ContactsModal projectId={projectId} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'inventory' && projectId && (
        <InventoryModal projectId={projectId} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'tips' && <TipsModal onClose={() => setOpenModal(null)} />}
    </div>
  );
}
