import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { ProjectRedirect } from './components/ProjectRedirect';
import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { DashboardPage } from './pages/Dashboard';
import { DashboardHubPage } from './pages/DashboardHub';
import { PhaseDashboardPage } from './pages/PhaseDashboard';
import { ProjectActivityPage } from './pages/ProjectActivity';
import { SettingsPage } from './pages/Settings';
import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsers';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLog';
import './App.css';

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects/:id" element={<ProjectRedirect />} />
              <Route path="/projects/:id/dashboard" element={<DashboardHubPage />} />
              <Route
                path="/projects/:id/direkt-efter-dodsfall"
                element={<PhaseDashboardPage phase="Direkt efter dödsfall" />}
              />
              <Route
                path="/projects/:id/begravning-ceremoni"
                element={<PhaseDashboardPage phase="Begravning & ceremoni" />}
              />
              <Route
                path="/projects/:id/infor-bouppteckning"
                element={<PhaseDashboardPage phase="Inför bouppteckning" />}
              />
              <Route
                path="/projects/:id/under-bouppteckning"
                element={<PhaseDashboardPage phase="Under bouppteckning" />}
              />
              <Route
                path="/projects/:id/avslut-arvskifte"
                element={<PhaseDashboardPage phase="Avslut & arvskifte" />}
              />
              <Route path="/projects/:id/activity" element={<ProjectActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
