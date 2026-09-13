import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { useAuth } from '@/contexts/AuthContext';
import TrainerSkillGapMatchmaker from '@/components/TrainerSkillGapMatchmaker';

export default function SkillGapAnalysisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const traineeProfile = useMemo(() => 
    capacityStore.getTraineeProfile(user?.id || 'guest'),
    [user]
  );

  const gapData = useMemo(() => 
    capacityStore.calculateCompetencyGaps(traineeProfile.skills, 'Software Engineer'),
    [traineeProfile.skills]
  );

  const matchedSkills = gapData.competencyList.filter(c => c.gap === 0);
  const gapSkills = gapData.competencyList.filter(c => c.gap > 0);

  // Live selected skill gap for dynamic trainer reflection
  const [selectedGapSkill, setSelectedGapSkill] = useState<string>('');
  const activeGapSkill = selectedGapSkill || gapSkills[0]?.name || 'Data Structures';
  const matchedTrainers = useMemo(() => {
    return capacityStore.matchTrainersForSkillGap(activeGapSkill);
  }, [activeGapSkill]);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Skill Gaps & Competency Engine' }
        ]} 
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <Brain className="w-3.5 h-3.5 text-blue-600" />
                Competency Diagnostics
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Skill Gap & Competency Mapping
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Understand what you already know and pinpoint precise learning requirements for your target career role.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 w-full md:w-64 text-right">
              <span className="text-xs text-slate-500 font-medium block">Overall Skill Coverage</span>
              <span className="text-3xl font-black text-blue-600">{gapData.overallMatchPercent}%</span>
              <Progress value={gapData.overallMatchPercent} className="h-2 bg-slate-200 dark:bg-slate-700 mt-2" />
            </div>
          </div>
        </div>

        {/* 3 Clean Summaries: Your Skills, Target Competencies, Skill Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Your Skills */}
          <Card className="glass-card p-5 border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Your Verified Skills
              </h3>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                {traineeProfile.skills.length} Validated
              </Badge>
            </div>
            <div className="space-y-2">
              {traineeProfile.skills.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">✓ {s.name}</span>
                  <span className="font-bold text-emerald-600">{s.level}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Required Competencies */}
          <Card className="glass-card p-5 border-blue-200/80 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                Required Competencies
              </h3>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px]">
                Software Engineer
              </Badge>
            </div>
            <div className="space-y-2">
              {gapData.competencyList.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60">
                  <span className="text-slate-700 dark:text-slate-300">{c.name}</span>
                  <span className="font-medium text-slate-500">Req: {c.requiredLevel}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill Gaps (To Learn) */}
          <Card className="glass-card p-5 border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Active Skill Gaps
              </h3>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                {gapSkills.length} Identified
              </Badge>
            </div>
            <div className="space-y-2">
              {gapSkills.map((c, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedGapSkill(c.name)}
                  className={`flex items-center justify-between text-xs p-2.5 rounded-xl border cursor-pointer transition-all ${
                    activeGapSkill.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/60 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">⚠ {c.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`text-[10px] ${c.priority === 'High' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                      -{c.gap}% Gap
                    </Badge>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Interactive Trainer Matching Engine according to Trainee Skill Gap */}
        <section>
          <TrainerSkillGapMatchmaker initialSkillGap={activeGapSkill} />
        </section>

        {/* Detailed Competency Breakdown Table */}
        <Card className="glass-card p-6 border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Detailed Competency & Learning Matrix
              </h2>
              <p className="text-xs text-slate-500">Each gap connects directly to an accredited course and qualified trainer.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Competency</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Current</th>
                  <th className="pb-3 px-4">Benchmark</th>
                  <th className="pb-3 px-4">Priority</th>
                  <th className="pb-3 px-4">Suitable Trainer</th>
                  <th className="pb-3 pl-4 text-right">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gapData.competencyList.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">
                      {comp.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{comp.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {comp.currentLevel}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{comp.requiredLevel}%</td>
                    <td className="py-3.5 px-4">
                      {comp.gap === 0 ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          Satisfied
                        </Badge>
                      ) : comp.priority === 'High' ? (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                          High Priority
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          Medium
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {comp.suitableTrainerName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {comp.suitableTrainerName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Auto-Assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      {comp.gap === 0 ? (
                        <span className="text-emerald-600 font-semibold text-xs">✓ Validated</span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (comp.recommendedCourseId) {
                              navigate(`/courses/${comp.recommendedCourseId}/learn`);
                            } else {
                              navigate('/courses');
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-7 px-3 text-[11px] font-semibold"
                        >
                          <span>Close Gap</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </main>
    </div>
  );
}
