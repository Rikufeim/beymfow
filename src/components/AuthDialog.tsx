import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return false;
    }
    if (!isLogin && password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = isLogin
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

      if (error) {
        let message = error.message;
        if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
          message = 'Invalid email or password.';
        } else if (message.includes('User already registered') || message.includes('user_already_exists')) {
          message = 'An account with this email already exists. Try signing in.';
        } else if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) {
          message = 'Please verify your email before signing in.';
        } else if (message.includes('Too many requests') || message.includes('over_email_send_rate_limit')) {
          message = 'Too many attempts. Please wait a moment.';
        } else if (message.includes('Password should be at least')) {
          message = 'Password must be at least 6 characters long.';
        }
        setFormError(message);
      } else {
        if (!isLogin) {
          setEmailSent(true);
        } else {
          // Close immediately – AuthDialogContext will fire onSuccess via useEffect
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, isLogin, signIn, signUp, onOpenChange, onSuccess]);

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormError('');
    setPassword('');
    setEmailSent(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setEmail('');
      setPassword('');
      setFormError('');
      setEmailSent(false);
      setIsLogin(true);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-md p-6 gap-0">
        <AnimatePresence mode="wait">
          {emailSent ? (
            <motion.div
              key="email-sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-xl font-bold mb-2">Check your email</DialogTitle>
              <p className="text-sm text-gray-400 mb-1">We sent a confirmation link to</p>
              <p className="text-sm text-white font-medium mb-4">{email}</p>
              <p className="text-xs text-gray-500 mb-6">
                Click the link in the email to activate your account. If you don't see it, check your spam folder.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={async () => {
                    setLoading(true);
                    await signUp(email.trim(), password);
                    setLoading(false);
                    toast({ title: "Sent!", description: "Confirmation link resent successfully." });
                  }}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/5 h-10 rounded-lg text-sm"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend email'}
                </Button>
                <button
                  onClick={switchMode}
                  className="text-xs text-gray-500 hover:text-white transition-colors py-1"
                >
                  Back to sign in
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogTitle className="text-2xl font-bold mb-1">
                {isLogin ? 'Sign In' : 'Create Account'}
              </DialogTitle>
              <p className="text-sm text-gray-400 mb-5">
                {isLogin ? 'Welcome back to Beymflow' : 'Start for free today'}
              </p>

              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-400">{formError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                    autoComplete="email"
                    autoFocus
                    className="bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={isLogin ? "Your password" : "At least 6 characters"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      className="bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 h-11 pr-10 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isLogin && password.length > 0 && password.length < 6 && (
                    <p className="text-xs text-orange-400">Too short (min. 6 characters)</p>
                  )}
                  {!isLogin && password.length >= 6 && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Password looks good
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-gray-200 h-11 text-sm font-semibold rounded-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? 'Sign in' : 'Create account'
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-400">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={switchMode}
                  type="button"
                  className="text-sm text-white hover:text-gray-300 font-medium underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog >
  );
};
