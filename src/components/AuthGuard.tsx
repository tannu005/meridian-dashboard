import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="w-8 h-8 rounded-full border-t-2 border-orange-400 animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
