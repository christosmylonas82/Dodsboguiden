import { useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { TbHistory, TbAddressBook, TbClipboardList, TbBulb, TbLayoutDashboard } from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import { ContactsModal } from './ContactsModal';
import { InventoryModal } from './InventoryModal';
import { TipsModal } from './TipsModal';

export function Layout() {
  const { user, logout } = useAuth();
  const { id: projectId } = useParams<{ id?: string }>();
  const [openModal, setOpenModal] = useState<'contacts' | 'inventory' | 'tips' | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-primary-dark">
            Dödsbo Guide
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {user ? (
              <>
                <Link to="/dashboard" className="text-text hover:text-primary-dark">
                  Mina dödsbon
                </Link>
                {projectId && (
                  <Link
                    to={`/projects/${projectId}/dashboard`}
                    className="flex items-center gap-1 text-text hover:text-primary-dark"
                  >
                    <TbLayoutDashboard size={16} />
                    Projekt
                  </Link>
                )}
                {projectId && (
                  <Link
                    to={`/projects/${projectId}/activity`}
                    className="flex items-center gap-1 text-text hover:text-primary-dark"
                  >
                    <TbHistory size={16} />
                    Aktivitetslogg
                  </Link>
                )}
                {projectId && (
                  <button
                    type="button"
                    onClick={() => setOpenModal('contacts')}
                    className="flex items-center gap-1 bg-transparent text-text hover:text-primary-dark"
                  >
                    <TbAddressBook size={16} />
                    Kontaktlista
                  </button>
                )}
                {projectId && (
                  <button
                    type="button"
                    onClick={() => setOpenModal('inventory')}
                    className="flex items-center gap-1 bg-transparent text-text hover:text-primary-dark"
                  >
                    <TbClipboardList size={16} />
                    Inventarielista
                  </button>
                )}
                {projectId && (
                  <button
                    type="button"
                    onClick={() => setOpenModal('tips')}
                    className="flex items-center gap-1 bg-transparent text-text hover:text-primary-dark"
                  >
                    <TbBulb size={16} />
                    Tips och rekommendationer
                  </button>
                )}
                <Link to="/settings" className="text-text hover:text-primary-dark">
                  Inställningar
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="text-text hover:text-primary-dark">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-text hover:bg-primary-light"
                >
                  Logga ut
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text hover:text-primary-dark">
                  Logga in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary px-3 py-1.5 text-white hover:bg-primary-dark"
                >
                  Registrera dig
                </Link>
              </>
            )}
          </nav>
        </div>
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
