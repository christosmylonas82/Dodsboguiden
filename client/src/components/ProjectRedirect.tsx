import { Navigate, useParams } from 'react-router-dom';

export function ProjectRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/projects/${id}/dashboard`} replace />;
}
