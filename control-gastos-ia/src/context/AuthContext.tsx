'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { dbService } from '@/lib/dbService';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const currentUser = await dbService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchUser();
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Simple route guarding
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && isPublicRoute && pathname !== '/') {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await dbService.signIn(email, password);
      await fetchUser();
      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      await dbService.signUp(email, password, fullName);
      await fetchUser();
      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await dbService.signOut();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
