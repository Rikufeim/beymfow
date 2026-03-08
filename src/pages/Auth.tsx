import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, AlertCircle, Mail } from 'lucide-react';

import SEOHead from '@/components/SEOHead';

const LOGO_URL = "/images/beymflow-logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const redirectPath = new URLSearchParams(window.location.search).get('redirect') || sessionStorage.getItem('auth_redirect_after') || '/flow';

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setFormError('');
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setFormError(error.message || 'Google sign-in failed.');
      }
    } catch (e: any) {
      setFormError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      sessionStorage.removeItem('auth_redirect_after');
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

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
          message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (message.includes('User already registered') || message.includes('user_already_exists')) {
          message = 'An account with this email already exists. Try signing in instead.';
        } else if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) {
          message = 'Please verify your email before signing in. Check your inbox.';
        } else if (message.includes('Too many requests') || message.includes('over_email_send_rate_limit')) {
          message = 'Too many attempts. Please wait a moment and try again.';
        } else if (message.includes('Password should be at least')) {
          message = 'Password must be at least 6 characters long.';
        }
        setFormError(message);
      } else {
        if (!isLogin) {
          setEmailSent(true);
        } else {
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, isLogin, signIn, signUp, navigate, redirectPath]);

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormError('');
    setPassword('');
    setEmailSent(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="min-h-screen text-white flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
            <p className="text-gray-400 mb-2">We sent a confirmation link to</p>
            <p className="text-white font-medium mb-6">{email}</p>
            <p className="text-sm text-gray-500 mb-8">
              Click the link in the email to activate your account. If you don't see it, check your spam folder.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={async () => {
                  setLoading(true);
                  const { error } = await signUp(email.trim(), password);
                  setLoading(false);
                  if (!error) {
                    toast({ title: "Sent!", description: "Confirmation link resent successfully." });
                  }
                }}
                disabled={loading}
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5 h-11 rounded-lg"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend email'}
              </Button>
              <button
                onClick={switchMode}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <SEOHead pathname="/auth" />
      
      {/* Logo bar — same size as landing page header */}
      <div className="p-6 sm:p-8">
        <Link to="/" className="inline-flex items-center">
          <img
            src={LOGO_URL}
            alt="Beymflow"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            loading="eager"
            decoding="async"
          />
        </Link>
      </div>

      <div className="flex flex-1 min-h-[calc(100vh-88px)]">
        {/* Left — Auth Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
            <div className="text-center mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-xs text-gray-400">
                {isLogin
                  ? 'Sign in to continue to Beymflow.'
                  : 'Start for free. No credit card required.'}
              </p>
            </div>

            {/* Google Sign-In */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full bg-white text-black hover:bg-gray-100 h-10 text-sm font-medium rounded-xl flex items-center justify-center gap-3 mb-4 border-0"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Sign in with Google
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form error */}
            {formError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-400">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  autoComplete="email"
                  autoFocus
                  className="w-full bg-neutral-900/60 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 h-10 rounded-xl text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-300">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-white transition-colors">
                      Forgot?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Your password" : "At least 6 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="w-full bg-neutral-900/60 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 h-10 pr-10 rounded-xl text-sm transition-all"
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
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white hover:bg-purple-500 h-10 text-sm font-semibold rounded-xl"
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
              <span className="text-xs text-gray-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                onClick={switchMode}
                type="button"
                className="text-xs text-white hover:text-gray-300 font-medium transition-colors underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            <p className="mt-3 text-center text-[10px] text-gray-500">
              By signing up, you agree to our{' '}
              <Link to="#" className="text-gray-400 hover:text-white underline">Terms</Link>
              {' & '}
              <Link to="#" className="text-gray-400 hover:text-white underline">Privacy</Link>
            </p>
          </div>
        </div>

        {/* Right — Video placeholder */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10">
          <div className="relative w-full max-w-xl rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-black border border-white/10 aspect-[4/3] flex items-end">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-900/30 to-black" />
            <div className="relative z-10 p-8">
              <h2 className="text-2xl font-bold text-white mb-1">See how easy it is</h2>
              <p className="text-white/70 text-sm">Create prompts and designs in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
