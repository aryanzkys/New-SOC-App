import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loginAdmin: (email: string, pass: string) => Promise<{ error: string | null }>;
  loginUser: (nisn: string, token: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = useCallback(async () => {
    try {
      // This now checks our custom session in localStorage, which is simpler for this dual-auth model
      const session = localStorage.getItem('soc_session');
      if(session){
        const parsedSession = JSON.parse(session);
        // We just trust the session data for this mock app
        setUser(parsedSession.user as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const loginAdmin = async (email: string, pass: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      setLoading(false);
      return { error: error.message };
    }
    if(data.user) {
        // In this mock, signInWithPassword returns the full user object
        setUser(data.user as User);
    }
    setLoading(false);
    return { error: null };
  };
  
  const loginUser = async (nisn: string, token: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithNisnToken({ nisn, token });
    if (error) {
      setLoading(false);
      return { error: error.message };
    }
    if (data.user) {
        setUser(data.user as User);
    }
    setLoading(false);
    return { error: null };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loginAdmin, loginUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
