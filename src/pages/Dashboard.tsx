import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Target, 
  TrendingUp, 
  Award,
  ArrowRight,
  Compass,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navigation/Navbar';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [careerData, setCareerData] = useState<any>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const [careerRes, resumeRes] = await Promise.all([
          supabase
            .from('career_profiles')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        ]);

        setCareerData(careerRes.data);
        setResumeData(resumeRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar backTo="/" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics' }]} />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full text-center border-border/80 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
            <p className="text-xs text-muted-foreground">Please sign in to view your PathFinders analytics dashboard.</p>
            <Button onClick={() => navigate('/auth')} className="w-full">Sign In</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar backTo="/main" breadcrumbs={[{ label: 'Dashboard', href: '/main' }, { label: 'Analytics' }]} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-semibold text-foreground">Loading Analytics Overview</h3>
            <p className="text-xs text-muted-foreground">Aggregating career progression and resume diagnostics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar 
        backTo="/main"
        breadcrumbs={[
          { label: 'Dashboard', href: '/main' },
          { label: 'Analytics Overview' }
        ]}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="border-b border-border/60 pb-6 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5">
              Profile Performance
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-primary" />
            Performance & Analytics
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Consolidated overview of your career readiness scores, resume ATS compatibility, and quick path management tools.
          </p>
        </div>

        {/* Career Health & Resume Score Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Health Score */}
          <Card className="border-border/80 shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Career Health Score
                </CardTitle>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold">
                  {careerData?.career_health_score || 0} / 100
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Profile Assessment Readiness</span>
                  <span className="font-semibold text-foreground">{careerData?.career_health_score || 0}%</span>
                </div>
                <Progress value={careerData?.career_health_score || 0} className="h-2.5" />
              </div>
              
              {careerData ? (
                <div className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-border/40">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Field of Study</span>
                    <span className="font-medium text-foreground">{careerData.field_of_study || 'General'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Short-term Goal</span>
                    <span className="font-medium text-foreground max-w-[240px] truncate text-right">{careerData.short_term_goals || 'Skill Growth'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Assessment Date</span>
                    <span className="text-muted-foreground">{new Date(careerData.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-muted-foreground">No career profile recorded yet. Take the PathFinders Career Guidance assessment.</p>
                  <Button size="sm" onClick={() => navigate('/career-guide')}>
                    Start Career Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Score Breakdown */}
          <Card className="border-border/80 shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Resume & ATS Strength
                </CardTitle>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 font-semibold">
                  {resumeData?.overall_rating || 0} / 10 Rating
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>ATS Compatibility</span>
                    <span className="font-semibold text-primary">{resumeData?.ats_score || 0}%</span>
                  </div>
                  <Progress value={resumeData?.ats_score || 0} className="h-2.5" />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Overall Document Quality</span>
                    <span className="font-semibold text-foreground">{(resumeData?.overall_rating || 0) * 10}%</span>
                  </div>
                  <Progress value={(resumeData?.overall_rating || 0) * 10} className="h-2.5" />
                </div>
              </div>
              
              {resumeData ? (
                <div className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-border/40">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">File Analyzed</span>
                    <span className="font-medium text-foreground max-w-[200px] truncate">{resumeData.filename}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Health Label</span>
                    <span className="font-medium text-foreground">{resumeData.career_health || 'Satisfactory'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Analyzed Date</span>
                    <span className="text-muted-foreground">{new Date(resumeData.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-muted-foreground">No resume analyzed yet. Upload your PDF or DOCX resume for real-time ATS feedback.</p>
                  <Button size="sm" onClick={() => navigate('/resume-analyzer')}>
                    Analyze Resume
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">Direct Platform Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="p-5 border-border/70 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => navigate('/career-guide')}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Career Guide</h4>
                <p className="text-xs text-muted-foreground">Assess interests and explore career match trajectories.</p>
              </div>
              <div className="pt-4 flex items-center text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                Launch Guide <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>

            <Card 
              className="p-5 border-border/70 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => navigate('/resume-analyzer')}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Resume Analyzer</h4>
                <p className="text-xs text-muted-foreground">Run ATS audits and actionable section improvements.</p>
              </div>
              <div className="pt-4 flex items-center text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                Open Analyzer <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>

            <Card 
              className="p-5 border-border/70 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => navigate('/career-growth')}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Growth Pathways</h4>
                <p className="text-xs text-muted-foreground">Access module roadmaps and daily diagnostic quizzes.</p>
              </div>
              <div className="pt-4 flex items-center text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                View Pathways <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>

            <Card 
              className="p-5 border-border/70 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => navigate('/career-health')}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">Health Index</h4>
                <p className="text-xs text-muted-foreground">Comprehensive diagnostics and downloadable PDF reports.</p>
              </div>
              <div className="pt-4 flex items-center text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                View Health <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}