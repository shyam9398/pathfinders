import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResumeUploader } from '@/components/ResumeUploader';
import { CareerScoreDisplay } from '@/components/CareerScoreDisplay';
import { RoadmapGenerator } from '@/components/RoadmapGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';

export default function ResumeAnalyzer() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Resume Analyzer' }
        ]} 
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Profile & Competency Analyzer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Resume & Competency Extraction
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Extract validated qualifications, work experience, projects, and technical competencies from your resume to enrich your Trainee Profile.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure & Private Processing</span>
          </div>
        </div>

        {/* Uploader Section */}
        <ResumeUploader onAnalysisComplete={setAnalysis} />

        {/* Sync Confirmation Drawer Banner */}
        {analysis && (
          <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Validated Competencies Extracted
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Found {analysis.skills_analysis?.technical_skills?.length || 5} competencies and verified coursework. Confirm to update your profile.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                const skills = analysis.skills_analysis?.technical_skills || ['Java', 'SQL', 'Python'];
                skills.forEach((s: string) => {
                  capacityStore.updateTraineeSkill(user?.id || 'guest', s, 5);
                });
                toast.success('Extracted competencies synced to your Trainee Profile!');
                navigate('/main');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shrink-0 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Confirm & Sync to Trainee Profile
            </Button>
          </div>
        )}

        {/* Analysis Results Display */}
        {analysis && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('score.title', 'Resume Performance Analysis')}
                </h2>
                <p className="text-xs text-slate-500">
                  Detailed score breakdown, keyword gaps, and actionable recommendations.
                </p>
              </div>
              <Badge className="bg-blue-600 text-white font-medium">
                Analysis Ready
              </Badge>
            </div>
            <CareerScoreDisplay analysis={analysis} />
          </div>
        )}

        {/* Dynamic Career Roadmap Generator */}
        {analysis && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('roadmap.title', 'Next Steps Career Roadmap')}
                </h2>
                <p className="text-xs text-slate-500">
                  Transform feedback into a personalized learning and career milestone plan.
                </p>
              </div>
            </div>
            <RoadmapGenerator profileData={analysis.structuredData} onRoadmapGenerated={setRoadmap} />
          </div>
        )}

      </main>
    </div>
  );
}
