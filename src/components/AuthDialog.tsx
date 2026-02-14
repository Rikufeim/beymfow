import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const RATE_LIMIT_MS = 2000;
let lastSubmitTime = 0;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const passwordStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const getStrengthColor = (s: number) => {
    if (s <= 1) return 'bg-red-500';
    if (s <= 2) return 'bg-orange-500';
    if (s <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (s: number) => {
    if (s <= 1) return 'Weak';
    if (s <= 2) return 'Fair';
    if (s <= 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setFormError('');

    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setFormError('Please wait a moment before trying again.');
      return;
    }
    lastSubmitTime = now;

    if (isLogin) {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => { if (err.path[0]) errors[err.path[0].toString()] = err.message; });
        setValidationErrors(errors);
        return;
      }
    } else {
      const result = signUpSchema.safeParse({ email, password, confirmPassword });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => { if (err.path[0]) errors[err.path[0].toString()] = err.message; });
        setValidationErrors(errors);
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
      if (error) {
        let message = error.message;
        if (message.includes('Invalid login credentials')) message = 'Invalid email or password.';
        else if (message.includes('User already registered')) message = 'An account with this email already exists. Try signing in.';
        else if (message.includes('Email not confirmed')) message = 'Please verify your email first.';
        setFormError(message);
      } else {
        if (!isLogin) {
          toast({ title: "Check your email", description: "We've sent you a confirmation link." });
        } else {
          onOpenChange(false);
          onSuccess?.();
        }
      }
    } catch (error: any) {
      setFormError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, isLogin, signIn, signUp, toast, onOpenChange, onSuccess]);

  const switchMode = () => {
    setIsLogin(!isLogin);
    setValidationErrors({});
    setFormError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-white/10 text-white sm:max-w-md p-6 gap-0">
        <DialogTitle className="text-2xl font-bold mb-1">
          {isLogin ? 'Sign In' : 'Create Account'}
        </DialogTitle>
        <p className="text-sm text-gray-400 mb-5">
          {isLogin ? 'Welcome back to Beymflow' : 'Join Beymflow today'}
        </p>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              autoComplete="email"
              className="bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 h-11 rounded-lg"
            />
            {validationErrors.email && <p className="text-xs text-red-400">{validationErrors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 h-11 pr-10 rounded-lg"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" tabIndex={-1}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isLogin && password && (
              <div className="space-y-1.5 mt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${getStrengthColor(passwordStrength(password))}`} style={{ width: `${(passwordStrength(password) / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{getStrengthText(passwordStrength(password))}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                  <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                    {password.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} 8+ characters
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                    {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                    {/[a-z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                    {/[0-9]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} Number
                  </div>
                </div>
              </div>
            )}
            {validationErrors.password && <p className="text-xs text-red-400">{validationErrors.password}</p>}
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 h-11 pr-10 rounded-lg"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1"><X className="h-3 w-3" /> Passwords don't match</p>
              )}
              {validationErrors.confirmPassword && <p className="text-xs text-red-400">{validationErrors.confirmPassword}</p>}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 h-11 text-sm font-semibold rounded-lg">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{isLogin ? 'Signing in...' : 'Creating account...'}</span>
            ) : 'Continue'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm text-gray-400">{isLogin ? "Don't have an account? " : 'Already have an account? '}</span>
          <button onClick={switchMode} type="button" className="text-sm text-white hover:text-gray-300 font-medium underline">{isLogin ? 'Sign up' : 'Sign in'}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
