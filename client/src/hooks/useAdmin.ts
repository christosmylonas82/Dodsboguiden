import { useAuth } from '../context/AuthContext';

export function useAdmin() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return { isAdmin, user };
}
