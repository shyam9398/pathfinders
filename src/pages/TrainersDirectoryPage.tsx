import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navigation/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Sparkles, 
  Star, 
  GraduationCap, 
  Award, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen,
  Filter,
  MessageSquare
} from 'lucide-react';
import { capacityStore } from '@/services/capacityStore';
import { TrainerProfile } from '@/types/capacityConnect';
import TrainerSkillGapMatchmaker from '@/components/TrainerSkillGapMatchmaker';
import TrainerMessageModal from '@/components/TrainerMessageModal';

export default function TrainersDirectoryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [trainers] = useState<TrainerProfile[]>(() => capacityStore.getTrainers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedSkillGap, setSelectedSkillGap] = useState('Data Structures');
  const [matchmakerOpen, setMatchmakerOpen] = useState(false);
  const [activeMessageTrainer, setActiveMessageTrainer] = useState<TrainerProfile | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  // Extract all unique subjects
  const allSubjects = useMemo(() => {
    const subs = new Set<string>();
    trainers.forEach(tr => tr.subjects.forEach(s => subs.add(s)));
    return ['All', ...Array.from(subs)];
  }, [trainers]);

  // Filtered trainers
  const filteredTrainers = useMemo(() => {
    return trainers.filter(tr => {
      const matchSubject = selectedSubject === 'All' || tr.subjects.includes(selectedSubject);
      const matchSearch = searchQuery === '' || 
        tr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.competencies.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSubject && matchSearch;
    });
  }, [trainers, selectedSubject, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: t('Accredited Trainers', 'Accredited Trainers') }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('Certified Mentorship & Capacity Building', 'Certified Mentorship & Capacity Building')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('Accredited Trainer Faculty & Matching', 'Accredited Trainer Faculty & Matching')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {t('Connect with accredited industry leaders, request 1:1 mentorship sessions, and bridge verified competency gaps.', 'Connect with accredited industry leaders, request 1:1 mentorship sessions, and bridge verified competency gaps.')}
            </p>
          </div>

          <Button
            onClick={() => setMatchmakerOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-4 shrink-0 shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            {t('Match Trainer for My Skill Gaps', 'Match Trainer for My Skill Gaps')}
          </Button>
        </div>

        {/* Search & Subject Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <Input 
              placeholder={t('Search by trainer name, skill, or expertise...', 'Search by trainer name, skill, or expertise...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs rounded-xl h-8.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {allSubjects.slice(0, 5).map(sub => (
              <Button
                key={sub}
                variant={selectedSubject === sub ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(sub)}
                className={`text-xs rounded-xl h-8 px-3 shrink-0 ${selectedSubject === sub ? 'bg-blue-600 text-white font-bold' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {t(sub, sub)}
              </Button>
            ))}
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrainers.map((tr) => (
            <Card 
              key={tr.id}
              className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all shadow-xs flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                {/* Trainer Avatar & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={tr.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt={tr.name} 
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {tr.name}
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                        {tr.qualification}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>{tr.yearsOfExperience} {t('Years Industry Experience', 'Years Industry Experience')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 text-amber-700 dark:text-amber-300 font-bold text-xs shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{tr.rating}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {tr.bio}
                </p>

                {/* Subjects Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    {t('Specialized Subjects', 'Specialized Subjects')}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tr.subjects.map((sub, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {t(sub, sub)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Competencies */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    {t('Verified Competencies', 'Verified Competencies')}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tr.competencies.slice(0, 4).map((c, idx) => (
                      <Badge key={idx} variant="outline" className="text-[9px] border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                        {c.name} ({c.proficiency}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              {/* Action Buttons: Message Trainer & Request Mentorship */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveMessageTrainer(tr);
                    setMessageModalOpen(true);
                  }}
                  className="rounded-xl text-xs font-semibold h-8.5 px-3 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 gap-1.5 flex-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  {t('Message', 'Message')}
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedSkillGap(tr.subjects[0] || 'Java');
                    setMatchmakerOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-8.5 px-3 shadow-xs gap-1.5 flex-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {t('Mentorship', 'Mentorship')}
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </main>

      {/* Trainer Skill Gap Matchmaker Modal */}
      <TrainerSkillGapMatchmaker
        open={matchmakerOpen}
        onOpenChange={setMatchmakerOpen}
        skillGap={selectedSkillGap}
      />

      {/* Direct Trainer Messaging Modal */}
      <TrainerMessageModal
        trainer={activeMessageTrainer}
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
      />
    </div>
  );
}
