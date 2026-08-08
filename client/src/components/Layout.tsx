import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link to="/" className="brand">Dödsbo Guide</Link>
        <nav>
          {user ? (
            <>
              <Link to="/dashboard">Mina dödsbon</Link>
              <Link to="/settings">Inställningar</Link>
              {user.role === 'ADMIN' && <Link to="/admin/dashboard">Admin</Link>}
              <button className="secondary" onClick={logout}>Logga ut</button>
            </>
          ) : (
            <>
              <Link to="/login">Logga in</Link>
              <Link to="/register">Registrera dig</Link>
            </>
          )}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
