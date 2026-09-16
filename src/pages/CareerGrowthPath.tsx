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
import { careerGuidanceService } from '@/services/careerGuidanceService';

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

const DEMO_CAREER_OPTIONS: CareerOption[] = [
  {
    id: 'demo-se',
    career_name: 'Software Engineer',
    description: 'Master full-stack architecture, clean code principles, scalable microservices, and distributed data systems.',
    match_percentage: 95,
    required_skills: ['Java / TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'System Design'],
    rationale: 'Top matched career path with immense global demand and high software engineering compensation.'
  },
  {
    id: 'demo-da',
    career_name: 'Data Analyst',
    description: 'Analyze complex datasets, build machine learning models, and uncover actionable predictive insights.',
    match_percentage: 92,
    required_skills: ['Python', 'SQL', 'Pandas & NumPy', 'Tableau', 'Machine Learning', 'Statistics'],
    rationale: 'Fast-growing high-impact discipline powering data-driven strategy and business intelligence.'
  },
  {
    id: 'demo-pm',
    career_name: 'Product Manager',
    description: 'Bridge engineering, user research, and executive vision to build products that customers love.',
    match_percentage: 88,
    required_skills: ['Agile / Scrum', 'Product Roadmapping', 'User Research', 'Data Analysis', 'Feature Prioritization'],
    rationale: 'Strategic leadership pathway driving product roadmap, customer empathy, and cross-functional teams.'
  },
  {
    id: 'demo-ui',
    career_name: 'UI/UX Designer',
    description: 'Craft intuitive, accessible, and delightful digital experiences using Figma and human-centered design principles.',
    match_percentage: 85,
    required_skills: ['Figma', 'Wireframing', 'User Testing', 'Design Systems', 'Interactive Prototyping'],
    rationale: 'High synergy with creative problem solving and front-end interface engineering.'
  },
  {
    id: 'demo-ba',
    career_name: 'Business Analyst',
    description: 'Model business workflows, optimize enterprise processes, and translate stakeholder needs into technical specifications.',
    match_percentage: 81,
    required_skills: ['Process Mapping', 'SQL', 'Requirements Gathering', 'Stakeholder Management', 'Power BI'],
    rationale: 'Essential organizational bridge between domain stakeholders and technical product developers.'
  }
];

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
  const [isDemoData, setIsDemoData] = useState(false);

  const careerFromUrl = searchParams.get('career');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        let options: CareerOption[] = [];
        let progress: any = null;

        if (user) {
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

          options = optionsResult.data || [];
          progress = progressResult.data;
          const progressError = progressResult.error;
          
          if (progressError && progressError.code !== 'PGRST116') {
            console.error('Error fetching career progress:', progressError);
          }
        }

        // Check local storage and careerGuidanceService if Supabase options is empty
        if (options.length === 0) {
          try {
            const raw = localStorage.getItem(`pf_career_options_${user?.id || 'guest'}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                options = parsed;
              }
            }
          } catch (e) {}
        }

        if (options.length === 0 && user?.id) {
          try {
            const analyses = await careerGuidanceService.getAnalyses(user.id);
            if (analyses && analyses.length > 0) {
              const latest = analyses[0];
              options = [{
                id: latest.id,
                career_name: latest.targetCareer,
                description: `Personalized AI roadmap matched at ${latest.matchPercentage}%. Core focus: ${latest.skills.join(', ')}.`,
                match_percentage: latest.matchPercentage,
                required_skills: latest.skills.concat(latest.skillGaps.slice(0, 3)),
                rationale: `Derived from your career guidance submission with ${latest.recommendedTrainers.length} recommended faculty members.`
              }];
            }
          } catch (e) {}
        }

        // Show demo data only if user has truly not submitted or generated career data
        if (options.length === 0) {
          setCareerOptions(DEMO_CAREER_OPTIONS);
          setIsDemoData(true);
        } else {
          setCareerOptions(options);
          setIsDemoData(false);
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

        const activeOptions = options.length > 0 ? options : DEMO_CAREER_OPTIONS;

        // If career param in URL, auto-start journey instantly
        if (careerFromUrl && activeOptions.length > 0) {
          const urlCareer = activeOptions.find(
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
        if (storedCareer && activeOptions.length > 0) {
          const stored = activeOptions.find(
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
        setCareerOptions(DEMO_CAREER_OPTIONS);
        setIsDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, careerFromUrl]);

  const handleSelectCareer = async (career: CareerOption) => {
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

    // Set immediate progress to render interactive roadmap
    const tempProgress: CareerProgress = {
      id: `prog-${career.id}`,
      selected_career_id: career.id,
      selected_career_name: career.career_name,
      xp: 60,
      streak_count: 2,
      roadmap_data: transformedRoadmap,
    };
    setCareerProgress(tempProgress);
    setShowRoadmap(true);
    toast.success(`Journey launched for ${career.career_name}!`);

    // Persist to Supabase if genuine user account
    if (user && !career.id.startsWith('demo-')) {
      try {
        await supabase
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
      } catch (err) {
        console.error('Background save error:', err);
      }
    }
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

        {/* Demo Mode Notification Banner */}
        {isDemoData && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 dark:border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Showing Demo Career Pathways</h3>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] font-bold">
                    Demo Mode
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  These demo pathways showcase milestone roadmaps, tasks, and daily diagnostics until you complete your personalized career assessment.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/career-guide')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shrink-0 h-9"
            >
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              Take Assessment Now
            </Button>
          </div>
        )}

        {/* Empty State (Only if demo data is also empty) */}
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
              <span>Showing {careerOptions.length} {isDemoData ? 'recommended demo' : 'matched'} career tracks</span>
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

