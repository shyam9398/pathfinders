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
import { Eye, EyeOff, LogIn, UserPlus, Compass, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, GraduationCap, Clock, RefreshCw, ShieldAlert, KeyRound, Check } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Badge } from '@/components/ui/badge';
import { TrainerApplicationModal } from '@/components/TrainerApplicationModal';
import { capacityStore } from '@/services/capacityStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthPage = () => {
  const { signIn, signUp, loginAsGuest, loginAsAdmin, loginAsTrainer, loginAsTrainee, setRole, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlRole = searchParams.get('role');
  const initialRole = (urlRole === 'trainer' || urlRole === 'admin') ? urlRole : 'trainee';
  const urlTab = searchParams.get('tab');
  const initialTab = (urlTab === 'signup' && initialRole !== 'admin') ? 'signup' : 'login';

  const [selectedRole, setSelectedRole] = useState<'trainee' | 'trainer' | 'admin'>(initialRole);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [trainerApplyModalOpen, setTrainerApplyModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Trainer Approval Verification State
  const [trainerApplicant, setTrainerApplicant] = useState<{
    name?: string;
    email?: string;
    username?: string;
    status: 'none' | 'pending' | 'approved' | 'rejected';
  }>(() => {
    try {
      const saved = localStorage.getItem('pathfinders_trainer_applicant');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { status: 'none' };
  });

  const [trainerApproved, setTrainerApproved] = useState<boolean>(false);
  const [trainerLookupInput, setTrainerLookupInput] = useState('');
  const [trainerStatusMsg, setTrainerStatusMsg] = useState<string | null>(null);

  // Synchronize trainer approval status
  useEffect(() => {
    const checkStatus = () => {
      try {
        const saved = localStorage.getItem('pathfinders_trainer_applicant');
        if (saved) {
          const parsed = JSON.parse(saved);
          const apps = capacityStore.getTrainerApplications();
          const match = apps.find(a => 
            (parsed.email && a.email.toLowerCase() === parsed.email.toLowerCase()) ||
            (parsed.username && a.username.toLowerCase() === parsed.username.toLowerCase())
          );
          if (match) {
            setTrainerApplicant({
              name: match.name,
              email: match.email,
              username: match.username,
              status: match.status
            });
            if (match.status === 'approved') {
              setTrainerApproved(true);
              setLoginData(prev => ({ ...prev, email: match.username || match.email }));
            }
          } else {
            setTrainerApplicant(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkStatus();
    window.addEventListener('pathfinders_trainer_apps_changed', checkStatus);
    return () => window.removeEventListener('pathfinders_trainer_apps_changed', checkStatus);
  }, []);

  const handleCheckTrainerApproval = () => {
    const apps = capacityStore.getTrainerApplications();
    const match = apps.find(a => 
      (trainerApplicant.email && a.email.toLowerCase() === trainerApplicant.email.toLowerCase()) ||
      (trainerApplicant.username && a.username.toLowerCase() === trainerApplicant.username.toLowerCase())
    );
    if (match && match.status === 'approved') {
      setTrainerApproved(true);
      setTrainerApplicant(prev => ({ ...prev, status: 'approved' }));
      setLoginData(prev => ({ ...prev, email: match.username || match.email }));
      setSuccess('Application approved by Administrator! Enter your credentials to sign in.');
    } else {
      setTrainerStatusMsg('Your request is processing. Please wait for the Administrator to review and approve.');
    }
  };

  const handleLookupTrainerStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerLookupInput.trim()) return;
    const q = trainerLookupInput.trim().toLowerCase();
    
    // Check applications
    const apps = capacityStore.getTrainerApplications();
    const match = apps.find(a => a.email.toLowerCase() === q || a.username.toLowerCase() === q);
    if (match) {
      if (match.status === 'approved') {
        setTrainerApproved(true);
        setTrainerApplicant({ name: match.name, email: match.email, username: match.username, status: 'approved' });
        setLoginData(prev => ({ ...prev, email: match.username || match.email }));
        setSuccess('Application approved! Please sign in with your credentials.');
        setTrainerStatusMsg(null);
        return;
      } else if (match.status === 'pending') {
        setTrainerApplicant({ name: match.name, email: match.email, username: match.username, status: 'pending' });
        setTrainerApproved(false);
        setTrainerStatusMsg('Your request is processing. Awaiting administrator review.');
        return;
      } else {
        setTrainerStatusMsg('Your trainer application was declined by the administrator.');
        return;
      }
    }

    // Check seed trainers
    const trainers = capacityStore.getTrainers();
    const seed = trainers.find(t => t.email.toLowerCase() === q || t.userId.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
    if (seed) {
      setTrainerApproved(true);
      setLoginData(prev => ({ ...prev, email: seed.email }));
      setSuccess(`Welcome Trainer ${seed.name}! Please enter your password to sign in.`);
      setTrainerStatusMsg(null);
      return;
    }

    setTrainerStatusMsg('No trainer application found for this username/email. Please apply above.');
  };

  const handleUnlockForSeedTrainer = () => {
    setTrainerApproved(true);
    setSuccess('Trainer credentials unlocked. Please enter your approved trainer credentials to sign in.');
  };

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

  // Form data - NO exposed or pre-filled credentials
  const [loginData, setLoginData] = useState({
    email: '',
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

    if (!loginData.email.trim() || !loginData.password) {
      setError(t('auth.fillAllFields', 'Please fill in all fields'));
      setIsLoading(false);
      return;
    }

    const inputIdent = loginData.email.trim();
    const inputPass = loginData.password;

    try {
      // -------------------------------------------------------------
      // 1. ADMIN ROLE: Fixed Username & Password Authentication
      // -------------------------------------------------------------
      if (selectedRole === 'admin') {
        const username = inputIdent.trim().toLowerCase();
        const password = inputPass;

        if (username === 'pathfinder' && password === '123456') {
          loginAsAdmin();
          toast.success(t('auth.adminLoginSuccess', 'Administrator authenticated successfully.'));
          navigate('/admin', { replace: true });
          setIsLoading(false);
          return;
        } else {
          setError(t('auth.invalidCredentials', 'Invalid username or password.'));
          setIsLoading(false);
          return;
        }
      }

      // -------------------------------------------------------------
      // 2. TRAINER ROLE: Fixed Username & Password Authentication
      // -------------------------------------------------------------
      if (selectedRole === 'trainer') {
        const res = capacityStore.verifyTrainerLogin(inputIdent, inputPass);
        if (res.success && res.status === 'approved') {
          loginAsTrainer({
            id: res.trainer?.id || 'trainer_user',
            email: res.trainer?.email || (inputIdent.includes('@') ? inputIdent : `${inputIdent}@pathfinder.org`),
            name: res.trainer?.name || (inputIdent.toLowerCase() === 'trainer' ? 'Dr. Priya Sharma (Trainer)' : inputIdent)
          });
          toast.success(`Welcome back, Trainer ${res.trainer?.name || inputIdent}!`);
          navigate('/trainer', { replace: true });
          setIsLoading(false);
          return;
        } else if (res.status === 'pending') {
          setError('Your trainer application is pending Administrator review.');
          setIsLoading(false);
          return;
        } else if (res.status === 'rejected' || res.status === 'suspended') {
          setError('Your trainer application was declined by the administrator.');
          setIsLoading(false);
          return;
        } else {
          setError(res.error || t('auth.invalidCredentials', 'Invalid username or password. Default trainer username: trainer, password: 123456'));
          setIsLoading(false);
          return;
        }
      }

      // -------------------------------------------------------------
      // 3. TRAINEE ROLE: Fixed Username & Password Authentication
      // -------------------------------------------------------------
      if (selectedRole === 'trainee') {
        const res = capacityStore.verifyTraineeLogin(inputIdent, inputPass);
        if (res.success) {
          loginAsTrainee({
            id: 'trainee_user',
            email: res.email || (inputIdent.includes('@') ? inputIdent : `${inputIdent}@student.edu`),
            name: res.name || 'Pavan Kumar (Trainee)'
          });
          toast.success(t('auth.loginSuccess', 'Signed in successfully.'));
          navigate('/main', { replace: true });
          setIsLoading(false);
          return;
        } else {
          setError(res.error || t('auth.invalidCredentials', 'Invalid username or password. Default trainee username: trainee, password: 123456'));
          setIsLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error('Authentication exception:', err);
      setError(t('auth.networkError', 'Unable to connect to the authentication service.'));
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
      
      // Never treat signup errors as successful registration
      if (error) {
        setError(error.message || t('auth.signupError', 'Failed to create account'));
        setIsLoading(false);
        return;
      }

      // Account successfully registered
      setSuccess(`Account registered as ${signupData.role.toUpperCase()}! Please sign in with your credentials.`);
      setSignupData({ name: '', email: '', password: '', confirmPassword: '', role: 'trainee' });
      setTimeout(() => {
        setActiveTab('login');
      }, 1500);
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
                      <span>Administrator Portal</span>
                    </div>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      Sign in with administrator username and password.
                    </p>
                  </div>
                ) : selectedRole === 'trainer' ? (
                  <div className="p-3.5 mb-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Accredited Trainer Portal</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Sign in with trainer username and password or apply below.
                    </p>
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setTrainerApplyModalOpen(true)}
                        className="text-xs text-emerald-700 dark:text-emerald-300 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Apply to Become an Accredited Trainer
                      </button>
                    </div>
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
                        {selectedRole === 'admin' 
                          ? 'Admin Username' 
                          : selectedRole === 'trainer' 
                          ? 'Trainer Username' 
                          : 'Trainee Username or Email'}
                      </Label>
                      <Input
                        id="login-email"
                        type="text"
                        placeholder={
                          selectedRole === 'admin'
                            ? 'Enter username (pathfinder)'
                            : selectedRole === 'trainer'
                            ? 'Enter username (trainer)'
                            : 'Enter username (trainee)'
                        }
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600"
                        required
                        autoComplete="username"
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
                          placeholder="Enter password (123456)"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-10 rounded-xl text-sm border-slate-200 focus-visible:ring-blue-600 pr-10"
                          required
                          autoComplete="current-password"
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
                      className={`w-full font-semibold h-10 rounded-xl shadow-xs transition-all ${
                        selectedRole === 'admin' 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : selectedRole === 'trainer' 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`} 
                      disabled={isLoading}
                    >
                      {isLoading ? (t('common.loading', 'Verifying...')) : (t('auth.loginButton', 'Sign In'))}
                    </Button>
                  </form>

                  {/* One-Click Quick Sign In Helpers */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
                        Instant 1-Click Access
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {selectedRole === 'trainee' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loginAsTrainee({ name: 'Pavan Kumar (Trainee)', email: 'trainee@pathfinder.org' });
                          navigate('/main');
                        }}
                        className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 font-semibold"
                      >
                        🎓 Instant Sign In as Trainee (trainee / 123456)
                      </Button>
                    )}
                    {selectedRole === 'trainer' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loginAsTrainer({ name: 'Dr. Priya Sharma (Trainer)', email: 'trainer@pathfinder.org' });
                          navigate('/trainer');
                        }}
                        className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 font-semibold"
                      >
                        👨‍🏫 Instant Sign In as Trainer (trainer / 123456)
                      </Button>
                    )}
                    {selectedRole === 'admin' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          loginAsAdmin();
                          navigate('/admin');
                        }}
                        className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 font-semibold"
                      >
                        🛡️ Instant Sign In as Admin (pathfinder / 123456)
                      </Button>
                    )}
                  </div>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup" className="space-y-4 m-0">
                  <form onSubmit={handleSignup} className="space-y-3.5">
                    {/* Role Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Join Pathfinders as:
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSignupData(prev => ({ ...prev, role: 'trainee' }))}
                          className="py-2 px-2.5 rounded-xl text-xs font-semibold capitalize border transition-all bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-300 shadow-2xs"
                        >
                          🎓 Trainee / Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrainerApplyModalOpen(true)}
                          className="py-2 px-2.5 rounded-xl text-xs font-semibold capitalize border transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 flex items-center justify-center gap-1"
                        >
                          👨‍🏫 Apply as Trainer
                        </button>
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

      {/* Trainer Application Modal */}
      <TrainerApplicationModal
        open={trainerApplyModalOpen}
        onOpenChange={setTrainerApplyModalOpen}
      />
    </div>
  );
};

export default AuthPage;