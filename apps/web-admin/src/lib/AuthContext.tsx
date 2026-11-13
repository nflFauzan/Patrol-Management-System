'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, UserRole, Division } from '@patrol/types';
import { authApi } from '../field/services/api';

// Verified Demo & Seeded Corporate Accounts
export const DEMO_ACCOUNTS: Array<{
  username: string;
  password: string;
  fullName: string;
  role: string;
  division: string;
  securityRank?: string;
  siteName: string;
  badgeColor: string;
}> = [
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'Administrator Utama',
    role: 'ADMIN_SUPER',
    division: 'STAFF',
    siteName: 'Head Office Sudirman',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    username: 'hendra.chief',
    password: 'hendra123',
    fullName: 'Hendra Wijaya',
    role: 'SECURITY_OFFICER',
    division: 'SECURITY',
    securityRank: 'CHIEF',
    siteName: 'Head Office Sudirman',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    username: 'satpamtest',
    password: 'satpam123',
    fullName: 'Ahmad Fauzi',
    role: 'SECURITY_OFFICER',
    division: 'SECURITY',
    securityRank: 'KOMANDAN',
    siteName: 'Head Office Sudirman',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    username: 'buditest',
    password: 'budi123',
    fullName: 'Budi Santoso',
    role: 'SECURITY_OFFICER',
    division: 'SECURITY',
    securityRank: 'ANGGOTA',
    siteName: 'Head Office Sudirman',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    username: 'akmal',
    password: 'akmal123',
    fullName: 'Akmal Subagja',
    role: 'CLEANER',
    division: 'CLEANING',
    siteName: 'Head Office Sudirman',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    username: 'dedi.driver',
    password: 'driver123',
    fullName: 'Dedi Supriyadi',
    role: 'DRIVER',
    division: 'DRIVER',
    siteName: 'Warehouse & Logistics Cikarang',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
];

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

  // 1. Initial Session Hydration from Local Storage
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = localStorage.getItem('patrol_auth_token');
        const savedUserStr = localStorage.getItem('patrol_user');

        if (savedToken && savedUserStr) {
          const parsedUser: User = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);
          setAuthCookie(savedToken);
        } else {
          setUser(null);
          setToken(null);
          setAuthCookie(null);
        }
      } catch (err) {
        console.error('Failed to parse cached session:', err);
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
    const isPublicStatic = pathname.startsWith('/_next') || pathname.includes('.');

    if (isPublicStatic && !pathname.endsWith('.php')) {
      return;
    }

    if (!user && !isAuthRoute) {
      // User is not authenticated -> redirect to login immediately
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    } else if (user && isAuthRoute) {
      // User is already authenticated -> redirect to appropriate home
      router.replace('/');
    }
  }, [user, isLoading, pathname, router]);

  // 3. Login Action
  const login = useCallback(
    async (credentials: { username: string; password: string; hp_input?: string }): Promise<User> => {
      // Honeypot check
      if (credentials.hp_input && credentials.hp_input.trim() !== '') {
        throw new Error('Validasi keamanan gagal (terdeteksi aktivitas bot)');
      }

      const cleanUsername = credentials.username.trim().toLowerCase();
      const cleanPassword = credentials.password;

      let authenticatedUser: User | null = null;
      let sessionToken = '';

      try {
        // Attempt backend Fastify/NestJS login first
        const res = await authApi.login({
          username: cleanUsername,
          password: cleanPassword,
          hp_input: credentials.hp_input,
        });

        if (res?.user && res?.token) {
          authenticatedUser = res.user;
          sessionToken = res.token;
        }
      } catch (backendError: any) {
        console.warn('Backend API login error, checking seeded credentials fallback:', backendError.message);

        // Fallback to seeded demo credentials if backend service is unreachable or starting
        const matchedDemo = DEMO_ACCOUNTS.find(
          (acc) => acc.username.toLowerCase() === cleanUsername && acc.password === cleanPassword
        );

        if (matchedDemo) {
          authenticatedUser = {
            id: `usr-${cleanUsername}`,
            username: matchedDemo.username,
            email: `${matchedDemo.username}@mahakarya-ops.co.id`,
            fullName: matchedDemo.fullName,
            phone: '0812-9988-7766',
            role: matchedDemo.role as UserRole,
            division: matchedDemo.division as Division,
            securityRank: matchedDemo.securityRank as any,
            siteId: '11111111-1111-1111-1111-111111111111',
            siteName: matchedDemo.siteName,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          sessionToken = `demo_jwt_token_${cleanUsername}_${Date.now()}`;
        } else {
          const errMsg =
            backendError.response?.data?.message ||
            backendError.message ||
            'Username atau password salah. Silakan coba kembali.';
          throw new Error(errMsg);
        }
      }

      if (!authenticatedUser || !sessionToken) {
        throw new Error('Autentikasi gagal. Akun tidak ditemukan.');
      }

      // Save to state & storage
      setUser(authenticatedUser);
      setToken(sessionToken);
      localStorage.setItem('patrol_auth_token', sessionToken);
      localStorage.setItem('patrol_user', JSON.stringify(authenticatedUser));
      setAuthCookie(sessionToken);

      return authenticatedUser;
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

  // 5. Dynamic RBAC Permission Evaluator
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

