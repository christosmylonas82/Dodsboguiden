import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TbLayoutDashboard, TbUsers, TbClipboardList, TbChevronLeft, TbChevronRight, TbLogout2, TbBook2, TbChartBar, TbShieldLock } from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

const MENU_ITEMS = [
  { label: 'Översikt', path: '/admin/dashboard', icon: TbLayoutDashboard },
  { label: 'Användare', path: '/admin/users', icon: TbUsers },
  { label: 'Statistik', path: '/admin/statistik', icon: TbChartBar },
  { label: 'Autentisering', path: '/admin/autentisering', icon: TbShieldLock },
  { label: 'Granskningslogg', path: '/admin/audit-log', icon: TbClipboardList },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <aside
        className={`flex flex-col border-r border-border bg-surface p-3 transition-all duration-200 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {sidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-text">
              <TbBook2 size={20} className="text-primary-dark" />
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Fäll ihop meny' : 'Fäll ut meny'}
            className="ml-auto rounded-lg bg-transparent p-1.5 text-muted hover:bg-primary-light hover:text-text"
          >
            {sidebarOpen ? <TbChevronLeft size={18} /> : <TbChevronRight size={18} />}
          </button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {MENU_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={label}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-primary text-white' : 'text-muted hover:bg-primary-light hover:text-text'
                } ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          title="Logga ut"
          className={`flex items-center gap-2 rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm font-medium text-text hover:bg-primary-light ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <TbLogout2 size={18} className="shrink-0" />
          {sidebarOpen && 'Logga ut'}
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <h1 className="text-lg font-semibold text-text">Dödsbo Guide Admin</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
