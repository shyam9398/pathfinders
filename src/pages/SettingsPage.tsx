import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navigation/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Globe, 
  User, 
  ShieldCheck, 
  Bell, 
  Moon, 
  Sun, 
  Sparkles, 
  Check, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { Language } from '@/types';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, signOut, role } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [langModalOpen, setLangModalOpen] = useState(false);

  const languages: Array<{ code: Language; name: string; nativeName: string; flag: string }> = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' }
  ];

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    toast.success(t('Language updated immediately!', 'Language updated immediately!'));
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: t('Platform Settings', 'Platform Settings') }
        ]} 
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 pb-6 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Settings className="w-3.5 h-3.5" />
            <span>{t('Account & Preferences', 'Account & Preferences')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('Settings & Preferences', 'Settings & Preferences')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t('Manage your multilingual display, account identity, notifications, and security options.', 'Manage your multilingual display, account identity, notifications, and security options.')}
          </p>
        </div>

        {/* 1. LANGUAGE SETTINGS (CORE REQUIREMENT 1) */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    {t('Change Language', 'Change Language')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('Instantly updates every module, recommendation, and AI interface.', 'Instantly updates every module, recommendation, and AI interface.')}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white capitalize text-xs">
                {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी (Hindi)' : 'తెలుగు (Telugu)'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t('Select Active Language', 'Select Active Language')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {languages.map((l) => {
                const isActive = language === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{l.flag}</span>
                      <div>
                        <span className="font-bold text-sm block">{l.nativeName}</span>
                        <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                          {l.name}
                        </span>
                      </div>
                    </div>
                    {isActive && <Check className="w-5 h-5 text-white" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. ACCOUNT PROFILE & ROLE */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {t('Profile & Identity', 'Profile & Identity')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('Your registered role and Supabase authentication identity.', 'Your registered role and Supabase authentication identity.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Full Name', 'Full Name')}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {user?.name || 'Pavan Kumar'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Email Address', 'Email Address')}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {user?.email || 'trainee@pathfinders.org'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Active Role', 'Active Role')}
                </span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-xs mt-1">
                  {role}
                </Badge>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Security State', 'Security State')}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('Supabase Auth Verified', 'Supabase Auth Verified')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. SIGN OUT ACTION */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
          <div>
            <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
              {t('Sign Out of Session', 'Sign Out of Session')}
            </h4>
            <p className="text-xs text-rose-600/80 dark:text-rose-400 mt-0.5">
              {t('Your language preference and career records will be preserved safely.', 'Your language preference and career records will be preserved safely.')}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="border-rose-300 text-rose-600 hover:bg-rose-100 dark:border-rose-800 text-xs font-bold rounded-xl h-9"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            {t('Sign Out', 'Sign Out')}
          </Button>
        </div>

      </main>

      {/* Language Selector Modal */}
      <LanguageSelector
        isOpen={langModalOpen}
        onComplete={() => setLangModalOpen(false)}
        showAsModal={true}
      />
    </div>
  );
}
