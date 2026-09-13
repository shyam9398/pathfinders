import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Code, 
  Palette, 
  BarChart, 
  Users, 
  Lightbulb,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  Compass,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { RoadmapView } from '@/components/RoadmapView';
import { getPredefinedRoadmap, getGenericRoadmap } from '@/data/predefinedRoadmaps';
import Navbar from '@/components/Navigation/Navbar';

interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  match_percentage: number;
  required_skills: string[];
  rationale: string;
}

interface CareerProgress {
  id: string;
  selected_career_id: string;
  selected_career_name: string;
  xp: number;
  streak_count: number;
  roadmap_data: any;
}

const careerIcons: Record<string, any> = {
  'Product Manager': Briefcase,
  'Data Analyst': BarChart,
  'Software Engineer': Code,
  'UI/UX Designer': Palette,
  'Business Analyst': Users,
  'Marketing Manager': Lightbulb,
  'default': Target
};

export const CareerGrowthPath = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerOption | null>(null);
  const [careerProgress, setCareerProgress] = useState<CareerProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const careerFromUrl = searchParams.get('career');

  useEffect(() => {
    if (!user) return;
    
    const init = async () => {
      setLoading(true);
      try {
        const [optionsResult, progressResult] = await Promise.all([
          supabase
            .from('career_options')
            .select('*')
            .eq('user_id', user.id)
            .order('match_percentage', { ascending: false }),
          supabase
            .from('career_progress')
            .select('*')
            .eq('user_id', user.id)
            .single()
        ]);

        const options = optionsResult.data || [];
        setCareerOptions(options);

        const progress = progressResult.data;
        const progressError = progressResult.error;
        
        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error fetching career progress:', progressError);
        }

        // If we have existing progress, show the roadmap immediately
        if (progress) {
          setCareerProgress(progress);
          const matched = options.find((c: CareerOption) => c.id === progress.selected_career_id);
          if (matched) {
            setSelectedCareer(matched);
            setShowRoadmap(true);
            setLoading(false);
            return;
          }
        }

        // If career param in URL, auto-start journey instantly
        if (careerFromUrl && options.length > 0) {
          const urlCareer = options.find(
            (c: CareerOption) => c.career_name.toLowerCase() === careerFromUrl.toLowerCase()
          );
          if (urlCareer) {
            setLoading(false);
            handleSelectCareer(urlCareer);
            return;
          }
        }

        // Also check localStorage for career selection
        const storedCareer = localStorage.getItem('selectedCareer');
        if (storedCareer && options.length > 0) {
          const stored = options.find(
            (c: CareerOption) => c.career_name.toLowerCase() === storedCareer.toLowerCase()
          );
          if (stored) {
            setLoading(false);
            handleSelectCareer(stored);
            return;
          }
        }
      } catch (error) {
        console.error('Error initializing career growth path:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, careerFromUrl]);

  const handleSelectCareer = async (career: CareerOption) => {
    if (!user) return;

    setSelectedCareer(career);

    // Load predefined roadmap immediately
    const predefined = getPredefinedRoadmap(career.career_name) || getGenericRoadmap(career.career_name);
    
    const transformedRoadmap = {
      steps: predefined.steps,
      milestones: predefined.levels.map((lvl, i) => ({
        id: `m${i + 1}`,
        title: `${lvl.level} — ${lvl.title}`,
        description: lvl.skills.join(', '),
        xpReward: (i + 1) * 100,
        tasks: lvl.skills.map((skill, j) => ({
          id: `t${i}_${j}`,
          title: skill,
          description: `Master ${skill}`,
          type: 'learning',
          xpReward: 10 + (i * 5),
          isCompleted: false,
        })),
      })),
      explanation: `Personalized roadmap for ${career.career_name}`,
    };

    // Save progress to DB
    const savePromise = supabase
      .from('career_progress')
      .upsert({
        user_id: user.id,
        selected_career_id: career.id,
        selected_career_name: career.career_name,
        xp: 0,
        streak_count: 0,
        roadmap_data: transformedRoadmap,
        last_activity_date: new Date().toISOString().split('T')[0]
      }, { onConflict: 'user_id' });

    // Show roadmap
    const tempProgress: CareerProgress = {
      id: 'temp',
      selected_career_id: career.id,
      selected_career_name: career.career_name,
      xp: 0,
      streak_count: 0,
      roadmap_data: transformedRoadmap,
    };
    setCareerProgress(tempProgress);
    setShowRoadmap(true);
    toast.success(`Journey started for ${career.career_name}!`);

    // Persist in background
    try {
      const { error } = await savePromise;
      if (error) console.error('Error saving progress:', error);
      
      const { data: savedProgress } = await supabase
        .from('career_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (savedProgress) setCareerProgress(savedProgress);
    } catch (err) {
      console.error('Background save error:', err);
    }

    // AI personalization non-blocking background invocation
    supabase.functions.invoke('generate-career-roadmap', {
      body: {
        careerName: career.career_name,
        profileData: {},
        language: 'en',
        mode: 'full'
      }
    }).catch(() => {});
  };

  const getCareerIcon = (careerName: string) => {
    return careerIcons[careerName] || careerIcons.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:pl-60">
        <Navbar backTo="/main" breadcrumbs={[{ label: 'Dashboard', href: '/main' }, { label: 'Career Growth' }]} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-semibold text-foreground">Loading Career Pathways</h3>
            <p className="text-xs text-muted-foreground">Retrieving recommendations and personalized roadmap data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showRoadmap && selectedCareer && careerProgress) {
    return (
      <RoadmapView 
        career={selectedCareer} 
        progress={careerProgress} 
        onBack={() => setShowRoadmap(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-60">
      <Navbar 
        backTo="/main" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/main' }, 
          { label: 'Career Growth Path' }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20 bg-primary/5">
                  PathFinders Milestone Tracker
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Career Growth Pathways
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                Select a recommended career track to unlock targeted milestone roadmaps, daily practice quizzes, and skill mastery milestones.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/career-guide')}
              className="gap-2"
            >
              <Compass className="w-4 h-4 text-primary" />
              Retake Career Assessment
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {careerOptions.length === 0 ? (
          <div className="py-12">
            <Card className="max-w-xl mx-auto border-border/80 shadow-sm text-center p-8 sm:p-10 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5">
                <Target className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">No Career Tracks Generated Yet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete the quick PathFinders Career Guidance assessment to discover which career trajectories align with your interests, skills, and academic profile.
                </p>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/career-guide')}
                className="w-full sm:w-auto gap-2 shadow-sm font-medium"
              >
                <Compass className="w-4 h-4" />
                Start Career Assessment
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          </div>
        ) : (
          /* Career Options Grid */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {careerOptions.length} matched career tracks</span>
              <span className="text-xs">Ranked by overall profile compatibility</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerOptions.map((career, index) => {
                const Icon = getCareerIcon(career.career_name);
                const matchPct = career.match_percentage || 75;

                return (
                  <motion.div
                    key={career.id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col border-border/70 hover:border-primary/40 hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <Badge 
                            variant="outline" 
                            className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-semibold"
                          >
                            {matchPct}% Match
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold text-foreground mt-3">
                          {career.career_name}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                          {career.description || career.rationale}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 space-y-3 pb-4">
                        {career.required_skills && career.required_skills.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              Target Competencies
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {career.required_skills.slice(0, 4).map((skill, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="text-[11px] font-normal py-0.5 px-2 bg-muted/80 text-muted-foreground border-border/40"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {career.required_skills.length > 4 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] text-muted-foreground py-0 px-1.5"
                                >
                                  +{career.required_skills.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-2 border-t border-border/40">
                        <Button
                          className="w-full gap-2 font-medium"
                          onClick={() => handleSelectCareer(career)}
                        >
                          <TrendingUp className="w-4 h-4" />
                          Explore Roadmap
                          <ArrowRight className="w-4 h-4 ml-auto" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

