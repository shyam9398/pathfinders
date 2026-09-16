import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  BookOpen,
  Trophy,
  Target,
  Zap,
  Lock,
  BarChart3,
  Compass,
  CheckCircle2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { DailyMCQ } from './DailyMCQ';
import { BadgeDisplay } from './BadgeDisplay';
import { StreakTracker } from './StreakTracker';
import { WeeklyAssignment } from './WeeklyAssignment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navigation/Navbar';

interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  match_percentage: number;
  required_skills: string[];
}

interface CareerProgress {
  id: string;
  selected_career_id: string;
  selected_career_name: string;
  xp: number;
  streak_count: number;
  roadmap_data: any;
  last_activity_date?: string;
}

interface RoadmapViewProps {
  career: CareerOption;
  progress: CareerProgress;
  onBack: () => void;
}

interface RoadmapStep {
  title: string;
  description: string;
  completed: boolean;
  resources?: string[];
  skills?: string[];
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ career, progress, onBack }) => {
  const { user } = useAuth();
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [activeView, setActiveView] = useState<'roadmap' | 'quiz' | 'assignment' | 'badges' | 'skills'>('roadmap');
  
  const roadmapData = currentProgress.roadmap_data || {};
  const steps: RoadmapStep[] = roadmapData.steps || [];
  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Calculate skill progress from roadmap steps
  const skillProgress = useMemo(() => {
    const skillMap: Record<string, { total: number; completed: number }> = {};
    const requiredSkills = career.required_skills || [];
    
    requiredSkills.forEach(skill => {
      skillMap[skill] = { total: 0, completed: 0 };
    });

    steps.forEach((step) => {
      const stepText = `${step.title} ${step.description}`.toLowerCase();
      const taggedSkills = step.skills || [];
      
      const matchedSkills = taggedSkills.length > 0 
        ? taggedSkills 
        : requiredSkills.filter(skill => stepText.includes(skill.toLowerCase().split('/')[0].split('(')[0].trim()));

      const skillsToCredit = matchedSkills.length > 0 ? matchedSkills : requiredSkills.slice(0, 2);
      
      skillsToCredit.forEach(skill => {
        if (!skillMap[skill]) skillMap[skill] = { total: 0, completed: 0 };
        skillMap[skill].total += 1;
        if (step.completed) skillMap[skill].completed += 1;
      });
    });

    return Object.entries(skillMap)
      .map(([skill, data]) => ({
        skill,
        progress: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }))
      .sort((a, b) => b.progress - a.progress);
  }, [steps, career.required_skills]);

  // Count completed modules
  const completedModules = useMemo(() => {
    const milestones = roadmapData.milestones || [];
    if (milestones.length > 0) {
      return milestones.filter((m: any) => {
        const tasks = m.tasks || [];
        return tasks.length > 0 && tasks.every((t: any) => t.completed);
      }).length;
    }
    let modules = 0;
    let inModule = false;
    steps.forEach(step => {
      if (step.completed && !inModule) { modules++; inModule = true; }
      if (!step.completed) inModule = false;
    });
    return modules;
  }, [steps, roadmapData]);

  const updateStreakAfterQuiz = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = currentProgress.last_activity_date;
    let newStreakCount = currentProgress.streak_count || 0;
    
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return;
      else if (diffDays === 1) newStreakCount += 1;
      else if (diffDays > 1) newStreakCount = 1;
    } else {
      newStreakCount = 1;
    }

    const { data, error } = await supabase
      .from('career_progress')
      .update({ last_activity_date: today, streak_count: newStreakCount })
      .eq('user_id', user.id)
      .eq('id', currentProgress.id)
      .select()
      .single();

    if (!error && data) {
      setCurrentProgress(data);
      if (newStreakCount === 7) await awardBadge('week_streak', '7 Day Streak', 'Maintained a 7-day learning streak!', 'Flame');
      else if (newStreakCount === 30) await awardBadge('month_streak', '30 Day Streak', 'Incredible! 30 days of consistent learning!', 'Crown');
    }
  };

  const handleXPEarned = async (xp: number, isQuizCompletion: boolean = false) => {
    if (!user) return;
    const newXP = (currentProgress.xp || 0) + xp;
    const { data, error } = await supabase
      .from('career_progress')
      .update({ xp: newXP })
      .eq('user_id', user.id)
      .eq('id', currentProgress.id)
      .select()
      .single();

    if (!error && data) {
      setCurrentProgress(data);
      if (isQuizCompletion) await updateStreakAfterQuiz();
      if (newXP >= 100 && (currentProgress.xp || 0) < 100) await awardBadge('xp_100', '100 XP Milestone', 'Earned your first 100 XP!', 'Zap');
      else if (newXP >= 500 && (currentProgress.xp || 0) < 500) await awardBadge('xp_500', '500 XP Milestone', 'Amazing! 500 XP achieved!', 'Trophy');
      else if (newXP >= 1000 && (currentProgress.xp || 0) < 1000) await awardBadge('xp_1000', '1000 XP Master', 'You are a learning master!', 'Crown');
    }
  };

  const awardBadge = async (badgeCode: string, badgeName: string, description: string, iconName: string) => {
    if (!user) return;
    const { data: existing } = await supabase.from('user_badges').select('id').eq('user_id', user.id).eq('badge_code', badgeCode).single();
    if (!existing) {
      await supabase.from('user_badges').insert({ user_id: user.id, badge_code: badgeCode, badge_name: badgeName, badge_description: description, icon_name: iconName });
      toast.success(`New Badge Unlocked: ${badgeName}!`);
    }
  };

  const getSkillColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-primary';
    if (progress >= 20) return 'bg-amber-500';
    return 'bg-muted-foreground/30';
  };

  const tabConfig = [
    { key: 'roadmap' as const, icon: Target, label: 'Roadmap' },
    { key: 'skills' as const, icon: BarChart3, label: 'Skills' },
    { key: 'quiz' as const, icon: Zap, label: 'Daily Quiz' },
    { key: 'assignment' as const, icon: BookOpen, label: 'Assignment' },
    { key: 'badges' as const, icon: Trophy, label: 'Badges' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-60">
      <Navbar 
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', href: '/main' },
          { label: 'Career Growth', href: '/career-growth' },
          { label: career.career_name }
        ]}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Overview Card */}
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                    Active Career Track
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                  >
                    {career.match_percentage}% Match
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {career.career_name} Roadmap
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  {career.description || `Step-by-step curriculum and progress milestone guide for ${career.career_name}.`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBack}
                  className="gap-2 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All Career Tracks
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium text-foreground">Overall Milestone Completion</span>
                <span className="text-sm font-semibold text-primary">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2.5" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{completedSteps} of {totalSteps} modules completed</span>
                <span>{completedModules} milestone modules completed</span>
              </div>
            </div>
          </div>
        </Card>

        {/* View Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl border border-border/60">
          {tabConfig.map(({ key, icon: Icon, label }) => {
            const isActive = activeView === key;
            return (
              <Button
                key={key}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView(key)}
                className={`flex-1 min-w-[120px] gap-2 text-xs font-medium rounded-lg transition-all ${
                  isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Button>
            );
          })}
        </div>

        {/* Streak & Progress Stats */}
        {user && (
          <StreakTracker
            streakCount={currentProgress.streak_count || 0}
            xp={currentProgress.xp || 0}
            lastActivityDate={currentProgress.last_activity_date}
          />
        )}

        {/* Skills Progress Tab */}
        {activeView === 'skills' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Target Competency Progress</h3>
              <p className="text-xs text-muted-foreground">Track mastery of required skills for {career.career_name}</p>
            </div>
            
            <Card className="p-6 border-border/80 shadow-sm">
              {skillProgress.length > 0 ? (
                <div className="space-y-5">
                  {skillProgress.map(({ skill, progress: pct }, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{skill}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className={`${getSkillColor(pct)} h-2 rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Complete roadmap steps below to record verified skill progression.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Roadmap Tab */}
        {activeView === 'roadmap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Curriculum Modules</h3>
                <p className="text-xs text-muted-foreground">Work through each progressive module to build your career readiness</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {steps.length} Total Steps
              </Badge>
            </div>

            <div className="space-y-3">
              {steps.map((step: RoadmapStep, index: number) => {
                const isLocked = index > 0 && !steps[index - 1].completed;
                
                return (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 8 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.04 }}
                  >
                    <Card className={`p-5 transition-all duration-200 border ${
                      step.completed 
                        ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10' 
                        : isLocked 
                        ? 'border-border/40 opacity-70 bg-muted/20' 
                        : 'border-border/80 hover:border-primary/40 shadow-sm'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          step.completed 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300' 
                            : isLocked 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">
                              {step.title}
                            </h4>
                            {step.completed ? (
                              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                                Completed
                              </Badge>
                            ) : isLocked ? (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Locked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                In Progress
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>

                          {step.resources && step.resources.length > 0 && !isLocked && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {step.resources.map((resource: string, i: number) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="text-[11px] font-normal py-0.5 px-2 text-muted-foreground border-border/50"
                                >
                                  <BookOpen className="w-3 h-3 mr-1 text-primary" />
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {!step.completed && !isLocked && (
                            <div className="pt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/30"
                                onClick={() => toast.info('Mark this milestone completed as you accomplish this objective!')}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Mark as Complete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'quiz' && user && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Daily Diagnostic Challenge</h3>
              <p className="text-xs text-muted-foreground">Reinforce essential knowledge with daily 10-question practice challenges</p>
            </div>
            <DailyMCQ userId={user.id} careerName={career.career_name} onXPEarned={(xp) => handleXPEarned(xp, true)} />
          </div>
        )}

        {activeView === 'assignment' && user && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Weekly Practical Project</h3>
              <p className="text-xs text-muted-foreground">Real-world scenario assignments to build your portfolio</p>
            </div>
            <WeeklyAssignment userId={user.id} careerName={career.career_name} onXPEarned={handleXPEarned} />
          </div>
        )}

        {activeView === 'badges' && user && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Earned Credentials & Badges</h3>
              <p className="text-xs text-muted-foreground">Milestones unlocked throughout your career preparation journey</p>
            </div>
            <BadgeDisplay userId={user.id} />
          </div>
        )}
      </main>
    </div>
  );
};

