import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext.jsx';

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) {
    return <div className="grid min-h-screen place-items-center text-white">Loading…</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
};
