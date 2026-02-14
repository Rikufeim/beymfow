import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthDialog } from '@/components/AuthDialog';

interface AuthDialogContextType {
  openAuthDialog: (onSuccess?: () => void) => void;
  closeAuthDialog: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export const AuthDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | undefined>();

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
      <AuthDialog open={open} onOpenChange={setOpen} onSuccess={onSuccessCallback} />
    </AuthDialogContext.Provider>
  );
};

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext);
  if (!context) throw new Error('useAuthDialog must be used within AuthDialogProvider');
  return context;
};
