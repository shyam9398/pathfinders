import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { ProfileForm } from './ProfileForm';
import { CareerAnalyzer } from './CareerAnalyzer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  History, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  Calendar, 
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { careerGuidanceService, StoredCareerGuidanceAnalysis } from '@/services/careerGuidanceService';
import { resumeService } from '@/services/resumeService';

interface ProfileData {
  name: string;
  age: string;
  country: string;
  educationLevel: string;
  fieldOfStudy: string;
  specialization: string;
  currentYear: string;
  certifications: string;
  skills: string;
  interests: string;
  workEnvironment: string;
  goals: string;
  careerTransition: string;
  studyOrJob: string;
  locationPreference: string;
  companyType: string;
  financialSupport: string;
  resumeText?: string;
}

export const CareerGuidePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const userId = user?.id || 'guest';

  const [currentView, setCurrentView] = useState<'hero' | 'form' | 'analyzer' | 'history'>('hero');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [historyAnalyses, setHistoryAnalyses] = useState<StoredCareerGuidanceAnalysis[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load profile and history on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Load history
        const list = await careerGuidanceService.getAnalyses(userId);
        setHistoryAnalyses(list);

        // Load latest resume to pre-fill skills if profile is empty
        const resumes = await resumeService.getUserResumes(userId);
        const latestResume = resumes[0];

        // Load profile from Supabase
        const { data, error } = await supabase
          .from('career_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (data && !error) {
          const loaded: ProfileData = {
            name: data.name || '',
            age: data.age || '',
            country: data.country || '',
            educationLevel: data.education_level || '',
            fieldOfStudy: data.field_of_study || '',
            specialization: data.specialization || '',
            currentYear: data.current_year || '',
            certifications: data.certifications || '',
            skills: data.skills || (latestResume?.skills?.join(', ') || ''),
            interests: data.interests || '',
            workEnvironment: data.work_environment || '',
            goals: data.short_term_goals || data.long_term_goals || '',
            careerTransition: data.career_transition || '',
            studyOrJob: data.study_or_job || '',
            locationPreference: data.location_preference || '',
            companyType: data.company_type || '',
            financialSupport: data.financial_support || '',
          };
          setProfileData(loaded);
        } else if (latestResume) {
          setProfileData({
            name: user?.name || 'Trainee',
            age: '22',
            country: 'India',
            educationLevel: 'Bachelor\'s Degree',
            fieldOfStudy: 'Computer Science',
            specialization: 'Software Engineering',
            currentYear: 'Final Year',
            certifications: latestResume.certifications?.join(', ') || '',
            skills: latestResume.skills?.join(', ') || 'Java, Python, SQL',
            interests: 'Software Architecture, AI',
            workEnvironment: 'Hybrid',
            goals: 'Land a software engineering position at a top product tech company.',
            careerTransition: 'No',
            studyOrJob: 'Job',
            locationPreference: 'Bangalore / Hyderabad',
            companyType: 'Product Company',
            financialSupport: 'Not needed'
          });
        }
      } catch (err) {
        console.error('Error initializing CareerGuidePage:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [userId, user]);

  const handleStartChat = () => {
    setCurrentView('form');
  };

  const handleFormComplete = (data: ProfileData) => {
    setProfileData(data);
    setCurrentView('analyzer');
  };

  const handleBackToHome = () => {
    setCurrentView('hero');
  };

  const handleSelectHistoryItem = (item: StoredCareerGuidanceAnalysis) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        skills: item.skills.join(', '),
        interests: item.interests.join(', '),
        goals: item.goals
      });
    }
    setCurrentView('analyzer');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your Career Guidance...</p>
        </div>
      </div>
    );
  }

  // --- HISTORY VIEW (Requirement 6) ---
  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
        <Navbar 
          breadcrumbs={[
            { label: t('Career Guidance', 'Career Guidance'), href: '/career-guide' },
            { label: t('Analysis History', 'Analysis History') }
          ]} 
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {t('Career Guidance History', 'Career Guidance History')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('Persistent records of all previous AI analyses, matched scores, and recommended trainers.', 'Persistent records of all previous AI analyses, matched scores, and recommended trainers.')}
              </p>
            </div>
            <Button 
              size="sm"
              onClick={() => setCurrentView('hero')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              {t('New Career Analysis', 'New Career Analysis')}
            </Button>
          </div>

          <div className="space-y-4">
            {historyAnalyses.map((item, idx) => (
              <Card key={item.id} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                        Analysis #{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Career: {item.targetCareer}
                    </h3>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-sm border border-emerald-200">
                    Match: {item.matchPercentage}%
                  </div>
                </div>

                {/* Skill gaps */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                    {t('Identified Skill Gaps', 'Identified Skill Gaps')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skillGaps.map((gap, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 font-semibold">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Trainers */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Recommended Trainers: <strong>{item.recommendedTrainers.length} verified faculty</strong></span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectHistoryItem(item)}
                    className="text-xs rounded-xl h-8 text-blue-600 hover:text-blue-700 font-bold"
                  >
                    {t('Inspect Full Analysis', 'Inspect Full Analysis')}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'form') {
    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
        <Navbar breadcrumbs={[{ label: t('Career Guidance', 'Career Guidance') }, { label: t('Profile Input', 'Profile Input') }]} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileForm 
            initialData={profileData} 
            onComplete={handleFormComplete} 
            onBack={handleBackToHome} 
          />
        </main>
      </div>
    );
  }

  if (currentView === 'analyzer' && profileData) {
    return (
      <CareerAnalyzer 
        profileData={profileData} 
        onBack={handleBackToHome}
        onEditProfile={() => setCurrentView('form')}
        onViewHistory={historyAnalyses.length > 0 ? () => setCurrentView('history') : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar breadcrumbs={[{ label: t('Career Guidance', 'Career Guidance') }]} />
      <div className="flex-1">
        {/* Floating history banner */}
        {historyAnalyses.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('You have previous career guidance analyses stored in Supabase.', 'You have previous career guidance analyses stored in Supabase.')}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentView('history')}
                className="text-xs rounded-xl bg-white dark:bg-slate-900 h-8"
              >
                {t('View Previous Analyses', 'View Previous Analyses')} ({historyAnalyses.length})
              </Button>
            </div>
          </div>
        )}
        <HeroSection onStartChat={handleStartChat} />
      </div>
    </div>
  );
};
export default CareerGuidePage;