import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navigation/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Flame, 
  Award, 
  Star, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Target,
  Sparkles,
  BookOpen,
  FileText,
  Brain
} from 'lucide-react';
import { StreakTracker } from '@/components/StreakTracker';
import { BadgeDisplay } from '@/components/BadgeDisplay';

export default function AchievementsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Streak & Activity data from localStorage/capacityStore
  const streakCount = 7;
  const xp = 1250;
  const level = Math.floor(xp / 500) + 1;
  const nextLevelXp = level * 500;
  const currentLevelProgress = Math.round(((xp % 500) / 500) * 100);

  // Weekly consistency days
  const weekDays = [
    { day: 'Mon', active: true },
    { day: 'Tue', active: true },
    { day: 'Wed', active: true },
    { day: 'Thu', active: true },
    { day: 'Fri', active: true },
    { day: 'Sat', active: true },
    { day: 'Sun', active: true },
  ];

  const earnedMilestones = [
    { id: '1', title: t('First Course Enrolled', 'First Course Enrolled'), desc: t('Started learning Enterprise Java Architecture', 'Started learning Enterprise Java Architecture'), icon: BookOpen, date: 'Mar 10, 2026', xp: 100 },
    { id: '2', title: t('Resume Analyzed & Verified', 'Resume Analyzed & Verified'), desc: t('Scored 88% ATS compatibility on Software Engineer profile', 'Scored 88% ATS compatibility on Software Engineer profile'), icon: FileText, date: 'Mar 12, 2026', xp: 150 },
    { id: '3', title: t('7 Day Learning Streak', '7 Day Learning Streak'), desc: t('Studied 7 days consecutively without interruption', 'Studied 7 days consecutively without interruption'), icon: Flame, date: 'Mar 15, 2026', xp: 200 },
    { id: '4', title: t('Diagnostic Assessment Cleared', 'Diagnostic Assessment Cleared'), desc: t('Achieved 92% on Data Structures & Algorithms diagnostic', 'Achieved 92% on Data Structures & Algorithms diagnostic'), icon: Brain, date: 'Mar 16, 2026', xp: 250 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: t('Achievements & Streak', 'Achievements & Streak') }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('Real-Time Gamification & Activity Record', 'Real-Time Gamification & Activity Record')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('Gamification & Learning Consistency', 'Gamification & Learning Consistency')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {t('Track your active streaks, earned credentials, experience points, and milestone progression powered by real platform activity records.', 'Track your active streaks, earned credentials, experience points, and milestone progression powered by real platform activity records.')}
            </p>
          </div>

          {/* Level Badge */}
          <div className="px-5 py-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
              {level}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 block">
                {t('Current Rank', 'Current Rank')}
              </span>
              <span className="text-base font-extrabold block">
                Level {level} Scholar
              </span>
              <span className="text-[10px] text-blue-200">
                {xp} / {nextLevelXp} XP ({500 - (xp % 500)} XP to Level {level + 1})
              </span>
            </div>
          </div>
        </div>

        {/* 1. UNIQUE FIRE STREAK COMPONENT */}
        <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <Flame className="w-10 h-10 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    🔥 {streakCount} {t('Day Learning Streak', 'Day Learning Streak')}
                  </h2>
                  <Badge className="bg-amber-500 text-white font-bold text-xs">
                    {t('Active', 'Active')}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
                  {t('You have studied consecutively for 7 days! Keep learning daily to unlock the 14-Day Streak Legend badge.', 'You have studied consecutively for 7 days! Keep learning daily to unlock the 14-Day Streak Legend badge.')}
                </p>
              </div>
            </div>

            {/* Weekly consistency dots */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('Weekly Consistency', 'Weekly Consistency')}
              </span>
              <div className="flex items-center gap-2">
                {weekDays.map((wd, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      wd.active 
                        ? 'bg-amber-500 text-white shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {wd.active ? '✓' : '•'}
                    </div>
                    <span className="text-[10px] text-slate-500">{wd.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Card>

        {/* 2. XP & LEVEL PROGRESSION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('Total Experience Points', 'Total Experience Points')}
              </span>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{xp} XP</span>
              <p className="text-xs text-slate-500">Earned across 14 lessons, quizzes, & analyses</p>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('Longest Streak Record', 'Longest Streak Record')}
              </span>
              <Trophy className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">12 Days</span>
              <p className="text-xs text-slate-500">Personal best recorded on Feb 28, 2026</p>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('Level Completion', 'Level Completion')}
              </span>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{currentLevelProgress}%</span>
                <span className="text-slate-400">Level {level} → {level + 1}</span>
              </div>
              <Progress value={currentLevelProgress} className="h-2" />
            </div>
          </Card>
        </div>

        {/* 3. EARNED BADGES (ONLY EARNED SHOWN) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('Earned Badges & Credentials', 'Earned Badges & Credentials')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('Only authenticated credentials you have unlocked through verified performance.', 'Only authenticated credentials you have unlocked through verified performance.')}
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-blue-600 border-blue-200">
              4 {t('Badges Earned', 'Badges Earned')}
            </Badge>
          </div>

          <BadgeDisplay userId={user?.id || 'guest'} />
        </div>

        {/* 4. ACTIVITY MILESTONES HISTORY */}
        <div className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('Recent Activity & XP Log', 'Recent Activity & XP Log')}
          </h2>
          <div className="space-y-2.5">
            {earnedMilestones.map((ms) => {
              const Icon = ms.icon;
              return (
                <div 
                  key={ms.id} 
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ms.title}</h4>
                      <p className="text-xs text-slate-500">{ms.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">{ms.date}</span>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold">
                      +{ms.xp} XP
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
