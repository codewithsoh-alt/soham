import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { AuthUser } from '../types';

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

// Check if valid URL & Key are available
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envUrl.startsWith('http') &&
  !envUrl.includes('your-project') &&
  envKey &&
  !envKey.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(envUrl!, envKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Local fallback store for offline / preview demo mode
const LOCAL_USERS_KEY = 'daily_tracker_registered_users';
const CURRENT_SESSION_KEY = 'daily_tracker_current_session';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string; // simple local hash for simulation
}

const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local users', e);
  }
};

// Map Supabase User or Local User to AuthUser
export const mapSupabaseUser = (sbUser: User): AuthUser => ({
  id: sbUser.id,
  email: sbUser.email || '',
  name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Student',
  isDemo: false,
});

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed, please check your credentials');
    }

    return mapSupabaseUser(data.user);
  }

  // Local resilient fallback mode
  const users = getStoredUsers();
  const existing = users.find((u) => u.email === cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  // Generate a realistic UUID
  const newId = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const newUser: StoredUser = {
    id: newId,
    email: cleanEmail,
    passwordHash: btoa(password), // simulated hash
  };

  users.push(newUser);
  saveStoredUsers(users);

  const authUser: AuthUser = {
    id: newUser.id,
    email: newUser.email,
    name: cleanEmail.split('@')[0],
    isDemo: false,
  };

  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(authUser));
  return authUser;
}

/**
 * Sign in an existing user
 */
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed: user profile not found');
    }

    return mapSupabaseUser(data.user);
  }

  // Local resilient fallback mode
  const users = getStoredUsers();
  const user = users.find((u) => u.email === cleanEmail);

  if (!user || user.passwordHash !== btoa(password)) {
    throw new Error('Invalid email or password. Please try again.');
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: cleanEmail.split('@')[0],
    isDemo: false,
  };

  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(authUser));
  return authUser;
}

/**
 * Instant Demo Login (convenient one-click preview)
 */
export async function loginAsDemoStudent(): Promise<AuthUser> {
  const demoUser: AuthUser = {
    id: 'demo_student_01',
    email: 'student.demo@university.edu',
    name: 'Demo Student',
    isDemo: true,
  };
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(demoUser));
  return demoUser;
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error', e);
    }
  }
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

/**
 * Get active session on initial load
 */
export async function getActiveUserSession(): Promise<AuthUser | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        return mapSupabaseUser(data.session.user);
      }
    } catch (e) {
      console.warn('Failed to retrieve Supabase session', e);
    }
  }

  // Check local session
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
