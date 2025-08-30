import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  hall?: string;
  room?: string;
  role?: 'admin' | 'client';
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  register: (
    userData: Omit<User, 'id' | 'role'> & { password: string }
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true });

  // Enhanced toUser function to get role from multiple sources
  const toUser = async (u: any): Promise<User> => {
    let role = u.user_metadata?.role;
    
    // If role is not in metadata, try to get it from the users table
    if (!role) {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', u.id)
          .single();
        
        if (!error && userData) {
          role = userData.role;
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }

    return {
      id: u.id,
      email: u.email ?? '',
      name: u.user_metadata?.full_name || u.user_metadata?.name,
      phone: u.user_metadata?.phone,
      hall: u.user_metadata?.hall,
      room: u.user_metadata?.room,
      role: role || 'client', // Default to client if no role found
    };
  };

  // Fetch current user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const user = await toUser(data.user);
        setAuthState({ user, loading: false });
      } else {
        setAuthState({ user: null, loading: false });
      }
    };

    getUser();

    // Listen to auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await toUser(session.user);
        setAuthState({ user, loading: false });
      } else {
        setAuthState({ user: null, loading: false });
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Login function — get user data including role from database
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };

      if (data.user) {
        console.log('Auth user:', data.user); // Debug log
        console.log('Auth metadata:', data.user.user_metadata); // Debug log
        
        // Try to get role from users table first
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('User data from database:', userData); // Debug log
        console.log('Database query error:', userError); // Debug log

        let loggedInUser: User;
        
        if (!userError && userData) {
          // Use data from users table
          loggedInUser = {
            id: data.user.id,
            email: data.user.email ?? '',
            name: userData.name,
            phone: userData.phone,
            hall: userData.hall,
            room: userData.room,
            role: userData.role,
          };
          console.log('Using database role:', userData.role); // Debug log
        } else {
          // Fallback to metadata if database query fails (due to RLS)
          console.log('Database query failed, using metadata'); // Debug log
          loggedInUser = {
            id: data.user.id,
            email: data.user.email ?? '',
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            phone: data.user.user_metadata?.phone,
            hall: data.user.user_metadata?.hall,
            room: data.user.user_metadata?.room,
            role: data.user.user_metadata?.role || 'client',
          };
          console.log('Using metadata role:', data.user.user_metadata?.role); // Debug log
        }
        
        setAuthState({ user: loggedInUser, loading: false });
        
        console.log('Final logged in user:', loggedInUser); // Debug log
        console.log('Final user role:', loggedInUser.role); // Debug log
        
        return { success: true, user: loggedInUser };
      }
      return { success: false, error: 'No user data returned' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, loading: false });
  };

  // Register function (with metadata + insert into users table)
  const register = async (
    userData: Omit<User, 'id' | 'role'> & { password: string }
  ) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            phone: userData.phone,
            hall: userData.hall,
            room: userData.room,
            role: 'client',
          },
        },
      });

      if (authError) return { success: false, error: authError.message };

      if (authData?.user?.id) {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            hall: userData.hall,
            room: userData.room,
            role: 'client',
          },
        ]);
        if (insertError) return { success: false, error: insertError.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const isAuthenticated = !!authState.user;

  return (
    <AuthContext.Provider value={{ ...authState, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth anywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};