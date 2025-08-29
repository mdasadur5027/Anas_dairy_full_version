import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  hall: string;
  room: string;
  role: 'client' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'role'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setAuthState({ user: null, isAuthenticated: false, loading: false });
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setAuthState({ user: null, isAuthenticated: false, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          hall: data.hall,
          room: data.room,
          role: data.role,
        };
        setAuthState({ user, isAuthenticated: true, loading: false });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setAuthState({ user: null, isAuthenticated: false, loading: false });
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const register = async (userData: Omit<User, 'id' | 'role'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting registration process for:', userData.email);
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        console.error('Supabase auth signup error:', authError);
        return { success: false, error: `Authentication failed: ${authError.message}` };
      }

      if (!authData.user) {
        console.error('No user returned from auth signup');
        return { success: false, error: 'Failed to create user account' };
      }

      console.log('Auth signup successful, user ID:', authData.user.id);

      // Create user profile in public.users table
      console.log('Creating user profile for:', authData.user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          hall: userData.hall,
          room: userData.room,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Clean up auth user if profile creation fails
        await supabase.auth.signOut();
        return { success: false, error: `Failed to create user profile: ${profileError.message}` };
      }
      
      if (!profileData) {
        console.error('No profile data returned');
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to create user profile' };
      }
      
      console.log('User profile created successfully:', profileData);
      
      // Update auth state with the new user
      const user: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        hall: profileData.hall,
        room: profileData.room,
        role: profileData.role,
      };
      
      setAuthState({ user, isAuthenticated: true, loading: false });

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      // Clean up any partial state
      await supabase.auth.signOut();
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};