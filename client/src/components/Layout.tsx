import { Link, Outlet, useParams } from 'react-router-dom';
import { TbHistory } from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { id: projectId } = useParams<{ id?: string }>();

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
                    to={`/projects/${projectId}/activity`}
                    className="flex items-center gap-1 text-text hover:text-primary-dark"
                  >
                    <TbHistory size={16} />
                    Aktivitetslogg
                  </Link>
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
    </div>
  );
}
