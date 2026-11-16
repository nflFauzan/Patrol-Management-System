import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@patrol/types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string; hp_input?: string }) => Promise<User>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setAuthCookie = (tokenValue: string | null) => {
    if (typeof document === 'undefined') return;
    if (tokenValue) {
      document.cookie = `patrol_session=${tokenValue}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = 'patrol_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
    }
  };

  // 1. Session Hydration with Server Validation
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('patrol_auth_token');
        const savedUserStr = localStorage.getItem('patrol_user');

        if (!savedToken || savedToken.startsWith('demo_')) {
          setUser(null);
          setToken(null);
          setAuthCookie(null);
          localStorage.removeItem('patrol_auth_token');
          localStorage.removeItem('patrol_user');
          setIsLoading(false);
          return;
        }

        // Cache hydration
        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            setUser(parsed);
            setToken(savedToken);
            setAuthCookie(savedToken);
          } catch {}
        }

        // Server-side profile verification
        try {
          const profile = await authApi.getProfile();
          if (profile && profile.id) {
            setUser(profile);
            setToken(savedToken);
            setAuthCookie(savedToken);
            localStorage.setItem('patrol_user', JSON.stringify(profile));
          } else {
            throw new Error('Profile invalid');
          }
        } catch (apiErr: any) {
          // If offline (network error), keep cached profile so PWA functions offline!
          if (!navigator.onLine || apiErr.code === 'ERR_NETWORK' || !apiErr.response) {
            // Keep local cached user for offline PWA operation
          } else if (apiErr.response?.status === 401 || apiErr.response?.status === 403) {
            // Unauthenticated or revoked on server
            setUser(null);
            setToken(null);
            setAuthCookie(null);
            localStorage.removeItem('patrol_auth_token');
            localStorage.removeItem('patrol_user');
          }
        }
      } catch (err) {
        console.warn('Error during PWA auth init:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Login Action
  const login = useCallback(
    async (credentials: { username: string; password: string; hp_input?: string }): Promise<User> => {
      if (credentials.hp_input && credentials.hp_input.trim() !== '') {
        throw new Error('Bot validation failed');
      }

      const cleanUsername = credentials.username.trim().toLowerCase();
      const cleanPassword = credentials.password;

      if (!cleanUsername || !cleanPassword) {
        throw new Error('Username dan kata sandi wajib diisi');
      }

      const res = await authApi.login({
        username: cleanUsername,
        password: cleanPassword,
        hp_input: credentials.hp_input,
      });

      if (!res?.user || !res?.token) {
        throw new Error('Respons login tidak valid.');
      }

      const authenticatedUser = res.user;
      const sessionToken = res.token;

      setUser(authenticatedUser);
      setToken(sessionToken);
      localStorage.setItem('patrol_auth_token', sessionToken);
      localStorage.setItem('patrol_user', JSON.stringify(authenticatedUser));
      setAuthCookie(sessionToken);

      return authenticatedUser;
    },
    []
  );

  // 3. Logout Action
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('patrol_auth_token');
    localStorage.removeItem('patrol_user');
    setAuthCookie(null);
    window.location.href = '/login';
  }, []);

  // 4. Refresh User Profile
  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      if (profile && profile.id) {
        setUser(profile);
        localStorage.setItem('patrol_user', JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Failed to refresh PWA user:', err);
    }
  }, []);

  // 5. Permission Checker
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      const roleStr = user.role as string;
      if (roleStr === 'ADMIN_SUPER' || roleStr === 'SUPER_ADMIN') return true;
      return Array.isArray(user.permissions) && user.permissions.includes(permission);
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
