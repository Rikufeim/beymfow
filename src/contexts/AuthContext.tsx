import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UsageInfo {
  hasActiveSubscription: boolean;
  canGenerate: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  creditsRemaining: number; // -1 = unlimited
  creditsUsed: number;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  usageInfo: UsageInfo | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const navigate = useNavigate();

  const refreshUsage = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-usage', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!error && data) {
        setUsageInfo(data);
      }
    } catch (error) {
      console.error('Error refreshing usage:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          setTimeout(() => {
            refreshUsage();
          }, 0);
          
          // Handle post-OAuth redirect: check if there's a pending navigation
          if (event === 'SIGNED_IN') {
            const pendingRedirect = sessionStorage.getItem('auth_redirect_after');
            if (pendingRedirect) {
              sessionStorage.removeItem('auth_redirect_after');
              // Small delay to let state settle
              setTimeout(() => {
                navigate(pendingRedirect);
              }, 100);
            }
          }
        } else {
          setUsageInfo(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        setTimeout(() => {
          refreshUsage();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore logout errors - clear local state anyway
      console.log('Logout error (ignored):', error);
    }
    // Always clear local state and redirect, even if server logout fails
    setSession(null);
    setUser(null);
    setUsageInfo(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      usageInfo,
      signIn,
      signUp,
      signOut,
      refreshUsage
    }}>
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
