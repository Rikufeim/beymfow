import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import StarsBackground from '@/components/StarsBackground';

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

// Rate limiting
const RATE_LIMIT_MS = 2000;
let lastSubmitTime = 0;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';

  React.useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const passwordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setFormError('');

    // Rate limit
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setFormError('Please wait a moment before trying again.');
      return;
    }
    lastSubmitTime = now;

    // Validate
    if (isLogin) {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message;
        });
        setValidationErrors(errors);
        return;
      }
    } else {
      const result = signUpSchema.safeParse({ email, password, confirmPassword });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message;
        });
        setValidationErrors(errors);
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        // Map generic errors to user-friendly messages
        let message = error.message;
        if (message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (message.includes('User already registered')) {
          message = 'An account with this email already exists. Try signing in instead.';
        } else if (message.includes('Email not confirmed')) {
          message = 'Please verify your email before signing in. Check your inbox for the confirmation link.';
        }
        setFormError(message);
      } else {
        if (!isLogin) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link. Please verify your email to continue.",
          });
        } else {
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      setFormError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, isLogin, signIn, signUp, navigate, redirectPath, toast]);

  const switchMode = () => {
    setIsLogin(!isLogin);
    setValidationErrors({});
    setFormError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <StarsBackground>
      <div className="min-h-screen text-white flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-black relative z-10">
          {/* Logo */}
          <div className="p-6 sm:p-8">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/images/beymflow-logo.png"
                alt="Beymflow"
                className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
              />
            </Link>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex items-center px-6 sm:px-12 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                  {isLogin ? 'Welcome to' : 'Join'}
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Beymflow
                </h2>
              </div>

              {/* Form error */}
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-400">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                    autoComplete="email"
                    className="w-full bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:bg-neutral-900 h-12 rounded-lg transition-all"
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-400">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      className="w-full bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:bg-neutral-900 h-12 pr-10 rounded-lg transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isLogin && password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength(password))}`}
                            style={{ width: `${(passwordStrength(password) / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{getStrengthText(passwordStrength(password))}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                          {password.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          At least 8 characters
                        </div>
                        <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                          {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          One uppercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                          {/[a-z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          One lowercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                          {/[0-9]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          One number
                        </div>
                      </div>
                    </div>
                  )}
                  {validationErrors.password && (
                    <p className="text-xs text-red-400">{validationErrors.password}</p>
                  )}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:bg-neutral-900 h-12 pr-10 rounded-lg transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        Passwords don't match
                      </p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Passwords match
                      </p>
                    )}
                    {validationErrors.confirmPassword && (
                      <p className="text-xs text-red-400">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 h-12 text-base font-semibold rounded-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-gray-400">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={switchMode}
                  type="button"
                  className="text-sm text-white hover:text-gray-300 font-medium transition-colors underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-xs text-gray-500">
                  <Link to="#" className="text-gray-400 hover:text-white underline">Terms of Service</Link>
                  {' and '}
                  <Link to="#" className="text-gray-400 hover:text-white underline">Privacy Policy</Link>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Stars Background */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center" />
      </div>
    </StarsBackground>
  );
};

export default Auth;
