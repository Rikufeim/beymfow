import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { lovable } from '@/integrations/lovable/index';

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
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          let message = error.message;
          if (message.includes('Invalid login credentials')) message = 'Invalid email or password.';
          else if (message.includes('Email not confirmed')) message = 'Please verify your email first. Check your inbox or spam folder.';
          setFormError(message);
        } else {
          // Close immediately – AuthDialogContext will fire onSuccess via useEffect
          onOpenChange(false);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          let message = error.message;
          if (message.includes('User already registered')) message = 'An account with this email already exists. Try signing in.';
          else if (message.includes('rate limit')) message = 'Too many attempts. Please wait a moment.';
          setFormError(message);
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link. Check your spam folder too.",
            duration: 8000,
          });
          // Switch to login mode so user can sign in after confirming
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (error: any) {
      setFormError('An unexpected error occurred. Please try again.');
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

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              // Store the onSuccess redirect intent for post-OAuth
              // (OAuth does a full page redirect, so dialog state is lost)
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) setFormError(error.message || 'Google sign-in failed');
            } catch (err: any) {
              setFormError(err.message || 'Google sign-in failed');
            }
          }}
          className="w-full h-11 rounded-lg border-white/10 bg-neutral-900/50 text-white hover:bg-neutral-800 flex items-center justify-center gap-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-black px-3 text-gray-500">or</span></div>
        </div>

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
