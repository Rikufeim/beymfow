import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Check, X } from 'lucide-react';
import { z } from 'zod';
import StarsBackground from '@/components/StarsBackground';
import authRightBg from '@/assets/auth-right-bg.png';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get redirect parameter from URL
  const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setLoading(true);

    try {
      // Validate sign up form
      if (!isLogin) {
        const result = signUpSchema.safeParse({
          email,
          password,
          confirmPassword
        });

        if (!result.success) {
          const errors: { [key: string]: string } = {};
          result.error.issues.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0].toString()] = err.message;
            }
          });
          setValidationErrors(errors);
          setLoading(false);
          return;
        }
      }

      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: isLogin ? "Signed in successfully" : "Account created successfully"
        });
        navigate(redirectPath);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarsBackground>
      <div className="min-h-screen text-white flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
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
          <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16">
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-black/40 border-white/20 text-white placeholder:text-gray-500 focus:border-white/50 focus:bg-black/40 h-12 rounded-lg"
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
                      minLength={isLogin ? 6 : 8}
                      className="w-full bg-black/40 border-white/20 text-white placeholder:text-gray-500 focus:border-white/50 focus:bg-black/40 h-12 pr-10 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors touch-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isLogin && password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
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
                        minLength={8}
                        className="w-full bg-black/40 border-white/20 text-white placeholder:text-gray-500 focus:border-white/50 focus:bg-black/40 h-12 pr-10 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors touch-none"
                        tabIndex={-1}
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
                  className="w-full bg-neutral-700 text-white hover:bg-neutral-600 transition-all duration-300 h-12 text-base font-semibold rounded-lg"
                >
                  {loading ? 'Loading...' : 'Continue'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-gray-400">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={() => setIsLogin(!isLogin)}
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

        {/* Right Side - Image with Overlay */}
        <div className="hidden lg:flex lg:w-1/2 relative p-12 items-center">
          <div className="relative w-full h-[70%] rounded-3xl overflow-hidden">
            <img 
              src={authRightBg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Centered Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8">
                <p className="text-2xl md:text-3xl font-light text-white text-center">
                  Turn your ideas into<br />prompts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StarsBackground>
  );
};

export default Auth;
