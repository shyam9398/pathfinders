import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FileText, 
  TrendingUp, 
  Heart, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Award, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  GraduationCap,
  Users,
  AlertTriangle,
  PlayCircle,
  ShieldCheck,
  ChevronRight,
  Plus,
  Rocket
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { Course, CourseEnrollment, TrainerProfile, CompetencyItem } from '@/types/capacityConnect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TrainerSkillGapMatchmaker from '@/components/TrainerSkillGapMatchmaker';

export default function MainDashboard() {
  const { user, role, setRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Load trainee profile and capacity data from capacityStore
  const [traineeProfile, setTraineeProfile] = useState(() => 
    capacityStore.getTraineeProfile(user?.id || 'guest')
  );
  const [courses, setCourses] = useState<Course[]>(() => capacityStore.getCourses());
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>(() => 
    capacityStore.getEnrollments(user?.id || 'guest')
  );
  const [trainers, setTrainers] = useState<TrainerProfile[]>(() => capacityStore.getTrainers());
  const [announcements, setAnnouncements] = useState(() => capacityStore.getAnnouncements());

  useEffect(() => {
    const handleProfileChange = () => {
      setTraineeProfile(capacityStore.getTraineeProfile(user?.id || 'guest'));
    };
    const handleEnrollmentChange = () => {
      setEnrollments(capacityStore.getEnrollments(user?.id || 'guest'));
    };
    window.addEventListener('capacity_connect_profile_changed', handleProfileChange);
    window.addEventListener('capacity_connect_enrollments_changed', handleEnrollmentChange);
    return () => {
      window.removeEventListener('capacity_connect_profile_changed', handleProfileChange);
      window.removeEventListener('capacity_connect_enrollments_changed', handleEnrollmentChange);
    };
  }, [user]);

  // Compute Skill Gaps & Competencies using the Competency Engine
  const gapData = useMemo(() => {
    return capacityStore.calculateCompetencyGaps(traineeProfile.skills, 'Software Engineer');
  }, [traineeProfile.skills]);

  // Enrolled Courses with Course details
  const activeEnrolledCourses = useMemo(() => {
    return enrollments.map(en => {
      const c = courses.find(item => item.id === en.courseId);
      return {
        enrollment: en,
        course: c
      };
    }).filter(item => item.course !== undefined);
  }, [enrollments, courses]);

  // Recommended Courses (closing active gaps)
  const recommendedCourses = useMemo(() => {
    const topGapSkills = gapData.topGaps.slice(0, 3).map(g => g.name.toLowerCase());
    return courses.filter(c => 
      !enrollments.some(e => e.courseId === c.id) &&
      (c.requiredCompetencies.some(rc => topGapSkills.includes(rc.name.toLowerCase())) ||
       topGapSkills.some(skill => c.subject.toLowerCase().includes(skill)))
    ).slice(0, 3);
  }, [courses, enrollments, gapData]);

  // Interactive skill gap selection for live trainer reflection
  const [selectedGapSkill, setSelectedGapSkill] = useState<string>('');
  const activeGapSkill = selectedGapSkill || gapData.topGaps[0]?.name || 'Data Structures';

  // Matched Trainers dynamically reflected for the chosen skill gap
  const matchedTrainers = useMemo(() => {
    return capacityStore.matchTrainersForSkillGap(activeGapSkill).slice(0, 3);
  }, [activeGapSkill]);

  // Matchmaker Modal state
  const [matchmakerOpen, setMatchmakerOpen] = useState(false);

  // Four Core AI Features requested by user
  const fourCoreFeatures = [
    {
      id: 'career-guide',
      title: t('main.careerGuide', 'Career Guidance'),
      desc: t('main.careerGuideDesc', 'Get adaptive career recommendations based on your performance.'),
      icon: Brain,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      accentCorner: 'from-emerald-500/20',
      path: '/career-guide'
    },
    {
      id: 'resume-analyzer',
      title: t('main.resumeAnalyzer', 'Resume Analyzer'),
      desc: t('main.resumeAnalyzerDesc', 'Analyze and improve your resume with AI-powered ATS feedback.'),
      icon: FileText,
      iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      accentCorner: 'from-sky-500/20',
      path: '/resume-analyzer'
    },
    {
      id: 'career-growth',
      title: t('main.careerGrowthPath', 'Career Growth Path'),
      desc: t('main.careerGrowthDesc', 'Track your daily learning, complete modules, and earn streak badges.'),
      icon: Rocket,
      iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      accentCorner: 'from-indigo-500/20',
      path: '/career-growth'
    },
    {
      id: 'career-health',
      title: t('main.careerHealth', 'Career Health Score'),
      desc: t('main.careerHealthDesc', 'Visualize your career performance and growth analytics.'),
      icon: Heart,
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      accentCorner: 'from-rose-500/20',
      path: '/career-health'
    }
  ];

  const platformMetrics = [
    { value: '95%', label: t('main.successRate', 'Success Rate') },
    { value: '10K+', label: t('main.studentsGuided', 'Students Guided') },
    { value: '500+', label: t('main.careerPaths', 'Career Paths') }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Trainee Hub' }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 1. HEADER & PROFILE COMPLETION BANNER */}
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Personalized Capacity-Building Track</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.name || traineeProfile.name}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Continue developing your core competencies and target the high-priority skill gaps below.
              </p>
            </div>

            {/* Profile Completion Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 w-full md:w-80">
              <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-700 dark:text-slate-200">Profile & Qualifications</span>
                <span className="text-blue-600">85% Complete</span>
              </div>
              <Progress value={85} className="h-2 bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Degree & 5 skills verified</span>
                <Link to="/career-guide" className="font-semibold text-blue-600 hover:underline">
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. TOP PRIMARY: FOUR CORE AI CAREER FEATURES (MOVED TO TOP PER USER REQUEST) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Core AI Features & Tools
              </h2>
              <p className="text-xs text-slate-500">
                Explore dedicated AI modules tailored to your career milestones and skill gaps.
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold py-0.5">
              4 AI Modules
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fourCoreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="group relative bg-[#131b2e] dark:bg-[#0f172a] text-white p-5 rounded-2xl border border-slate-700/60 shadow-md hover:border-blue-500/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${item.accentCorner} via-transparent to-transparent rounded-full blur-lg pointer-events-none`} />

                  <div className="space-y-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800">
                    <div className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 group-hover:text-white border border-slate-700/60 text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                      <span>{t('main.explore', 'Explore')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* THREE PLATFORM METRICS BOXES */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {platformMetrics.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-[#131b2e] dark:bg-[#0f172a] text-center p-3.5 rounded-2xl border border-slate-700/60 shadow-xs"
              >
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. THREE-PILLAR KPI SUMMARY: Overall Competency, Active Learning, Target Match */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Overall Competency */}
          <Card className="glass-card p-5 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Verified Competency</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Active</Badge>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
                {traineeProfile.overallCompetencyScore}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Measured across technical acumen, domain knowledge, and problem-solving benchmarks.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Role:</span>
              <strong className="text-slate-700 dark:text-slate-300">Software Engineer</strong>
            </div>
          </Card>

          {/* Enrolled Courses */}
          <Card className="glass-card p-5 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Enrolled Courses</span>
                <span className="text-xs text-blue-600 font-bold">{activeEnrolledCourses.length} in progress</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mt-2">
                {activeEnrolledCourses.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active learning modules, video lectures, and practical assignments.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Hours Logged:</span>
              <strong className="text-slate-700 dark:text-slate-300">18.5 hrs</strong>
            </div>
          </Card>

          {/* Skill Gaps Identified */}
          <Card className="glass-card p-5 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Identified Skill Gaps</span>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">{gapData.topGaps.length} Gaps</Badge>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-600 mt-2">
                {gapData.topGaps.length}
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                Click a gap below to reflect matching trainers:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {gapData.topGaps.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGapSkill(g.name)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      activeGapSkill.toLowerCase() === g.name.toLowerCase()
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                  >
                    {g.name} (-{g.gap}%)
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
              <Link to="/skill-gaps" className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-between">
                <span>View Full Remediation Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </section>

        {/* 3. MY LEARNING & ACTIVE ENROLLED COURSES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              My Learning (Enrolled Courses)
            </h2>
            <Link to="/courses" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>Browse Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeEnrolledCourses.length === 0 ? (
            <Card className="glass-card p-8 text-center border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">You have not enrolled in any courses yet.</p>
              <Button onClick={() => navigate('/courses')} className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white">
                Explore Recommended Courses
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEnrolledCourses.map(({ enrollment, course }) => (
                <Card 
                  key={enrollment.id}
                  className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 mb-1">
                          {course?.subject}
                        </Badge>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {course?.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Instructor: <strong>{course?.trainerName}</strong></p>
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold shrink-0">
                        {enrollment.progressPercent}% Complete
                      </Badge>
                    </div>

                    <Progress value={enrollment.progressPercent} className="h-2 bg-slate-100 dark:bg-slate-800" />

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{enrollment.completedModuleIds.length} of {course?.modules.length || 3} modules finished</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {course?.duration}
                      </span>
                    </div>
                  </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Next: Advanced OOP & Memory Safety</span>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/courses/${course?.id}/learn`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3.5 text-xs font-semibold shadow-2xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1" />
                      {t('Continue Learning', 'Continue Learning')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 4. HIGH-RELEVANCE RECOMMENDED COURSES & SUITABLE TRAINERS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recommended Courses (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                {t('Recommended For Your Skill Gaps', 'Recommended For Your Skill Gaps')}
              </h2>
              <span className="text-xs text-slate-500 font-medium">{t('Auto-matched by Competency Engine', 'Auto-matched by Competency Engine')}</span>
            </div>

            <div className="space-y-3">
              {recommendedCourses.map(course => (
                <div 
                  key={course.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {t('Closes', 'Closes')} {course.subject} {t('Gap', 'Gap')}
                      </Badge>
                      <span className="text-[11px] text-slate-400">• {course.duration}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        capacityStore.enrollInCourse(user?.id || 'guest', course.id);
                        navigate(`/courses/${course.id}/learn`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-8.5 px-4 shadow-2xs"
                    >
                      {t('Enroll Now', 'Enroll Now')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Trainers for Gaps (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  {t('Suitable Trainers', 'Suitable Trainers')}
                </h2>
                <p className="text-[11px] text-slate-400">{t('Reflecting certified mentors for your identified gap', 'Reflecting certified mentors for your identified gap')}</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200 shrink-0 font-bold">
                {activeGapSkill}
              </Badge>
            </div>

            {/* Quick Gap Selector Chips for Live Trainer Reflection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {gapData.topGaps.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGapSkill(g.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeGapSkill.toLowerCase() === g.name.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {matchedTrainers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {t('No direct trainer match for', 'No direct trainer match for')} {activeGapSkill}.
                </div>
              ) : (
                matchedTrainers.map(({ trainer, matchScore, matchReasons }) => (
                  <div 
                    key={trainer.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-2.5 transition-all hover:border-blue-300 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm shrink-0">
                        {trainer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{trainer.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{trainer.qualification}</p>
                      </div>
                      <Badge className="ml-auto bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold shrink-0">
                        {matchScore}% {t('Match', 'Match')}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {matchReasons[0] || trainer.bio}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{t('Rating', 'Rating')}: ★ {trainer.rating}/5.0</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => setMatchmakerOpen(true)}
                          className="h-8.5 px-3.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-2xs"
                        >
                          {t('Book 1:1', 'Book 1:1')}
                        </Button>
                        <Link to="/courses" className="text-blue-600 font-bold hover:underline text-xs">
                          {t('Courses', 'Courses')} ({trainer.coursesCount})
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <Button
                variant="outline"
                onClick={() => setMatchmakerOpen(true)}
                className="w-full text-xs font-bold text-blue-600 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl h-10 shadow-xs"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                {t('Open AI Trainer Matchmaker', 'Open AI Trainer Matchmaker')}
              </Button>
            </div>
          </div>

        </section>

      </main>

      {/* Full Interactive Trainer Matchmaker Modal */}
      <Dialog open={matchmakerOpen} onOpenChange={setMatchmakerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              AI Trainer Matchmaker & 1-on-1 Remediation Scheduler
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Matched in real-time according to your verified competency gaps, industry certifications, and learning goals.
            </DialogDescription>
          </DialogHeader>

          <TrainerSkillGapMatchmaker initialSkillGap={activeGapSkill} />
        </DialogContent>
      </Dialog>

    </div>
  );
}
