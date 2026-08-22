import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return user?.isAdmin ? children : <Navigate to="/dashboard" replace />;
}
