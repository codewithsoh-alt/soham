import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import {
  getActiveUserSession,
  loginUser,
  registerUser,
  loginAsDemoStudent,
  logoutUser,
  supabase,
  isSupabaseConfigured,
  mapSupabaseUser,
} from '../services/supabase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const activeUser = await getActiveUserSession();
        if (mounted) {
          setUser(activeUser);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    // Setup Supabase real-time auth change listener if configured
    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          if (session?.user) {
            setUser(mapSupabaseUser(session.user));
          } else {
            setUser(null);
          }
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    const loggedUser = await loginUser(email, pass);
    setUser(loggedUser);
  };

  const signUp = async (email: string, pass: string) => {
    const newUser = await registerUser(email, pass);
    setUser(newUser);
  };

  const signInDemo = async () => {
    const demo = await loginAsDemoStudent();
    setUser(demo);
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
