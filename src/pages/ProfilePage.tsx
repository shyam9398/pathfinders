import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navigation/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Globe, 
  FileText, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import { capacityStore } from '@/services/capacityStore';

export default function ProfilePage() {
  const { user, role } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [langModalOpen, setLangModalOpen] = useState(false);

  const currentUserId = user?.id || 'guest';
  const defaultTrainee = capacityStore.getTraineeProfile(currentUserId);

  const [trainee] = useState(() => {
    const savedCareer = localStorage.getItem(`pf_target_career_${currentUserId}`);
    const savedSkills = localStorage.getItem('pf_user_skills');
    const savedHealth = localStorage.getItem(`pf_career_health_score_${currentUserId}`);

    const skillsList = savedSkills 
      ? savedSkills.split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean).map(s => ({ name: s, level: 88 }))
      : defaultTrainee.skills;

    return {
      ...defaultTrainee,
      targetRole: savedCareer || defaultTrainee.currentRole || 'Software Engineer',
      enrolledCourses: capacityStore.getEnrollments(currentUserId) || [],
      completedAssessments: capacityStore.getAttempts(currentUserId) || [],
      careerHealthScore: savedHealth ? parseInt(savedHealth, 10) : 88,
      skills: skillsList && skillsList.length > 0 ? skillsList : (defaultTrainee.skills || [])
    };
  });

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: t('User Profile', 'User Profile') }
        ]} 
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Banner */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute top-4 right-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setLangModalOpen(true)}
                className="bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white text-xs font-bold rounded-xl h-8 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 mr-1 text-blue-600" />
                {t('Change Language', 'Change Language')} ({language.toUpperCase()})
              </Button>
            </div>
          </div>
          
          <CardContent className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                  {(user?.name || 'T')[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {user?.name || 'Pavan Kumar'}
                    </h1>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs capitalize">
                      {role}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user?.email || 'trainee@pathfinders.org'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/resume-analyzer')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {t('Upload / Re-analyze Resume', 'Upload / Re-analyze Resume')}
                </Button>
              </div>
            </div>

            {/* Profile Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Target Career', 'Target Career')}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                  {trainee.targetRole || 'Software Engineer'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Enrolled Courses', 'Enrolled Courses')}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {(trainee.enrolledCourses || []).length} {t('Active', 'Active')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Completed Assessments', 'Completed Assessments')}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {(trainee.completedAssessments || []).length} {t('Cleared', 'Cleared')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Career Health', 'Career Health')}
                </span>
                <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                  {trainee.careerHealthScore}% {t('Optimal', 'Optimal')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competencies Snapshot */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Verified Skills & Competencies', 'Verified Skills & Competencies')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('Extracted from validated resume parsing and course module diagnostics.', 'Extracted from validated resume parsing and course module diagnostics.')}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/skill-gaps')}
              className="text-xs rounded-xl h-8"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {t('View Skill Gaps', 'View Skill Gaps')}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(trainee.skills || []).map((s, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded-md">
                  {s.level}%
                </span>
              </div>
            ))}
          </div>
        </Card>

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
