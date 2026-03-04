import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UsageInfo {
  hasActiveSubscription: boolean;
  canGenerate: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  plan: 'free' | 'pro';
  creditsRemaining: number;
  creditsUsed: number;
  isAdmin?: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
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
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a ref to the latest session so async callbacks always have fresh data
  const sessionRef = useRef<Session | null>(null);

  const fetchUsage = useCallback(async (accessToken: string) => {
    // Skip if we've already signed out
    if (!sessionRef.current) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-usage', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Ignore errors if session was cleared while request was in-flight
      if (!sessionRef.current) return;

      if (!error && data) {
        setUsageInfo({
          hasActiveSubscription: data.hasActiveSubscription,
          canGenerate: data.canGenerate,
          subscriptionTier: data.subscriptionTier,
          plan: data.plan || 'free',
          creditsRemaining: data.creditsRemaining,
          creditsUsed: data.creditsUsed,
          isAdmin: data.isAdmin,
          subscriptionStatus: data.subscriptionStatus || null,
          currentPeriodEnd: data.currentPeriodEnd || null,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        });
      }
    } catch (error) {
      // Silently ignore if logged out
      if (!sessionRef.current) return;
      console.error('Error refreshing usage:', error);
    }
  }, []);

  // Public refreshUsage reads from the session ref
  const refreshUsage = useCallback(async () => {
    const token = sessionRef.current?.access_token;
    if (token) await fetchUsage(token);
  }, [fetchUsage]);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        sessionRef.current = newSession;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession) {
          // Use the token directly – no stale closure
          fetchUsage(newSession.access_token);

          if (event === 'SIGNED_IN') {
            const pendingRedirect = sessionStorage.getItem('auth_redirect_after');
            if (pendingRedirect) {
              sessionStorage.removeItem('auth_redirect_after');
              setTimeout(() => navigate(pendingRedirect), 100);
            }
          }
        } else {
          setUsageInfo(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      sessionRef.current = existingSession;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);

      if (existingSession) {
        fetchUsage(existingSession.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    if (session) {
      refreshIntervalRef.current = setInterval(() => {
        refreshUsage();
      }, 60_000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [session, refreshUsage]);

  // Refresh on window focus (e.g. returning from Stripe checkout)
  useEffect(() => {
    const handleFocus = () => {
      if (sessionRef.current) refreshUsage();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshUsage]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    return { error };
  };

  const signOut = async () => {
    // Clear refs and state FIRST to prevent stale-token requests
    sessionRef.current = null;
    setSession(null);
    setUser(null);
    setUsageInfo(null);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Logout error (ignored):', error);
    }
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading, usageInfo,
      signIn, signUp, signOut, refreshUsage
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
