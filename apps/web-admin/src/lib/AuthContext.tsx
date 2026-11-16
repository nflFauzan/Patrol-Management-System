'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, UserRole } from '@patrol/types';
import { authApi } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string; hp_input?: string }) => Promise<User>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const pathname = usePathname();
  const router = useRouter();

  // Helper to sync cookie for middleware / server compatibility
  const setAuthCookie = (tokenValue: string | null) => {
    if (typeof document === 'undefined') return;
    if (tokenValue) {
      document.cookie = `patrol_session=${tokenValue}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = 'patrol_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
    }
  };

  // 1. Initial Session Hydration from Local Storage with Server Validation
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('patrol_auth_token');
        const savedUserStr = localStorage.getItem('patrol_user');

        // Discard any legacy demo tokens
        if (!savedToken || savedToken.startsWith('demo_')) {
          setUser(null);
          setToken(null);
          setAuthCookie(null);
          localStorage.removeItem('patrol_auth_token');
          localStorage.removeItem('patrol_user');
          setIsLoading(false);
          return;
        }

        // Fast hydration to prevent UI flash
        if (savedUserStr) {
          try {
            const cachedUser: User = JSON.parse(savedUserStr);
            setUser(cachedUser);
            setToken(savedToken);
            setAuthCookie(savedToken);
          } catch {}
        }

        // Authoritative verification with backend API
        try {
          const profile = await authApi.getProfile();
          if (profile && profile.id) {
            setUser(profile);
            setToken(savedToken);
            setAuthCookie(savedToken);
            localStorage.setItem('patrol_user', JSON.stringify(profile));
          } else {
            throw new Error('Invalid profile');
          }
        } catch (apiErr: any) {
          // If server rejects with 401 (expired) or 403 (suspended/unapproved), wipe session
          if (apiErr.response?.status === 401 || apiErr.response?.status === 403) {
            setUser(null);
            setToken(null);
            setAuthCookie(null);
            localStorage.removeItem('patrol_auth_token');
            localStorage.removeItem('patrol_user');
          }
        }
      } catch (err) {
        setUser(null);
        setToken(null);
        setAuthCookie(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Navigation & Protected Route Guard
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname === '/login' || pathname === '/login.php' || pathname === '/register';
    const isPublicPortalRoute = pathname === '/' || isAuthRoute;
    const isPublicStatic = pathname.startsWith('/_next') || pathname.includes('.');

    if (isPublicStatic && !pathname.endsWith('.php')) {
      return;
    }

    if (!user && !isPublicPortalRoute) {
      // User is not authenticated accessing protected route -> redirect to login
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [user, isLoading, pathname, router]);

  // 3. Login Action - STRICT BACKEND ONLY
  const login = useCallback(
    async (credentials: { username: string; password: string; hp_input?: string }): Promise<User> => {
      // Honeypot anti-bot validation
      if (credentials.hp_input && credentials.hp_input.trim() !== '') {
        throw new Error('Validasi keamanan gagal (terdeteksi aktivitas bot)');
      }

      const cleanUsername = credentials.username.trim().toLowerCase();
      const cleanPassword = credentials.password;

      if (!cleanUsername || !cleanPassword) {
        throw new Error('Username dan kata sandi wajib diisi');
      }

      try {
        const res = await authApi.login({
          username: cleanUsername,
          password: cleanPassword,
          hp_input: credentials.hp_input,
        });

        if (!res?.user || !res?.token) {
          throw new Error('Autentikasi gagal. Respons server tidak valid.');
        }

        const authenticatedUser = res.user;
        const sessionToken = res.token;

        // Save to state & storage
        setUser(authenticatedUser);
        setToken(sessionToken);
        localStorage.setItem('patrol_auth_token', sessionToken);
        localStorage.setItem('patrol_user', JSON.stringify(authenticatedUser));
        setAuthCookie(sessionToken);

        return authenticatedUser;
      } catch (err: any) {
        const errMsg =
          err.response?.data?.message ||
          err.message ||
          'Username atau kata sandi tidak valid. Silakan coba kembali.';
        throw new Error(errMsg);
      }
    },
    []
  );

  // 4. Logout Action
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('patrol_auth_token');
    localStorage.removeItem('patrol_user');
    setAuthCookie(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.replace('/login');
    }
  }, [router]);

  // 5. Refresh User Profile & Permissions from Backend
  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      if (profile && profile.id) {
        setUser(profile);
        localStorage.setItem('patrol_user', JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  }, []);

  // 6. Dynamic RBAC Permission Evaluator
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      const roleStr = user.role as string;
      if (roleStr === 'ADMIN_SUPER' || roleStr === 'SUPER_ADMIN') return true;
      return Array.isArray(user.permissions) && user.permissions.includes(permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissionList: string[]): boolean => {
      if (!user) return false;
      const roleStr = user.role as string;
      if (roleStr === 'ADMIN_SUPER' || roleStr === 'SUPER_ADMIN') return true;
      if (!Array.isArray(user.permissions)) return false;
      return permissionList.some((p) => user.permissions!.includes(p));
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissionList: string[]): boolean => {
      if (!user) return false;
      const roleStr = user.role as string;
      if (roleStr === 'ADMIN_SUPER' || roleStr === 'SUPER_ADMIN') return true;
      if (!Array.isArray(user.permissions)) return false;
      return permissionList.every((p) => user.permissions!.includes(p));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
