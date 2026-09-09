import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../lib/db';

export interface AuthResult {
  success: boolean;
  error?: { message: string; [key: string]: any } | null;
  requiresConfirmation?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to load profile from public.profiles table using Supabase Auth user UUID
  const fetchAndSyncProfile = async (
    userId: string,
    email: string,
    meta?: Record<string, any>
  ): Promise<UserProfile> => {
    try {
      const existing = await db.getProfile(userId);
      if (existing) {
        const fullProfile: UserProfile = {
          ...existing,
          email: email || existing.email,
        };
        setUser(fullProfile);
        return fullProfile;
      }

      // If profile row doesn't exist yet, create/upsert it with real metadata
      const newProfileData: Partial<UserProfile> = {
        full_name: meta?.full_name || email.split('@')[0],
        phone: meta?.phone || '',
        default_district: meta?.default_district || 'Dhaka',
        default_city: meta?.default_city || '',
        default_address: meta?.default_address || '',
      };

      await db.updateProfile(userId, newProfileData);

      const createdProfile: UserProfile = {
        id: userId,
        email,
        full_name: newProfileData.full_name || 'Customer',
        phone: newProfileData.phone || '',
        default_district: newProfileData.default_district || 'Dhaka',
        default_city: newProfileData.default_city || '',
        default_address: newProfileData.default_address || '',
        created_at: new Date().toISOString(),
      };

      setUser(createdProfile);
      return createdProfile;
    } catch (err) {
      console.warn('Profile sync warning:', err);
      const fallback: UserProfile = {
        id: userId,
        email,
        full_name: meta?.full_name || email.split('@')[0],
        phone: meta?.phone || '',
        default_district: meta?.default_district || 'Dhaka',
        default_city: meta?.default_city || '',
        default_address: meta?.default_address || '',
        created_at: new Date().toISOString(),
      };
      setUser(fallback);
      return fallback;
    }
  };

  // Listen to Supabase Auth State and initialize session
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 1. Check initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error: sessionError }) => {
        if (!mounted) return;
        if (sessionError) {
          console.warn('Supabase getSession notice:', sessionError.message);
          setUser(null);
        } else if (session?.user) {
          await fetchAndSyncProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata
          );
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn('Auth initialization notice:', err);
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    // 2. Subscribe to auth changes (login, logout, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setLoading(false);
      } else if (session?.user) {
        await fetchAndSyncProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata
        );
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: {
          message:
            'Supabase is not configured yet. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment settings.',
        },
      };
    }

    setLoading(true);
    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (sbError) {
        return { success: false, error: sbError };
      }

      if (data.user) {
        await fetchAndSyncProfile(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata
        );
        return { success: true };
      }

      return {
        success: false,
        error: { message: 'Failed to retrieve authenticated user session.' },
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'An unexpected error occurred during sign in.' },
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<AuthResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: {
          message:
            'Supabase is not configured yet. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment settings.',
        },
      };
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim();

      const { data, error: sbError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            default_district: 'Dhaka',
          },
        },
      });

      if (sbError) {
        return { success: false, error: sbError };
      }

      // Check if user was created
      if (data.user) {
        // If email confirmation is required by Supabase and no active session was returned
        if (!data.session) {
          return {
            success: true,
            requiresConfirmation: true,
          };
        }

        // Active session exists immediately
        const newProfileData: Partial<UserProfile> = {
          full_name: cleanName,
          phone: cleanPhone,
          default_district: 'Dhaka',
        };

        await db.updateProfile(data.user.id, newProfileData);
        await fetchAndSyncProfile(data.user.id, cleanEmail, data.user.user_metadata);

        return {
          success: true,
          requiresConfirmation: false,
        };
      }

      return {
        success: false,
        error: { message: 'User registration failed. Please try again.' },
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'An unexpected error occurred during registration.' },
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: { message: 'Supabase is not configured.' },
      };
    }

    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (sbError) {
        return { success: false, error: sbError };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Failed to send password reset email.' },
      };
    }
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: { message: 'Supabase is not configured.' },
      };
    }

    try {
      const { error: sbError } = await supabase.auth.updateUser({ password });

      if (sbError) {
        return { success: false, error: sbError };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Failed to update password.' },
      };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<AuthResult> => {
    if (!user) {
      return {
        success: false,
        error: { message: 'You must be signed in to update your profile.' },
      };
    }

    try {
      const updatedUser: UserProfile = {
        ...user,
        ...data,
        updated_at: new Date().toISOString(),
      };
      setUser(updatedUser);

      if (isSupabaseConfigured && supabase) {
        await db.updateProfile(user.id, data);
        await supabase.auth.updateUser({
          data: {
            full_name: data.full_name || user.full_name,
            phone: data.phone || user.phone,
            default_district: data.default_district || user.default_district,
            default_city: data.default_city || user.default_city,
            default_address: data.default_address || user.default_address,
          },
        });
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Could not update profile.' },
      };
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out notice:', e);
      }
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signIn: login,
        register,
        signUp: register,
        resetPassword,
        updatePassword,
        logout,
        signOut: logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
