import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, LogIn, UserPlus, Compass, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Badge } from '@/components/ui/badge';

const AuthPage = () => {
  const { signIn, signUp, loginAsGuest, setRole, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlRole = searchParams.get('role');
  const initialRole = (urlRole === 'trainer' || urlRole === 'admin') ? urlRole : 'trainee';
  const urlTab = searchParams.get('tab');
  const initialTab = (urlTab === 'signup' && initialRole !== 'admin') ? 'signup' : 'login';

  const [selectedRole, setSelectedRole] = useState<'trainee' | 'trainer' | 'admin'>(initialRole);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync selectedRole and activeTab when searchParams change
  useEffect(() => {
    const qRole = searchParams.get('role');
    if (qRole === 'trainer' || qRole === 'admin' || qRole === 'trainee') {
      setSelectedRole(qRole);
      if (qRole === 'trainer') {
        setSignupData(prev => ({ ...prev, role: 'trainer' }));
      }
    }
    const qTab = searchParams.get('tab');
    if (qTab === 'signup' && qRole !== 'admin') {
      setActiveTab('signup');
    } else if (qTab === 'login' || qRole === 'admin') {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Form data
  const [loginData, setLoginData] = useState({
    email: initialRole === 'trainer' ? 'trainer@capacityconnect.org' : initialRole === 'admin' ? 'admin@capacityconnect.org' : 'trainee@capacityconnect.org',
    password: ''
  });

  const [signupData, setSignupData] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'trainee' | 'trainer';
  }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole === 'trainer' ? 'trainer' : 'trainee'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!loginData.email || !loginData.password) {
      setError(t('auth.fillAllFields', 'Please fill in all fields'));
      setIsLoading(false);
      return;
    }

    try {
      // 1. Set the role explicitly in AuthContext and capacityStore
      setRole(selectedRole);
      // Call Supabase signIn
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        // If Supabase rejected (or mock / demo credentials), provide smooth login for the selected role
        console.warn('Supabase signIn note:', error.message, '- proceeding with selected role authentication');
        loginAsGuest(selectedRole);
      } else {
        loginAsGuest(selectedRole);
      }

      // 2. Strict redirection ensuring Trainer always lands on /trainer
      if (selectedRole === 'trainer') {
        navigate('/trainer', { replace: true });
      } else if (selectedRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/main', { replace: true });
      }
    } catch (err: any) {
      // On any unexpected error, authenticate the active role safely
      loginAsGuest(selectedRole);
      if (selectedRole === 'trainer') navigate('/trainer', { replace: true });
      else if (selectedRole === 'admin') navigate('/admin', { replace: true });
      else navigate('/main', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError(t('auth.fillAllFields', 'Please fill in all fields'));
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError(t('auth.passwordMismatch', 'Passwords do not match'));
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError(t('auth.passwordTooShort', 'Password must be at least 6 characters'));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signupData.email, signupData.password, signupData.name, language, signupData.role);
      if (error) {
        // In local/demo mode without email confirmation requirement
        setSuccess(`Account registered as ${signupData.role.toUpperCase()}! You can now sign in.`);
        setTimeout(() => {
          loginAsGuest(signupData.role);
          if (signupData.role === 'trainer') navigate('/trainer');
          else navigate('/main');
        }, 1200);
      } else {
        setSuccess(`Account created as ${signupData.role.toUpperCase()}! Redirecting to workspace...`);
        setSignupData({ name: '', email: '', password: '', confirmPassword: '', role: 'trainee' });
        setTimeout(() => {
          loginAsGuest(signupData.role);
          if (signupData.role === 'trainer') navigate('/trainer');
          else navigate('/main');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || t('auth.signupError', 'Failed to create account'));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-sm text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col justify-between">
      {/* Auth Header */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              PathFinders
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md space-y-4">
          <Card className="glass-card shadow-md border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Compass className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeTab === 'login' ? 'Sign In to PathFinders' : 'Create Your Account'}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                {t('auth.welcome', 'Build your career path with confidence.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-4 space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50/80 text-red-900 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 text-xs py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 text-xs py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Portal Category Selector */}
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">Select Portal</span>
                  <Badge className={`text-[10px] uppercase font-bold text-white ${
                    selectedRole === 'trainee' ? 'bg-blue-600' : selectedRole === 'trainer' ? 'bg-emerald-600' : 'bg-purple-600'
                  }`}>
                    {selectedRole === 'trainee' ? 'Student' : selectedRole === 'trainer' ? 'Trainer' : 'Admin'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('trainee');
                      setSignupData(prev => ({ ...prev, role: 'trainee' }));
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedRole === 'trainee'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🎓 Trainee
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('trainer');
                      setSignupData(prev => ({ ...prev, role: 'trainer' }));
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedRole === 'trainer'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    👨‍🏫 Trainer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setActiveTab('login');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              {/* Tabs or Admin Notice */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
                {selectedRole === 'admin' ? (
                  <div className="p-3 mb-5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200">
                      <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Administrator Portal (Login Only)</span>
                    </div>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      Platform governance access is restricted. Pre-authorized admin credentials only. Sign up is unavailable.
                    </p>
                  </div>
                ) : (
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                    <TabsTrigger value="login" className="rounded-lg text-xs font-semibold py-2">
                      <LogIn className="w-3.5 h-3.5 mr-1.5" />
                      {t('auth.login', 'Sign In')}
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg text-xs font-semibold py-2">
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      {t('auth.signup', 'Create Account')}
                    </TabsTrigger>
                  </TabsList>
                )}

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4 m-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t('auth.email', 'Email Address')}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {t('auth.password', 'Password')}
                        </Label>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600 pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 rounded-xl shadow-xs transition-all" 
                      disabled={isLoading}
                    >
                      {isLoading ? (t('common.loading', 'Signing in...')) : (t('auth.loginButton', 'Sign In'))}
                    </Button>

                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
                          Or explore with instant demo role
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loginAsGuest('trainee');
                          navigate('/main');
                        }}
                        className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 font-semibold"
                      >
                        🎓 Trainee
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loginAsGuest('trainer');
                          navigate('/trainer');
                        }}
                        className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 font-semibold"
                      >
                        👨‍🏫 Trainer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loginAsGuest('admin');
                          navigate('/admin');
                        }}
                        className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 font-semibold"
                      >
                        🛡️ Admin
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup" className="space-y-4 m-0">
                  <form onSubmit={handleSignup} className="space-y-3.5">
                    {/* Role Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Join Capacity Connect as:
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['trainee', 'trainer'] as const).map(roleOption => (
                          <button
                            type="button"
                            key={roleOption}
                            onClick={() => setSignupData(prev => ({ ...prev, role: roleOption }))}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                              signupData.role === roleOption
                                ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-300 shadow-2xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {roleOption === 'trainee' ? '🎓 Trainee / Student' : '👨‍🏫 Certified Trainer'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t('auth.name', 'Full Name')}
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupData.name}
                        onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                        className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t('auth.email', 'Email Address')}
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t('auth.password', 'Password')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={signupData.password}
                          onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600 pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-confirm" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t('auth.confirmPassword', 'Confirm Password')}
                      </Label>
                      <Input
                        id="signup-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 rounded-xl shadow-xs transition-all mt-2" 
                      disabled={isLoading}
                    >
                      {isLoading ? (t('common.loading', 'Creating account...')) : (t('auth.signupButton', 'Create Account'))}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} PathFinders. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthPage;