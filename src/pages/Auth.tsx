import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const LOGO_URL = '/images/beymflow-logo.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const redirectPath = useMemo(() => {
    const queryRedirect = new URLSearchParams(window.location.search).get('redirect');
    return queryRedirect || sessionStorage.getItem('auth_redirect_after') || '/flow';
  }, []);

  const validateForm = useCallback(() => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setFormError('Please enter your email address.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
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
  }, [email, password, isLogin]);

  const normalizeErrorMessage = useCallback((rawMessage: string) => {
    if (rawMessage.includes('Invalid login credentials') || rawMessage.includes('invalid_credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (rawMessage.includes('User already registered') || rawMessage.includes('user_already_exists')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (rawMessage.includes('Email not confirmed') || rawMessage.includes('email_not_confirmed')) {
      return 'Please verify your email before signing in. Check your inbox.';
    }
    if (rawMessage.includes('Too many requests') || rawMessage.includes('over_email_send_rate_limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (rawMessage.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }

    return rawMessage || 'Something went wrong. Please try again.';
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    setFormError('');

    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });

      if (error) {
        setFormError(error.message || 'Google sign-in failed.');
      }
    } catch {
      setFormError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    const normalizedEmail = email.trim();
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(normalizedEmail, password)
        : await signUp(normalizedEmail, password);

      if (error) {
        setFormError(normalizeErrorMessage(error.message ?? ''));
        return;
      }

      if (isLogin) {
        sessionStorage.removeItem('auth_redirect_after');
        navigate(redirectPath);
      } else {
        setEmailSent(true);
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, isLogin, navigate, normalizeErrorMessage, password, redirectPath, signIn, signUp, validateForm]);

  const switchMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setFormError('');
    setEmailSent(false);
  }, []);

  React.useEffect(() => {
    if (!user) return;

    sessionStorage.removeItem('auth_redirect_after');
    navigate(redirectPath);
  }, [navigate, redirectPath, user]);

  if (emailSent) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-8">
        <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">We sent a confirmation link to:</p>
          <p className="mt-1 break-all text-sm font-medium">{email.trim()}</p>
          <p className="mt-3 text-xs text-muted-foreground">Open the link to activate your account.</p>

          <div className="mt-6 space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                const { error } = await signUp(email.trim(), password);
                setLoading(false);

                if (!error) {
                  toast({ title: 'Sent!', description: 'Confirmation link resent successfully.' });
                } else {
                  setFormError(normalizeErrorMessage(error.message ?? ''));
                }
              }}
            >
              {loading ? 'Sending...' : 'Resend email'}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={switchMode}>
              Back to sign in
            </Button>
          </div>

          {formError ? <p className="mt-3 text-xs text-destructive">{formError}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-sm">
        <Link to="/" className="inline-flex items-center" aria-label="Back to home">
          <img
            src={LOGO_URL}
            alt="Beymflow"
            className="h-10 w-auto object-contain"
            loading="eager"
            decoding="async"
            width={160}
            height={40}
          />
        </Link>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <header className="mb-4 text-center">
            <h1 className="text-xl font-semibold">{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLogin ? 'Sign in to continue.' : 'Start for free. No credit card required.'}
            </p>
          </header>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            variant="outline"
            className="w-full"
          >
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </Button>

          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {formError ? (
            <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {formError}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  className="pr-16"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;
