import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1527] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
        <p className="text-xs text-slate-400 font-medium">Memverifikasi akses operasional...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-[#0d1527] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold">Akses Tidak Diberikan</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Akun Anda tidak memiliki izin untuk membuka fitur ini ({requiredPermission}).
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Kembali
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
