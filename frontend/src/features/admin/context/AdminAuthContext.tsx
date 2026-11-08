import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../types/admin';

export interface AdminAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

interface AdminAuthContextType {
  user: AdminAuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => Promise<boolean>;
  quickLogin: (role?: 'admin' | 'moderator') => void;
  logout: () => void;
}

const ADMIN_STORAGE_KEY = 'scamora_admin_session';

const DEFAULT_ADMIN: AdminAuthUser = {
  id: 'usr-1',
  email: 'admin@scamora.ai',
  name: 'Admin Utama Scamora',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
};

const DEFAULT_MODERATOR: AdminAuthUser = {
  id: 'usr-2',
  email: 'moderator@scamora.ai',
  name: 'Tim Patroli Siber',
  role: 'moderator',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminAuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, pin: string): Promise<boolean> => {
    // Standard mock verification for admin dashboard demo
    if (email.includes('admin') || pin === 'admin123' || pin === '123456') {
      setUser(DEFAULT_ADMIN);
      return true;
    }
    if (email.includes('mod') || pin === 'mod123') {
      setUser(DEFAULT_MODERATOR);
      return true;
    }
    return false;
  };

  const quickLogin = (role: 'admin' | 'moderator' = 'admin') => {
    setUser(role === 'admin' ? DEFAULT_ADMIN : DEFAULT_MODERATOR);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
