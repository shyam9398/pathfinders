import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Settings, 
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  Award,
  Zap,
  Star,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navigation/Navbar';

interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  required_skills: string[];
  match_percentage: number;
  rationale: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'practice' | 'self-assessment';
  xpReward: number;
  isCompleted: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  tasks: Task[];
}

interface RoadmapData {
  milestones: Milestone[];
}

interface CareerProgress {
  selectedCareerId: string;
  selectedCareerName: string;
  xp: number;
  streakCount: number;
  lastActivityDate: string;
  roadmapData: RoadmapData;
}

const getMotivationalQuote = (xp: number, t: any) => {
  if (xp < 100) return t('roadmap.quotes.beginner') || "Every expert was once a beginner. Start your journey!";
  if (xp < 500) return t('roadmap.quotes.learner') || "You're making great progress! Keep pushing forward.";
  if (xp < 1000) return t('roadmap.quotes.achiever') || "Your dedication is paying off! You're becoming unstoppable.";
  if (xp < 2000) return t('roadmap.quotes.master') || "Mastery is within reach. Your future self will thank you.";
  return t('roadmap.quotes.legend') || "You're a legend in the making! Inspire others with your journey.";
};

export const RoadmapPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [progress, setProgress] = useState<CareerProgress | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!progress) return;
    
    const earnedBadges: string[] = [];
    const completedMilestones = progress.roadmapData.milestones.filter(m => 
      m.tasks.every(t => t.isCompleted)
    ).length;

    if (progress.xp >= 100) earnedBadges.push('quick_starter');
    if (progress.xp >= 500) earnedBadges.push('dedicated_learner');
    if (progress.xp >= 1000) earnedBadges.push('knowledge_seeker');
    if (progress.streakCount >= 3) earnedBadges.push('streak_starter');
    if (progress.streakCount >= 7) earnedBadges.push('consistency_king');
    if (completedMilestones >= 1) earnedBadges.push('milestone_master');
    
    setBadges(earnedBadges);
  }, [progress]);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [careerOptionsRes, progressRes, profileRes] = await Promise.all([
        supabase
          .from('career_options')
          .select('*')
          .eq('user_id', user.id)
          .order('match_percentage', { ascending: false }),
        supabase
          .from('career_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('career_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      if (careerOptionsRes.data) {
        setCareerOptions(careerOptionsRes.data);
      }

      if (profileRes.data) {
        setProfileData(profileRes.data);
      }

      if (progressRes.data) {
        const rawProgress = progressRes.data;
        const normalizedRoadmapData: RoadmapData = {
          milestones: rawProgress.roadmap_data?.milestones || []
        };

        setProgress({
          selectedCareerId: rawProgress.selected_career_id,
          selectedCareerName: rawProgress.selected_career_name,
          xp: rawProgress.xp,
          streakCount: rawProgress.streak_count,
          lastActivityDate: rawProgress.last_activity_date,
          roadmapData: normalizedRoadmapData
        });

        if (normalizedRoadmapData.milestones.length > 0) {
          setExpandedMilestone(normalizedRoadmapData.milestones[0].id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      toast({
        title: t('common.error') || 'Error',
        description: error.message || 'Failed to load roadmap data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCareer = async (career: CareerOption) => {
    if (!user) return;

    try {
      setIsGeneratingRoadmap(true);

      const defaultRoadmap = generateDefaultRoadmap(career);

      const { data: newProgress, error: insertError } = await supabase
        .from('career_progress')
        .upsert({
          user_id: user.id,
          selected_career_id: career.id,
          selected_career_name: career.career_name,
          xp: 0,
          streak_count: 0,
          roadmap_data: defaultRoadmap,
          last_activity_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (newProgress) {
        setProgress({
          selectedCareerId: newProgress.selected_career_id,
          selectedCareerName: newProgress.selected_career_name,
          xp: newProgress.xp,
          streakCount: newProgress.streak_count,
          lastActivityDate: newProgress.last_activity_date,
          roadmapData: newProgress.roadmap_data as unknown as RoadmapData
        });

        if (newProgress.roadmap_data?.milestones?.length > 0) {
          setExpandedMilestone(newProgress.roadmap_data.milestones[0].id);
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast({
          title: t('roadmap.careerSelected') || 'Career Path Selected!',
          description: `${t('roadmap.startedJourney')} ${career.career_name}`,
        });

        generateAIRoadmap(career);
      }
    } catch (error: any) {
      console.error('Error selecting career:', error);
      toast({
        title: t('common.error') || 'Error',
        description: error.message || 'Failed to start career path',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const generateAIRoadmap = async (career: CareerOption) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-career-roadmap', {
        body: {
          careerName: career.career_name,
          profileData: profileData,
          language: language,
          mode: 'full'
        }
      });

      if (error) {
        console.warn('AI roadmap generation failed, using default roadmap:', error);
        return;
      }

      if (data?.roadmap && user) {
        const { error: updateError } = await supabase
          .from('career_progress')
          .update({
            roadmap_data: data.roadmap
          })
          .eq('user_id', user.id);

        if (!updateError) {
          setProgress(prev => prev ? {
            ...prev,
            roadmapData: data.roadmap
          } : null);

          toast({
            title: t('roadmap.aiPersonalized') || 'AI Personalized!',
            description: t('roadmap.roadmapEnhanced') || 'Your roadmap has been enhanced with AI recommendations.',
          });
        }
      }
    } catch (error) {
      console.warn('Background AI roadmap generation error:', error);
    }
  };

  const generateDefaultRoadmap = (career: CareerOption): RoadmapData => {
    return {
      milestones: [
        {
          id: 'm1',
          title: `${t('roadmap.level1Title') || 'Foundation & Fundamentals'}`,
          description: `${t('roadmap.level1Desc') || 'Master the core concepts and fundamental skills required for'} ${career.career_name}`,
          xpReward: 100,
          tasks: [
            {
              id: 't1_1',
              title: `${t('roadmap.task1Title') || 'Introduction to'} ${career.career_name}`,
              description: t('roadmap.task1Desc') || 'Learn about the role, responsibilities, and industry landscape',
              type: 'learning',
              xpReward: 20,
              isCompleted: false
            },
            {
              id: 't1_2',
              title: `${t('roadmap.task2Title') || 'Core Skills Overview'}`,
              description: `Understand key required skills: ${career.required_skills?.slice(0, 3).join(', ') || 'essential skills'}`,
              type: 'learning',
              xpReward: 20,
              isCompleted: false
            },
            {
              id: 't1_3',
              title: t('roadmap.task3Title') || 'Initial Self-Assessment',
              description: t('roadmap.task3Desc') || 'Evaluate your current knowledge and identify learning gaps',
              type: 'self-assessment',
              xpReward: 30,
              isCompleted: false
            },
            {
              id: 't1_4',
              title: t('roadmap.task4Title') || 'Hands-on Practice: Basics',
              description: t('roadmap.task4Desc') || 'Complete your first practical exercise or project',
              type: 'practice',
              xpReward: 30,
              isCompleted: false
            }
          ]
        },
        {
          id: 'm2',
          title: `${t('roadmap.level2Title') || 'Skill Building & Practice'}`,
          description: `${t('roadmap.level2Desc') || 'Deep dive into essential tools and practical applications for'} ${career.career_name}`,
          xpReward: 200,
          tasks: [
            {
              id: 't2_1',
              title: t('roadmap.task5Title') || 'Advanced Concepts Deep Dive',
              description: t('roadmap.task5Desc') || 'Study intermediate to advanced topics in the field',
              type: 'learning',
              xpReward: 40,
              isCompleted: false
            },
            {
              id: 't2_2',
              title: t('roadmap.task6Title') || 'Industry Tools Mastery',
              description: t('roadmap.task6Desc') || 'Get hands-on experience with standard industry tools and workflows',
              type: 'practice',
              xpReward: 50,
              isCompleted: false
            },
            {
              id: 't2_3',
              title: t('roadmap.task7Title') || 'Mini-Project Development',
              description: t('roadmap.task7Desc') || 'Build a portfolio-worthy mini-project demonstrating your skills',
              type: 'practice',
              xpReward: 60,
              isCompleted: false
            },
            {
              id: 't2_4',
              title: t('roadmap.task8Title') || 'Mid-Point Assessment',
              description: t('roadmap.task8Desc') || 'Test your understanding of intermediate concepts',
              type: 'self-assessment',
              xpReward: 50,
              isCompleted: false
            }
          ]
        },
        {
          id: 'm3',
          title: `${t('roadmap.level3Title') || 'Advanced Topics & Portfolio'}`,
          description: `${t('roadmap.level3Desc') || 'Build professional projects and prepare for career opportunities'}`,
          xpReward: 300,
          tasks: [
            {
              id: 't3_1',
              title: t('roadmap.task9Title') || 'Capstone Project',
              description: t('roadmap.task9Desc') || 'Design and execute an end-to-end comprehensive project',
              type: 'practice',
              xpReward: 100,
              isCompleted: false
            },
            {
              id: 't3_2',
              title: t('roadmap.task10Title') || 'Portfolio Creation',
              description: t('roadmap.task10Desc') || 'Document and showcase your projects for potential employers',
              type: 'practice',
              xpReward: 80,
              isCompleted: false
            },
            {
              id: 't3_3',
              title: t('roadmap.task11Title') || 'Interview Preparation',
              description: t('roadmap.task11Desc') || 'Practice common technical and behavioral interview questions',
              type: 'learning',
              xpReward: 60,
              isCompleted: false
            },
            {
              id: 't3_4',
              title: t('roadmap.task12Title') || 'Final Career Readiness Check',
              description: t('roadmap.task12Desc') || 'Comprehensive review of your skills and career readiness',
              type: 'self-assessment',
              xpReward: 60,
              isCompleted: false
            }
          ]
        }
      ]
    };
  };

  const handleTaskToggle = async (milestoneId: string, taskId: string) => {
    if (!progress || !user) return;

    try {
      let taskCompleted = false;
      let taskXp = 0;
      let milestoneCompletedNow = false;

      const updatedMilestones = progress.roadmapData.milestones.map(m => {
        if (m.id !== milestoneId) return m;

        const wasMilestoneCompleted = m.tasks.every(t => t.isCompleted);
        const updatedTasks = m.tasks.map(t => {
          if (t.id === taskId) {
            taskCompleted = !t.isCompleted;
            taskXp = t.xpReward;
            return { ...t, isCompleted: !t.isCompleted };
          }
          return t;
        });

        const isMilestoneCompleted = updatedTasks.every(t => t.isCompleted);
        if (!wasMilestoneCompleted && isMilestoneCompleted) {
          milestoneCompletedNow = true;
        }

        return { ...m, tasks: updatedTasks };
      });

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = progress.lastActivityDate;
      let newStreak = progress.streakCount;

      if (taskCompleted) {
        if (!lastActivity) {
          newStreak = 1;
        } else {
          const lastDate = new Date(lastActivity);
          const currentDate = new Date(today);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }
      }

      const xpChange = taskCompleted ? taskXp : -taskXp;
      const milestoneBonus = milestoneCompletedNow ? 100 : 0;
      const newXp = Math.max(0, progress.xp + xpChange + milestoneBonus);

      const updatedRoadmapData: RoadmapData = {
        milestones: updatedMilestones
      };

      const { error } = await supabase
        .from('career_progress')
        .update({
          roadmap_data: updatedRoadmapData,
          xp: newXp,
          streak_count: newStreak,
          last_activity_date: today
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProgress({
        ...progress,
        xp: newXp,
        streakCount: newStreak,
        lastActivityDate: today,
        roadmapData: updatedRoadmapData
      });

      if (taskCompleted) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });

        toast({
          title: `+${taskXp} XP!`,
          description: t('roadmap.taskCompleted') || 'Task completed successfully!',
        });

        if (milestoneCompletedNow) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 }
            });
            setShowAchievement(t('roadmap.milestoneCompleted') || 'Milestone Completed! +100 Bonus XP');
            setTimeout(() => setShowAchievement(null), 4000);
          }, 500);
        }
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: t('common.error') || 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const calculateOverallProgress = () => {
    if (!progress?.roadmapData?.milestones) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;

    progress.roadmapData.milestones.forEach(m => {
      m.tasks.forEach(t => {
        totalTasks++;
        if (t.isCompleted) completedTasks++;
      });
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getLevel = (xp: number) => {
    const levelNumber = Math.floor(xp / 500) + 1;
    const progressInLevel = xp % 500;
    
    let title = t('roadmap.levels.novice') || 'Novice';
    if (levelNumber === 2) title = t('roadmap.levels.apprentice') || 'Apprentice';
    else if (levelNumber === 3) title = t('roadmap.levels.practitioner') || 'Practitioner';
    else if (levelNumber === 4) title = t('roadmap.levels.specialist') || 'Specialist';
    else if (levelNumber >= 5) title = t('roadmap.levels.expert') || 'Expert';

    return { levelNumber, title, progress: progressInLevel };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:pl-60">
        <Navbar backTo="/main" breadcrumbs={[{ label: 'Dashboard', href: '/main' }, { label: 'Roadmap' }]} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-semibold text-foreground">Loading Career Roadmap</h3>
            <p className="text-xs text-muted-foreground">Retrieving milestones and gamified progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!progress || !progress.selectedCareerId) {
    if (careerOptions.length === 0) {
      return (
        <div className="min-h-screen bg-background flex flex-col lg:pl-60">
          <Navbar backTo="/main" breadcrumbs={[{ label: 'Dashboard', href: '/main' }, { label: 'Roadmap' }]} />
          <div className="flex-1 max-w-3xl mx-auto px-4 py-12 flex items-center justify-center">
            <Card className="p-8 sm:p-10 max-w-lg w-full text-center border-border/80 shadow-sm space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Target className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  {t('roadmap.noCareerOptions') || 'No Career Options Selected Yet'}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('roadmap.completeGuidance') || 'Please complete the Career Guidance assessment first to unlock your personalized learning journey.'}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/career-guide')}
                className="w-full gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t('roadmap.goToGuidance') || 'Start Career Assessment'}
              </Button>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col lg:pl-60">
        <Navbar 
          backTo="/main" 
          breadcrumbs={[
            { label: 'Dashboard', href: '/main' }, 
            { label: 'Select Roadmap' }
          ]} 
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5">
              PathFinders Roadmaps
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('roadmap.selectCareer') || 'Select Your Career Path'}
            </h1>
            <p className="text-sm text-muted-foreground italic">
              "{getMotivationalQuote(0, t)}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careerOptions.map((career, index) => (
              <motion.div
                key={career.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full border-border/80 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <CardTitle className="text-lg font-bold text-foreground">
                        {career.career_name}
                      </CardTitle>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200">
                        {career.match_percentage}% Match
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                      {career.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {career.required_skills && career.required_skills.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('roadmap.keySkills') || 'Key Skills:'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {career.required_skills.slice(0, 4).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleSelectCareer(career)}
                      disabled={isGeneratingRoadmap}
                      className="w-full gap-2 mt-2"
                    >
                      {isGeneratingRoadmap ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {isGeneratingRoadmap 
                        ? (t('roadmap.generating') || 'Generating...') 
                        : (t('roadmap.startPath') || 'Start This Path')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const level = getLevel(progress.xp);
  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-60">
      <Navbar 
        backTo="/main" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/main' }, 
          { label: progress.selectedCareerName }
        ]} 
      />

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 20, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="border-primary shadow-lg bg-card p-4 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-primary shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">
                  {t('roadmap.achievementUnlocked') || 'Achievement Unlocked!'}
                </p>
                <p className="text-xs text-muted-foreground">{showAchievement}</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">


        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-orbitron font-bold gradient-text mb-2 drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]">
            {progress.selectedCareerName}
          </h1>
          <p className="text-muted-foreground text-lg italic">
            "{getMotivationalQuote(progress.xp, t)}"
          </p>
        </motion.div>

        {/* Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* XP & Level */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-2 border-primary/30 hover:border-primary/60 transition-all shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-6 h-6 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                    </motion.div>
                    <span className="font-orbitron font-bold text-lg">{level.title}</span>
                  </div>
                  <span className="text-2xl font-bold gradient-text">{progress.xp} XP</span>
                </div>
                <Progress value={(level.progress / 500) * 100} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {level.progress} / 500 XP {t('roadmap.toNextLevel') || 'to next level'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Counter */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-2 border-orange-500/30 hover:border-orange-500/60 transition-all shadow-[0_0_20px_rgba(251,146,60,0.2)] hover:shadow-[0_0_30px_rgba(251,146,60,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <motion.div
                    animate={progress.streakCount >= 7 ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame className={`w-10 h-10 ${progress.streakCount >= 7 ? 'text-orange-500 drop-shadow-[0_0_20px_rgba(251,146,60,1)]' : 'text-orange-400'}`} />
                  </motion.div>
                  <span className="text-4xl font-bold gradient-text">{progress.streakCount}</span>
                </div>
                <p className="text-center font-orbitron font-semibold text-lg">
                  {t('roadmap.dayStreak') || 'Day Streak'}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {t('roadmap.keepGoing') || 'Keep learning daily!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-2 border-green-500/30 hover:border-green-500/60 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <span className="font-orbitron font-bold text-lg">{t('roadmap.progress') || 'Progress'}</span>
                  </div>
                  <span className="text-2xl font-bold gradient-text">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {t('roadmap.completionRate') || 'Path completion rate'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trophy Wall */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="font-orbitron gradient-text flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                {t('roadmap.trophyWall') || 'Trophy Wall'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['starter', 'consistent', 'crusher', 'pathfinder'].map((badgeId, index) => {
                  const badge = getBadgeInfo(badgeId);
                  const earned = badges.includes(badgeId);
                  return (
                    <motion.div
                      key={badgeId}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                      whileHover={{ scale: earned ? 1.1 : 1, rotate: earned ? [0, -5, 5, 0] : 0 }}
                      className={`relative group ${earned ? '' : 'opacity-40 grayscale'}`}
                    >
                      <div className={`absolute -inset-1 bg-gradient-to-r ${earned ? 'from-primary via-purple-500 to-primary opacity-50 blur-lg' : 'opacity-0'} rounded-lg transition-opacity`} />
                      <Card className={`relative border-2 ${earned ? 'border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 'border-muted'} transition-all bg-gradient-to-br from-card to-${earned ? 'primary' : 'muted'}/10`}>
                        <CardContent className="p-4 text-center">
                          <motion.div
                            animate={earned ? { rotate: [0, 360] } : {}}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="text-4xl mb-2"
                          >
                            {badge.icon}
                          </motion.div>
                          <p className={`font-orbitron font-bold text-sm ${badge.color}`}>
                            {badge.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {badge.desc}
                          </p>
                          {earned && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2"
                            >
                              <div className="bg-green-500 rounded-full p-1 shadow-[0_0_15px_rgba(34,197,94,0.8)]">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestones Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-3xl font-orbitron font-bold gradient-text mb-6 flex items-center gap-2">
            <Target className="w-8 h-8" />
            {t('roadmap.yourJourney') || 'Your Learning Journey'}
          </h2>

          <div className="space-y-6">
            {progress.roadmapData.milestones.map((milestone, index) => {
              const completedTasks = milestone.tasks.filter(t => t.isCompleted).length;
              const totalTasks = milestone.tasks.length;
              const milestoneProgress = (completedTasks / totalTasks) * 100;
              const isExpanded = expandedMilestone === milestone.id;
              const isCompleted = completedTasks === totalTasks;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="relative group">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${isCompleted ? 'from-green-500 via-emerald-500 to-green-500' : 'from-primary via-purple-500 to-primary'} rounded-lg opacity-30 group-hover:opacity-60 blur transition duration-500`} />
                    <Card className={`relative glass-card border-2 ${isCompleted ? 'border-green-500/50' : 'border-primary/30'} transition-all`}>
                      <CardHeader
                        className="cursor-pointer"
                        onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary/20'} flex items-center justify-center border-2 ${isCompleted ? 'border-green-500' : 'border-primary'} shadow-[0_0_15px_rgba(var(--primary),0.5)]`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6 text-white" />
                                ) : (
                                  <span className="font-bold text-primary">{index + 1}</span>
                                )}
                              </div>
                              <div>
                                <CardTitle className="text-xl font-orbitron gradient-text">
                                  {milestone.title}
                                </CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {milestone.description}
                                </CardDescription>
                              </div>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {completedTasks} / {totalTasks} {t('roadmap.tasksCompleted') || 'tasks completed'}
                                </span>
                                <Badge variant="secondary" className="bg-primary/20 border-primary/30">
                                  +{milestone.xpReward} XP
                                </Badge>
                              </div>
                              <Progress value={milestoneProgress} className="h-2" />
                            </div>
                          </div>
                          
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-6 h-6 text-muted-foreground" />
                          </motion.div>
                        </div>
                      </CardHeader>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent>
                              <div className="space-y-3">
                                {milestone.tasks.map((task, taskIndex) => (
                                  <motion.div
                                    key={task.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: taskIndex * 0.05 }}
                                  >
                                    <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${task.isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-primary/20 bg-card/50'} transition-all hover:border-primary/50`}>
                                      <Checkbox
                                        checked={task.isCompleted}
                                        onCheckedChange={() => handleTaskComplete(milestone.id, task.id, task.isCompleted)}
                                        className="mt-1"
                                      />
                                      
                                      <div className="flex-1">
                                        <div className="flex items-start gap-2 mb-1">
                                          <div className={`p-1.5 rounded ${task.isCompleted ? 'bg-green-500/20' : 'bg-primary/20'}`}>
                                            {getTaskIcon(task.type)}
                                          </div>
                                          <div className="flex-1">
                                            <p className={`font-semibold ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                              {task.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {task.description}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <Badge 
                                        variant="outline" 
                                        className={`${task.isCompleted ? 'bg-green-500/20 border-green-500/50' : 'bg-primary/10 border-primary/30'}`}
                                      >
                                        <Zap className="w-3 h-3 mr-1" />
                                        +{task.xpReward} XP
                                      </Badge>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

