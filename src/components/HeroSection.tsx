import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, Target, Users, Zap, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import heroImage from '@/assets/hero-career-guide.jpg';

interface HeroSectionProps {
  onStartChat: () => void;
}

export const HeroSection = ({ onStartChat }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Career Guide' }
        ]}
      />

      {/* Hero Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personalized Assessment & Matching</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {t('careerGuide.discoverPath', 'Discover Your')} <span className="text-blue-600 dark:text-blue-400">{t('careerGuide.perfectCareer', 'Ideal Career')}</span> {t('careerGuide.path', 'Path')}.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('careerGuide.heroDescription', 'Answer a few guided questions about your skills, education, and passions to receive personalized career paths and roadmaps.')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button 
                size="lg" 
                onClick={onStartChat}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-sm text-sm"
              >
                <span>{t('careerGuide.startJourney', 'Begin Career Assessment')}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/resume-analyzer')}
                className="w-full sm:w-auto border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium px-6 py-3.5 rounded-xl shadow-2xs text-sm"
              >
                <span>Scan Resume First</span>
              </Button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Takes less than 3 minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Market Match</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Roadmap integration</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-3xl blur-2xl -z-10" />
              <Card className="glass-card overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-lg rounded-2xl">
                <img 
                  src={heroImage} 
                  alt="Career Guide Navigator" 
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <CardContent className="p-6 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Intelligent Role Recommendations
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Evaluates academic focus, technical skills, certifications, and work preferences against 500+ modern industry roles.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 pt-16">
          <Card className="glass-card p-6 shadow-xs border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t('careerGuide.personalizedGuidance', 'Personalized Guidance')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('careerGuide.personalizedGuidanceDesc', 'Get tailored career recommendations based on your unique skills, interests, and goals.')}
            </p>
          </Card>

          <Card className="glass-card p-6 shadow-xs border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t('careerGuide.aiPoweredInsights', 'AI-Powered Insights')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('careerGuide.aiPoweredInsightsDesc', 'Advanced AI analyzes current hiring trends and provides real-time skill requirement gap insights.')}
            </p>
          </Card>

          <Card className="glass-card p-6 shadow-xs border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t('careerGuide.communitySupport', 'Actionable Roadmaps')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('careerGuide.communitySupportDesc', 'Directly generate step-by-step milestones to prepare for interviews and internships.')}
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
};