import React, { createContext, useContext, useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthDialogContextType {
  openAuthDialog: (onSuccess?: () => void) => void;
  closeAuthDialog: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);
const LazyAuthDialog = lazy(() => import('@/components/AuthDialog').then((module) => ({ default: module.AuthDialog })));

export const AuthDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | undefined>();
  const { user } = useAuth();

  // Auto-close dialog when user becomes authenticated (e.g. after OAuth redirect)
  useEffect(() => {
    if (user && open) {
      setOpen(false);
      onSuccessCallback?.();
      setOnSuccessCallback(undefined);
    }
  }, [user, open, onSuccessCallback]);

  const openAuthDialog = useCallback((onSuccess?: () => void) => {
    setOnSuccessCallback(() => onSuccess);
    setOpen(true);
  }, []);

  const closeAuthDialog = useCallback(() => {
    setOpen(false);
    setOnSuccessCallback(undefined);
  }, []);

  return (
    <AuthDialogContext.Provider value={{ openAuthDialog, closeAuthDialog }}>
      {children}
      {open ? (
        <Suspense fallback={null}>
          <LazyAuthDialog open={open} onOpenChange={setOpen} onSuccess={onSuccessCallback} />
        </Suspense>
      ) : null}
    </AuthDialogContext.Provider>
  );
};

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext);
  if (!context) throw new Error('useAuthDialog must be used within AuthDialogProvider');
  return context;
};
