import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Brain, 
  TrendingUp, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Zap,
  Layers,
  Award,
  BookOpen,
  Globe,
  LogIn,
  UserPlus,
  Check
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import heroImage from '@/assets/hero-career-guide.jpg';
import { Language } from '@/types';

const Index = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Language Gateway State: Shown BEFORE the landing page
  const [languageGateConfirmed, setLanguageGateConfirmed] = useState<boolean>(() => {
    return localStorage.getItem('pf_initial_lang_selected') === 'true';
  });

  const languages: Array<{
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
    description: string;
  }> = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'International & Standard Technical Curriculum'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      description: 'भारत की राष्ट्रभाषा • हिंदी में सीखें और आगे बढ़ें'
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳',
      description: 'ఆంధ్రప్రదేశ్ & తెలంగాణ • మాతృభాషలో సులభంగా నేర్చుకోండి'
    }
  ];

  const handleSelectLanguage = (langCode: Language) => {
    setLanguage(langCode);
  };

  const handleConfirmLanguageGate = () => {
    localStorage.setItem('pf_initial_lang_selected', 'true');
    setLanguageGateConfirmed(true);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/main');
    } else {
      navigate('/auth');
    }
  };

  const featurePillars = [
    {
      title: t('AI Career & Competency Guide', 'AI Career & Competency Guide'),
      desc: t('Discover suitable career trajectories, diagnostic assessments, and benchmark competencies.', 'Discover suitable career trajectories, diagnostic assessments, and benchmark competencies.'),
      icon: Brain,
      path: '/career-guide',
      tag: t('Competency Mapping', 'Competency Mapping')
    },
    {
      title: t('Accredited Course Catalog', 'Accredited Course Catalog'),
      desc: t('Hands-on courses with video lectures, presentations, and module diagnostics taught by certified trainers.', 'Hands-on courses with video lectures, presentations, and module diagnostics taught by certified trainers.'),
      icon: BookOpen,
      path: '/courses',
      tag: t('Course Catalog', 'Course Catalog')
    },
    {
      title: t('Profile & Competency Analyzer', 'Profile & Competency Analyzer'),
      desc: t('Automatic extraction of qualifications, verified skills, and projects from your resume into your profile.', 'Automatic extraction of qualifications, verified skills, and projects from your resume into your profile.'),
      icon: FileText,
      path: '/resume-analyzer',
      tag: t('Resume Analyzer', 'Resume Analyzer')
    },
    {
      title: t('Personalized Learning & Skill Gaps', 'Personalized Learning & Skill Gaps'),
      desc: t('Pinpoint precise competency gaps with automated trainer and course recommendations.', 'Pinpoint precise competency gaps with automated trainer and course recommendations.'),
      icon: TrendingUp,
      path: '/skill-gaps',
      tag: t('Skill Gap Engine', 'Skill Gap Engine')
    }
  ];

  // =========================================================================
  // =========================================================================
  // 1. LANGUAGE & ROLE GATEWAY SCREEN (SHOWN BEFORE THE LANDING PAGE)
  // =========================================================================
  if (!languageGateConfirmed) {
    const handleRoleNavigate = (targetRole: 'trainee' | 'trainer' | 'admin', tab: 'login' | 'signup') => {
      localStorage.setItem('pf_initial_lang_selected', 'true');
      setLanguageGateConfirmed(true);
      navigate(`/auth?role=${targetRole}&tab=${tab}`);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight block">Capacity Connect</span>
              <span className="text-[10px] text-blue-300 font-mono">PS 26075 — AI Platform</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('Language & Role Gateway', 'Language & Role Gateway')}</span>
          </div>
        </div>

        {/* Center Gateway Content */}
        <div className="relative z-10 max-w-4xl w-full mx-auto my-auto py-8 space-y-8 text-center">
          
          {/* Header Title */}
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-400 shadow-xl mb-3">
              <Globe className="w-7 h-7 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t('Select Language & Enter Portal', 'Select Language & Enter Portal')}
            </h1>
            <p className="text-sm sm:text-base font-bold text-blue-300">
              अपनी पसंदीदा भाषा चुनें &bull; మీ ప్రాధాన్య భాషను ఎంచుకోండి
            </p>
          </div>

          {/* Step 1: Language Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
            {languages.map((item) => {
              const isSelected = language === item.code;
              return (
                <div
                  key={item.code}
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-400 shadow-xl shadow-blue-600/20 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl">{item.flag}</span>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">{item.nativeName}</h3>
                    <p className="text-xs text-blue-200 font-semibold">{item.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 2: Instant Role Portals with Direct Login & Signup */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('Choose Your Role to Sign In or Register', 'Choose Your Role to Sign In or Register')}
              </span>
              <span className="text-[11px] text-blue-400 font-medium">
                {t('Direct Authentication', 'Direct Authentication')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              
              {/* 1. TRAINEE ROLE */}
              <div className="p-5 rounded-2xl bg-white/5 border border-blue-500/20 hover:border-blue-400/50 hover:bg-white/10 transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      {t('Trainee / Student', 'Trainee / Student')}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {t('AI Career Guidance, Resume Analyzer, Skill Gap Radar & Verified Certifications.', 'AI Career Guidance, Resume Analyzer, Skill Gap Radar & Verified Certifications.')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <Button
                    size="sm"
                    onClick={() => handleRoleNavigate('trainee', 'login')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl h-9 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1" />
                    {t('Sign In', 'Sign In')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRoleNavigate('trainee', 'signup')}
                    className="w-full border-white/20 text-white hover:bg-white/10 text-xs font-semibold rounded-xl h-9"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    {t('Sign Up', 'Sign Up')}
                  </Button>
                </div>
              </div>

              {/* 2. TRAINER ROLE */}
              <div className="p-5 rounded-2xl bg-white/5 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-white/10 transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      {t('Trainer / Instructor', 'Trainer / Instructor')}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {t('1:1 Mentorship Sessions, Course Studio, Doubt Clinic, and Cohort Diagnostics.', '1:1 Mentorship Sessions, Course Studio, Doubt Clinic, and Cohort Diagnostics.')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <Button
                    size="sm"
                    onClick={() => handleRoleNavigate('trainer', 'login')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl h-9 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1" />
                    {t('Trainer Sign In', 'Trainer Sign In')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRoleNavigate('trainer', 'signup')}
                    className="w-full border-white/20 text-white hover:bg-white/10 text-xs font-semibold rounded-xl h-9"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    {t('Register', 'Register')}
                  </Button>
                </div>
              </div>

              {/* 3. ADMIN ROLE */}
              <div className="p-5 rounded-2xl bg-white/5 border border-purple-500/20 hover:border-purple-400/50 hover:bg-white/10 transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      {t('Administrator', 'Administrator')}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {t('Dynamic Supabase RBAC governance, institution management, user approvals & telemetry.', 'Dynamic Supabase RBAC governance, institution management, user approvals & telemetry.')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <Button
                    size="sm"
                    onClick={() => handleRoleNavigate('admin', 'login')}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl h-9 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    {t('Admin Sign In', 'Admin Sign In')}
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Continue to Landing Page Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleConfirmLanguageGate}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 text-xs sm:text-sm rounded-xl border border-slate-700/80 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{t('Explore Platform Overview', 'Explore Platform Overview')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-[11px] text-slate-400">
            {t('You can change your language anytime from the top bar.', 'You can change your language anytime from the top bar.')}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center text-xs text-slate-500 py-2">
          Capacity Connect &bull; PS 26075 &bull; AI Capacity-Building Platform
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN LANDING PAGE (FULL WIDTH - NO SIDEBAR)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col">
      <Navbar showBack={false} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 dark:bg-blue-950/50 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>PS 26075 — CAPACITY CONNECT</span>
                </div>
                
                {/* Switch Language Gate Trigger */}
                <button
                  type="button"
                  onClick={() => setLanguageGateConfirmed(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('Language', 'Language')} ({language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिंदी' : 'English'})</span>
                </button>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                {t('Personalized AI Capacity-Building & Learning Hub.', 'Personalized AI Capacity-Building & Learning Hub.')}
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {t('Connect trainee profiles, competencies, skill gaps, courses, trainers, assessments, and tamper-proof certifications into one continuous learning journey.', 'Connect trainee profiles, competencies, skill gaps, courses, trainers, assessments, and tamper-proof certifications into one continuous learning journey.')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 h-auto rounded-xl shadow-md transition-all hover:shadow-lg"
                >
                  <span>{user ? t('Open Dashboard', 'Open Dashboard') : t('Get Started Free', 'Get Started Free')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/resume-analyzer')}
                  className="w-full sm:w-auto border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium px-6 py-3.5 h-auto rounded-xl shadow-xs"
                >
                  <FileText className="w-4 h-4 mr-2 text-slate-500" />
                  {t('Analyze Resume', 'Analyze Resume')}
                </Button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('ATS-Optimized Templates', 'ATS-Optimized Templates')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('Multilingual Support', 'Multilingual Support')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('Personalized Roadmaps', 'Personalized Roadmaps')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 rounded-3xl blur-2xl -z-10" />
                <Card className="glass-card overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl">
                  <img
                    src={heroImage}
                    alt="Capacity Connect AI Guidance Platform"
                    className="w-full h-72 object-cover"
                  />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live AI Assistant</span>
                      </div>
                      <Badge variant="outline" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200">
                        Capacity Connect v2.0
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      "Personalized guidance matched to current high-demand engineering, design, and product roles in the Indian and global job markets."
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">10K+</div>
                        <div className="text-[10px] text-slate-500">{t('Students Guided', 'Students')}</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-600">95%</div>
                        <div className="text-[10px] text-slate-500">{t('Success Rate', 'Match Rate')}</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-indigo-600">500+</div>
                        <div className="text-[10px] text-slate-500">{t('Career Paths', 'Pathways')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Role Access Portals: Trainee (SignIn/SignUp), Trainer (SignIn/SignUp), Admin (Login Only) */}
      <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold">
              {t('Select Your Access Portal', 'Select Your Access Portal')}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('Sign In & Register by Role', 'Sign In & Register by Role')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t('Dedicated access points for trainees, certified trainers, and platform administrators.', 'Dedicated access points for trainees, certified trainers, and platform administrators.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* 1. Trainee Portal Card */}
            <Card className="glass-card p-6 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                    🎓
                  </div>
                  <Badge className="bg-blue-600 text-white text-[10px]">{t('Trainee Portal', 'Trainee Portal')}</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('Trainee / Student', 'Trainee / Student')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Access competency tests, discover skill gaps, enroll in accredited courses, and earn verifiable certificates.
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <Button
                  onClick={() => navigate('/auth?tab=signin&role=student')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t('Sign In', 'Sign In')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth?tab=signup&role=student')}
                  className="w-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t('Sign Up', 'Sign Up')}
                </Button>
              </div>
            </Card>

            {/* 2. Trainer Portal Card */}
            <Card className="glass-card p-6 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                    👨‍🏫
                  </div>
                  <Badge className="bg-indigo-600 text-white text-[10px]">{t('Trainer Portal', 'Trainer Portal')}</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('Certified Trainer', 'Certified Trainer')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Publish courses, monitor cohort completion, upload handbooks to Trainer Library, and host remedial workshops.
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <Button
                  onClick={() => navigate('/auth?tab=signin&role=trainer')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t('Sign In', 'Sign In')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth?tab=signup&role=trainer')}
                  className="w-full border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t('Sign Up', 'Sign Up')}
                </Button>
              </div>
            </Card>

            {/* 3. Admin Portal Card (Login Only) */}
            <Card className="glass-card p-6 rounded-2xl border border-slate-300/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg">
                    🛡️
                  </div>
                  <Badge variant="outline" className="border-slate-400 text-slate-700 dark:text-slate-300 text-[10px]">
                    {t('Admin Portal', 'Admin Portal')}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('Platform Administrator', 'Platform Administrator')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Accredit trainers, audit certificate hashes, broadcast announcements, and monitor ecosystem performance.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => navigate('/auth?tab=signin&role=admin')}
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t('Log In', 'Log In')}
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('Core Platform Features', 'Core Platform Features')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalized AI capacity-building workflow designed for students and educators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featurePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => navigate(pillar.path)}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-3 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 mb-1">
                        {pillar.tag}
                      </Badge>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pillar.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pillar.desc}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600">
                    <span>{t('Explore', 'Explore')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="py-12 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('Ready to Shape Your Career?', 'Ready to Shape Your Career?')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t('Join thousands of students and early career professionals navigating the job market with pathfinders.', 'Join thousands of students and early career professionals navigating the job market with pathfinders.')}
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm"
          >
            {user ? t('Go to Main Dashboard', 'Go to Main Dashboard') : t('Create Free Account', 'Create Free Account')}
          </Button>
          <p className="text-xs text-slate-400 pt-6">
            &copy; {new Date().getFullYear()} Capacity Connect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
