import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { ProjectRedirect } from './components/ProjectRedirect';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { DashboardHubPage } from './pages/DashboardHub';
import { PhaseDashboardPage } from './pages/PhaseDashboard';
import { ProjectActivityPage } from './pages/ProjectActivity';
import { SettingsPage } from './pages/Settings';
import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsers';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLog';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects/:id" element={<ProjectRedirect />} />
              <Route path="/projects/:id/dashboard" element={<DashboardHubPage />} />
              <Route path="/projects/:id/foreberedelser" element={<PhaseDashboardPage phase="Förberedelser" />} />
              <Route path="/projects/:id/forrattningen" element={<PhaseDashboardPage phase="Förrättningen" />} />
              <Route
                path="/projects/:id/efter-forrattningen"
                element={<PhaseDashboardPage phase="Efter förrättningen" />}
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
