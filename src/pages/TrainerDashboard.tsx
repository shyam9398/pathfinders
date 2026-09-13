import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Users, 
  BookOpen, 
  Plus, 
  CheckSquare, 
  FolderGit2, 
  Star, 
  TrendingUp, 
  Clock, 
  PlayCircle,
  FileText,
  Upload,
  MessageSquare,
  Award,
  Sparkles,
  Calendar,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  Radio,
  Layers,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Course, TrainerResource, MentorshipSession, SkillGapDemand, TrainerWorkshop } from '@/types/capacityConnect';
import { toast } from 'sonner';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Current trainer identity (defaults to trainer-2: Priya Narayanan or logged in user)
  const trainerId = user?.id?.startsWith('trainer') ? user.id : 'trainer-2';
  const trainerName = user?.name || 'Priya Narayanan';

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve active tab from URL path or search parameter
  type TrainerTab = 'radar' | 'sessions' | 'courses' | 'resources' | 'clinic' | 'capstones' | 'analytics';

  const resolveTab = (): TrainerTab => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['radar', 'sessions', 'courses', 'resources', 'clinic', 'capstones', 'analytics'].includes(tabParam)) {
      return tabParam as TrainerTab;
    }
    const path = location.pathname.toLowerCase();
    if (path.includes('/courses')) return 'courses';
    if (path.includes('/library') || path.includes('/resources')) return 'resources';
    if (path.includes('/trainees') || path.includes('/sessions')) return 'sessions';
    if (path.includes('/clinic') || path.includes('/doubts')) return 'clinic';
    if (path.includes('/capstones') || path.includes('/projects')) return 'capstones';
    if (path.includes('/analytics') || path.includes('/certificates') || path.includes('/feedback') || path.includes('/assessments')) return 'analytics';
    if (path.includes('/radar')) return 'radar';
    return 'radar';
  };

  // Navigation tabs within Trainer Dashboard
  const [activeTab, setActiveTab] = useState<TrainerTab>(resolveTab);

  useEffect(() => {
    setActiveTab(resolveTab());
  }, [location.pathname, searchParams]);

  const handleTabClick = (tab: TrainerTab) => {
    setActiveTab(tab);
    navigate(`/trainer/${tab === 'radar' ? '' : tab}`);
  };

  // Core Data Stores
  const [courses, setCourses] = useState<Course[]>(() => capacityStore.getCourses());
  const [resources, setResources] = useState<TrainerResource[]>(() => capacityStore.getTrainerResources(trainerId));
  const [feedbackList] = useState(() => capacityStore.getFeedback());
  const [sessions, setSessions] = useState<MentorshipSession[]>(() => capacityStore.getMentorshipSessions(trainerId));
  const [gapDemands, setGapDemands] = useState<SkillGapDemand[]>(() => capacityStore.getSkillGapDemands());
  const [workshops, setWorkshops] = useState<TrainerWorkshop[]>(() => capacityStore.getWorkshops());

  // New Course Modal State
  const [newCourseOpen, setNewCourseOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubject, setNewCourseSubject] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseDifficulty, setNewCourseDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newCourseDuration, setNewCourseDuration] = useState('6 weeks (24 hours)');

  // New Resource Modal State with Google Drive Link
  const [newResourceOpen, setNewResourceOpen] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResSubject, setNewResSubject] = useState('');
  const [newResType, setNewResType] = useState<TrainerResource['type']>('pdf');
  const [newResDriveUrl, setNewResDriveUrl] = useState('');

  // Live Student Rapid Doubt Clinic Queue (Unique student-benefiting trainer feature)
  const [doubtQueue, setDoubtQueue] = useState([
    {
      id: 'd-1',
      studentName: 'Aarav Sharma',
      academicYear: '3rd Year B.Tech',
      topic: 'Binary Search Tree Balancing',
      urgency: 'High',
      question: 'Getting segmentation fault during left-rotation in AVL tree balancing. Need 5-min live trace.',
      postedTime: '8 mins ago',
      status: 'pending'
    },
    {
      id: 'd-2',
      studentName: 'Sneha Patel',
      academicYear: '2nd Year IT',
      topic: 'SQL Subquery Join Cardinality',
      urgency: 'Standard',
      question: 'How to avoid N+1 query execution bottleneck when fetching author with their top 3 books?',
      postedTime: '15 mins ago',
      status: 'pending'
    },
    {
      id: 'd-3',
      studentName: 'Rahul Verma',
      academicYear: 'Final Year CSE',
      topic: 'Docker Microservice Networking',
      urgency: 'High',
      question: 'Containers cannot ping each other on custom bridge network across Docker Compose services.',
      postedTime: '24 mins ago',
      status: 'pending'
    }
  ]);

  // Capstone & Project Submissions for review (Unique student-benefiting trainer feature)
  const [capstoneReviews, setCapstoneReviews] = useState([
    {
      id: 'rev-1',
      studentName: 'Ananya Roy',
      projectTitle: 'Distributed Task Queue in Python & Redis',
      submittedAt: 'Today, 2:15 PM',
      githubUrl: 'https://github.com/student/distributed-task-queue',
      demoUrl: 'https://task-queue-demo.vercel.app',
      status: 'pending_review',
      score: null as number | null,
      skillsTargeted: ['Python', 'Redis', 'Docker']
    },
    {
      id: 'rev-2',
      studentName: 'Vikram Singh',
      projectTitle: 'Full-Stack E-Commerce API with JWT & Stripe',
      submittedAt: 'Yesterday',
      githubUrl: 'https://github.com/student/ecommerce-fastapi',
      demoUrl: 'https://api-stripe.onrender.com',
      status: 'approved',
      score: 95,
      skillsTargeted: ['REST APIs', 'SQL', 'Security']
    }
  ]);

  // Launch Workshop Modal State (from Skill Gap Demand)
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<SkillGapDemand | null>(null);
  const [workshopTitle, setWorkshopTitle] = useState('');
  const [workshopDate, setWorkshopDate] = useState('Tomorrow, 4:00 PM IST');
  const [workshopMaxCapacity, setWorkshopMaxCapacity] = useState(30);

  // Search & Filter state for resources
  const [resourceFilter, setResourceFilter] = useState('all');
  const [resourceSearch, setResourceSearch] = useState('');

  // Handle Session Status Updates
  const handleSessionAction = (sessionId: string, newStatus: MentorshipSession['status']) => {
    capacityStore.updateMentorshipStatus(sessionId, newStatus);
    setSessions(capacityStore.getMentorshipSessions(trainerId));
    if (newStatus === 'confirmed') {
      toast.success('Session confirmed! Meeting link sent to trainee.');
    } else if (newStatus === 'completed') {
      toast.success('Session marked completed. Trainee competency score updated.');
    } else if (newStatus === 'cancelled') {
      toast.info('Session cancelled.');
    }
  };

  // Handle Create Course
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const created: Course = {
      id: `course-${Date.now()}`,
      title: newCourseTitle,
      description: newCourseDesc || 'Hands-on curriculum engineered to eliminate skill gaps through practical milestones.',
      category: 'Technology',
      subject: newCourseSubject || 'Software Architecture',
      difficulty: newCourseDifficulty,
      duration: newCourseDuration,
      trainerId: trainerId,
      trainerName: trainerName,
      trainerExperience: '8+ years industry experience',
      rating: 5.0,
      enrolledCount: 0,
      requiredCompetencies: [{ name: newCourseSubject || 'Core Concepts', minLevel: 50 }],
      learningOutcomes: ['Design scalable architectures', 'Solve real-world engineering bottlenecks'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: 'Module 1: Foundations & Architecture Design',
          description: 'Overview of fundamental paradigms and tool setups.',
          durationMinutes: 45
        },
        {
          id: `mod-${Date.now()}-2`,
          title: 'Module 2: Practical Lab & Skill Gap Remediation',
          description: 'Hands-on interactive lab resolving common pitfalls.',
          durationMinutes: 60
        }
      ]
    };

    capacityStore.addCourse(created);
    setCourses(capacityStore.getCourses());
    setNewCourseOpen(false);
    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseSubject('');
    toast.success('Course published to Trainee Catalog!');
  };

  // Handle Upload Resource
  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;

    const res: TrainerResource = {
      id: `res-${Date.now()}`,
      trainerId: trainerId,
      title: newResTitle,
      type: newResType,
      fileUrl: newResDriveUrl.trim() || 'https://capacityconnect.edu/uploads/sample-resource.pdf',
      driveUrl: newResDriveUrl.trim() || undefined,
      fileSizeMb: parseFloat((Math.random() * 5 + 1.2).toFixed(1)),
      subject: newResSubject || 'Enterprise Engineering',
      uploadedAt: new Date().toISOString()
    };

    capacityStore.addTrainerResource(res);
    setResources(capacityStore.getTrainerResources(trainerId));
    setNewResourceOpen(false);
    setNewResTitle('');
    setNewResSubject('');
    setNewResDriveUrl('');
    toast.success('Resource published to Trainer Library!');
  };

  // Launch Live Skill Gap Workshop
  const handleLaunchWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopTitle.trim()) return;

    const newWs = capacityStore.createWorkshop({
      trainerId,
      trainerName,
      skillName: selectedDemand?.skillName || 'Data Structures',
      title: workshopTitle,
      scheduledAt: workshopDate,
      durationMinutes: 60,
      enrolledTraineesCount: 1,
      maxCapacity: workshopMaxCapacity,
      status: 'scheduled'
    });

    setWorkshops(capacityStore.getWorkshops());
    setWorkshopModalOpen(false);
    toast.success(`Live Workshop announced! ${selectedDemand?.traineeCount || 20} trainees notified.`);
  };

  const openWorkshopLauncher = (demand: SkillGapDemand) => {
    setSelectedDemand(demand);
    setWorkshopTitle(`Remediation Lab: Mastering ${demand.skillName}`);
    setWorkshopModalOpen(true);
  };

  // Filtered resources
  const filteredResources = resources.filter(res => {
    const matchType = resourceFilter === 'all' || res.type === resourceFilter;
    const matchSearch = !resourceSearch || 
      res.title.toLowerCase().includes(resourceSearch.toLowerCase()) || 
      res.subject.toLowerCase().includes(resourceSearch.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: t('Trainer Command Center', 'Trainer Command Center') }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 1. HERO BANNER: DISTINCTIVE TRAINER INSTRUCTION COMMAND */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-800/60 shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 -mb-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                {t('Live Skill Gap Instruction Hub', 'Live Skill Gap Instruction Hub')}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {t('Welcome', 'Welcome')}, {trainerName}
              </h1>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                {t('Connect directly with trainees struggling with skill gaps, review 1-on-1 mentorship requests, launch remedial workshops, and curate accredited courses.', 'Connect directly with trainees struggling with skill gaps, review 1-on-1 mentorship requests, launch remedial workshops, and curate accredited courses.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={() => setNewCourseOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold h-10 px-4 shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {t('Create Course', 'Create Course')}
              </Button>
              <Button 
                onClick={() => setNewResourceOpen(true)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-bold h-10 px-4 backdrop-blur-md transition-all flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                {t('Upload Material', 'Upload Material')}
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar inside Hero */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
            <div>
              <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Identified Gap Demands', 'Identified Gap Demands')}</span>
              <span className="text-xl font-black text-white mt-0.5 block">{gapDemands.reduce((acc, g) => acc + g.traineeCount, 0)} {t('Trainees', 'Trainees')}</span>
            </div>
            <div>
              <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Active 1:1 Inquiries', 'Active 1:1 Inquiries')}</span>
              <span className="text-xl font-black text-emerald-300 mt-0.5 block">{sessions.filter(s => s.status === 'requested' || s.status === 'confirmed').length} {t('Scheduled', 'Scheduled')}</span>
            </div>
            <div>
              <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Published Courses', 'Published Courses')}</span>
              <span className="text-xl font-black text-white mt-0.5 block">{courses.length} {t('Active', 'Active')}</span>
            </div>
            <div>
              <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Competency Rating', 'Competency Rating')}</span>
              <span className="text-xl font-black text-amber-300 mt-0.5 block">★ 4.9/5.0</span>
            </div>
          </div>
        </div>

        {/* 2. NAVIGATION PILLS: 5 UNIQUE TRAINER WORKFLOWS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <button
            onClick={() => handleTabClick('radar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'radar' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            {t('Skill Gap Radar & Demand', 'Skill Gap Radar & Demand')}
            <Badge className="bg-rose-500 text-white text-[10px] px-1.5 py-0 rounded-full ml-1">Live</Badge>
          </button>

          <button
            onClick={() => handleTabClick('sessions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'sessions' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {t('1:1 Mentorship Sessions', '1:1 Mentorship Sessions')} ({sessions.length})
          </button>

          <button
            onClick={() => handleTabClick('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'courses' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t('Course Studio', 'Course Studio')} ({courses.length})
          </button>

          <button
            onClick={() => handleTabClick('resources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'resources' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            {t('Trainer Library', 'Trainer Library')} ({resources.length})
          </button>

          <button
            onClick={() => handleTabClick('clinic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'clinic' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            {t('Rapid Doubt Clinic', 'Rapid Doubt Clinic')} ({doubtQueue.filter(d => d.status === 'pending').length})
          </button>

          <button
            onClick={() => handleTabClick('capstones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'capstones' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            {t('Capstone & Code Reviews', 'Capstone & Code Reviews')} ({capstoneReviews.length})
          </button>

          <button
            onClick={() => handleTabClick('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {t('Cohort Analytics & Feedback', 'Cohort Analytics & Feedback')}
          </button>
        </div>

        {/* 3. TAB 1: TRAINEE SKILL GAP RADAR & REMEDIAL WORKSHOPS */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  {t('Live Trainee Skill Gap Demand Radar', 'Live Trainee Skill Gap Demand Radar')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('Real-time aggregated gaps diagnosed in trainees. Launch focused remediation workshops or offer 1-on-1 clinics.', 'Real-time aggregated gaps diagnosed in trainees. Launch focused remediation workshops or offer 1-on-1 clinics.')}
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2.5 py-1">
                {t('Updated in real-time', 'Updated in real-time')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gapDemands.map((demand) => (
                <Card 
                  key={demand.skillName} 
                  className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className={`text-[10px] font-bold mb-1.5 ${
                        demand.urgency === 'High' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {demand.urgency} {t('Demand Gap', 'Demand Gap')}
                      </Badge>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {demand.skillName}
                      </h3>
                      <span className="text-xs text-slate-400">{demand.category}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-blue-600 block">{demand.traineeCount}</span>
                      <span className="text-[10px] text-slate-400">{t('Trainees in Gap', 'Trainees in Gap')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <div className="flex justify-between text-slate-500">
                      <span>{t('Avg Current Level', 'Avg Current Level')}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{demand.averageCurrentLevel}%</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>{t('Target Benchmark', 'Target Benchmark')}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{demand.benchmarkLevel}%</span>
                    </div>
                    <Progress value={demand.averageCurrentLevel} className="h-1.5 mt-2 bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      onClick={() => openWorkshopLauncher(demand)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-8.5"
                    >
                      <Video className="w-3.5 h-3.5 mr-1.5" />
                      {t('Host Remedial Workshop', 'Host Remedial Workshop')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Scheduled Workshops Section */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-600" />
                {t('Active & Scheduled Remedial Workshops', 'Active & Scheduled Remedial Workshops')} ({workshops.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workshops.map(ws => (
                  <div 
                    key={ws.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          {ws.skillName}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{ws.scheduledAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ws.title}</h4>
                      <p className="text-[11px] text-slate-500">{ws.enrolledTraineesCount} / {ws.maxCapacity} {t('Seats Reserved', 'Seats Reserved')}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        window.open(ws.meetingUrl || 'https://meet.google.com/sample-remediation-room', '_blank');
                        toast.info('Joining workshop room...');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-8 px-3 shrink-0"
                    >
                      {t('Enter Room', 'Enter Room')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB 2: 1:1 MENTORSHIP SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {t('1-on-1 Skill Remediation Inquiries', '1-on-1 Skill Remediation Inquiries')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('Trainees booking direct office hours based on your verified match with their skill gaps.', 'Trainees booking direct office hours based on your verified match with their skill gaps.')}
                </p>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2.5 py-1">
                {sessions.length} {t('Total Sessions', 'Total Sessions')}
              </Badge>
            </div>

            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  {t('No 1-on-1 mentorship sessions currently booked.', 'No 1-on-1 mentorship sessions currently booked.')}
                </div>
              ) : (
                sessions.map((session) => (
                  <div 
                    key={session.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3 hover:border-blue-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm shrink-0">
                          {session.traineeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {session.traineeName}
                            </h3>
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                              {t('Skill Gap', 'Skill Gap')}: {session.skillGap}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {t('Topic', 'Topic')}: <strong className="text-slate-700 dark:text-slate-300">{session.topic}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs font-bold uppercase tracking-wider ${
                          session.status === 'confirmed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : session.status === 'completed'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : session.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t(session.status, session.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[11px]">{t('Scheduled Date', 'Scheduled Date')}</span>
                        <strong className="text-slate-800 dark:text-slate-200">{session.scheduledDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">{t('Time Slot', 'Time Slot')}</span>
                        <strong className="text-slate-800 dark:text-slate-200">{session.scheduledTime} ({session.durationMinutes} mins)</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">{t('Trainee Notes', 'Trainee Notes')}</span>
                        <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{session.notes || 'No extra notes provided'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      {session.meetingUrl && session.status === 'confirmed' ? (
                        <a 
                          href={session.meetingUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          {t('Join Virtual Meeting Room', 'Join Virtual Meeting Room')}
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">{t('Virtual link generated upon confirmation', 'Virtual link generated upon confirmation')}</span>
                      )}

                      <div className="flex items-center gap-2">
                        {session.status === 'requested' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSessionAction(session.id, 'cancelled')}
                              className="text-xs h-7 rounded-lg text-rose-600 hover:bg-rose-50"
                            >
                              {t('Decline', 'Decline')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSessionAction(session.id, 'confirmed')}
                              className="text-xs h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              {t('Accept Session', 'Accept Session')}
                            </Button>
                          </>
                        )}
                        {session.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleSessionAction(session.id, 'completed')}
                            className="text-xs h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          >
                            <CheckSquare className="w-3.5 h-3.5 mr-1" />
                            {t('Mark Completed', 'Mark Completed')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. TAB 3: COURSE STUDIO */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {t('Course Studio & Curriculum Manager', 'Course Studio & Curriculum Manager')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('Build structured competency courses that auto-map to trainee diagnostic gaps.', 'Build structured competency courses that auto-map to trainee diagnostic gaps.')}
                </p>
              </div>
              <Button 
                onClick={() => setNewCourseOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t('Create New Course', 'Create New Course')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map(course => (
                <div 
                  key={course.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] mb-1.5">
                          {course.subject}
                        </Badge>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{course.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{course.duration} • {course.difficulty}</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold shrink-0">
                        {course.enrolledCount} {t('Enrolled', 'Enrolled')}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{t('Course Modules', 'Course Modules')} ({course.modules.length})</span>
                      <ul className="space-y-1">
                        {course.modules.slice(0, 2).map((m, idx) => (
                          <li key={m.id} className="text-slate-700 dark:text-slate-300 flex items-center justify-between text-[11px]">
                            <span>{idx + 1}. {m.title}</span>
                            <span className="text-slate-400">{m.durationMinutes}m</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t('Rating', 'Rating')}: ★ {course.rating.toFixed(1)}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toast.info(`Viewing live curriculum metrics for "${course.title}"`)}
                      className="text-blue-600 text-xs font-semibold h-7 hover:bg-blue-50"
                    >
                      {t('Manage Syllabus & Analytics →', 'Manage Syllabus & Analytics →')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TAB 4: TRAINER LIBRARY */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-blue-600" />
                  {t('Trainer Resource Library', 'Trainer Resource Library')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('Repository of slide decks, lab handbooks, and recorded lecture modules shared with trainees.', 'Repository of slide decks, lab handbooks, and recorded lecture modules shared with trainees.')}
                </p>
              </div>
              <Button 
                onClick={() => setNewResourceOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-xs"
              >
                <Upload className="w-4 h-4 mr-1.5" />
                {t('Upload New File', 'Upload New File')}
              </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'pdf', 'presentation', 'lecture_video', 'study_material'].map((tType) => (
                  <button
                    key={tType}
                    onClick={() => setResourceFilter(tType)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all uppercase tracking-wider text-[10px] ${
                      resourceFilter === tType
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {t(tType.replace('_', ' '), tType.replace('_', ' '))}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <Input 
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder={t('Search resources...', 'Search resources...')}
                  className="text-xs pl-8 h-8 rounded-xl"
                />
              </div>
            </div>

            {/* Resource List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(res => (
                <div 
                  key={res.id} 
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 hover:border-blue-300 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-mono">
                        {res.type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{res.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{res.subject} • {res.fileSizeMb} MB</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{t('Published', 'Published')} {new Date(res.uploadedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      {res.driveUrl && (
                        <a 
                          href={res.driveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-900 transition-colors"
                        >
                          <span>Drive Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toast.success(`Downloading ${res.title}`)}
                        className="text-blue-600 text-xs font-semibold h-8 px-3 rounded-xl hover:bg-slate-100"
                      >
                        {t('Download', 'Download')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: LIVE RAPID DOUBT CLINIC (STUDENT QUEUE) */}
        {activeTab === 'clinic' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold mb-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live Trainee Doubt Queue
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Rapid Doubt Clearance Clinic
                </h2>
                <p className="text-xs text-slate-500">
                  Accept pending trainee doubts from your enrolled cohorts. Launch 1-click debug calls or post code snippet explanations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-rose-500 text-white font-bold text-xs px-3 py-1">
                  {doubtQueue.filter(d => d.status === 'pending').length} In Waiting Queue
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {doubtQueue.map(doubt => (
                <div 
                  key={doubt.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    doubt.status === 'resolved'
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{doubt.studentName}</span>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                          {doubt.academicYear}
                        </Badge>
                        <Badge className={`text-[10px] font-bold ${
                          doubt.urgency === 'High' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {doubt.urgency} Urgency
                        </Badge>
                        <span className="text-[11px] text-slate-400">&bull; {doubt.postedTime}</span>
                      </div>

                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Topic: {doubt.topic}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{doubt.question}"
                      </p>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      {doubt.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast.success(`Starting 1:1 Live Debug Room with ${doubt.studentName}... Joining audio/video stream!`);
                              setDoubtQueue(prev => prev.map(d => d.id === doubt.id ? { ...d, status: 'in_call' } : d));
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-3.5 shadow-xs flex items-center gap-1.5"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Launch Debug Room
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.success(`Doubt marked resolved. Competency gain credited to ${doubt.studentName}.`);
                              setDoubtQueue(prev => prev.map(d => d.id === doubt.id ? { ...d, status: 'resolved' } : d));
                            }}
                            className="text-xs rounded-xl h-9 border-slate-200 dark:border-slate-700 font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Mark Resolved
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold py-1 px-3">
                          ✓ Resolved & Evaluated
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CAPSTONE & CODE REVIEW ARENA */}
        {activeTab === 'capstones' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Industry Project Evaluation
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Trainee Capstone & Project Review Arena
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluate real GitHub repositories submitted by trainees to award tamper-proof industry competency credentials.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => toast.info('Prompted students with new Capstone Challenge: "Distributed Rate Limiter in Go"')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Dispatch New Capstone Challenge
              </Button>
            </div>

            <div className="space-y-4">
              {capstoneReviews.map(rev => (
                <div key={rev.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{rev.projectTitle}</span>
                        <Badge className={rev.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold' : 'bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold'}>
                          {rev.status === 'approved' ? `Approved (${rev.score}/100)` : 'Pending Review'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted by: <strong className="text-slate-800 dark:text-slate-200">{rev.studentName}</strong> &bull; {rev.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={rev.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100"
                      >
                        <FolderGit2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>GitHub Code</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      <a
                        href={rev.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Competencies Tested:</span>
                      {rev.skillsTargeted.map((s, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] font-normal bg-slate-50 dark:bg-slate-800 text-slate-600">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    {rev.status === 'pending_review' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setCapstoneReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: 'approved', score: 92 } : r));
                            toast.success(`Project approved with score 92/100! Endorsement badge sent to ${rev.studentName}.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8 px-3"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve with Score 92/100
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-600 font-bold">
                        ✓ Verified & Credited to Student Profile
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TAB 5: COHORT ANALYTICS & FEEDBACK */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  {t('Cohort Performance & Trainee Feedback', 'Cohort Performance & Trainee Feedback')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('Track competency gap remediation velocity and authentic student ratings.', 'Track competency gap remediation velocity and authentic student ratings.')}
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('Remediation Success Rate', 'Remediation Success Rate')}</span>
                <div className="text-3xl font-black text-emerald-600 mt-1">94.2%</div>
                <span className="text-[11px] text-slate-400">{t('Trainees passed benchmark within 3 weeks', 'Trainees passed benchmark within 3 weeks')}</span>
              </Card>

              <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('Avg Competency Jump', 'Avg Competency Jump')}</span>
                <div className="text-3xl font-black text-blue-600 mt-1">+38%</div>
                <span className="text-[11px] text-slate-400">{t('Across OOP, SQL, & System Architecture', 'Across OOP, SQL, & System Architecture')}</span>
              </Card>

              <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('Student Satisfaction', 'Student Satisfaction')}</span>
                <div className="text-3xl font-black text-amber-500 mt-1">★ 4.92 / 5.0</div>
                <span className="text-[11px] text-slate-400">{t('Verified by accredited survey feedback', 'Verified by accredited survey feedback')}</span>
              </Card>
            </div>

            {/* Feedback Reviews List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                {t('Verified Trainee Endorsements & Reviews', 'Verified Trainee Endorsements & Reviews')} ({feedbackList.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackList.map(fb => (
                  <div key={fb.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {fb.traineeName[0]}
                        </div>
                        <strong className="text-xs text-slate-900 dark:text-white">{fb.traineeName}</strong>
                      </div>
                      <span className="text-amber-500 font-bold text-xs">★ {fb.courseRating}/5</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{fb.feedbackText}"
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{t('Trainer Score', 'Trainer Score')}: {fb.trainerScore}/10</span>
                      <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: Create Course Modal */}
      <Dialog open={newCourseOpen} onOpenChange={setNewCourseOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              {t('Create New Course', 'Create New Course')}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t('Publish structured modules targeted at trainee skill gaps.', 'Publish structured modules targeted at trainee skill gaps.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCourse} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Course Title', 'Course Title')}</label>
              <Input 
                value={newCourseTitle} 
                onChange={(e) => setNewCourseTitle(e.target.value)} 
                placeholder="e.g. Distributed Cloud Computing & Microservices" 
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Subject Area', 'Subject Area')}</label>
              <Input 
                value={newCourseSubject} 
                onChange={(e) => setNewCourseSubject(e.target.value)} 
                placeholder="e.g. Data Structures, Cloud, Python" 
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Difficulty', 'Difficulty')}</label>
                <select 
                  value={newCourseDifficulty} 
                  onChange={(e) => setNewCourseDifficulty(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="Beginner">{t('Beginner', 'Beginner')}</option>
                  <option value="Intermediate">{t('Intermediate', 'Intermediate')}</option>
                  <option value="Advanced">{t('Advanced', 'Advanced')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Duration', 'Duration')}</label>
                <Input 
                  value={newCourseDuration} 
                  onChange={(e) => setNewCourseDuration(e.target.value)} 
                  placeholder="e.g. 6 weeks (24 hours)" 
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Overview Description', 'Overview Description')}</label>
              <textarea 
                value={newCourseDesc} 
                onChange={(e) => setNewCourseDesc(e.target.value)} 
                placeholder="Curriculum summary and practical milestones..." 
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setNewCourseOpen(false)} className="rounded-xl text-xs">
                {t('Cancel', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                {t('Publish Course', 'Publish Course')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Upload Material Modal */}
      <Dialog open={newResourceOpen} onOpenChange={setNewResourceOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              {t('Upload Material', 'Upload Material')}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t('Add presentations, lecture recordings, notes, or sample tests.', 'Add presentations, lecture recordings, notes, or sample tests.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadResource} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Document / Material Name', 'Document / Material Name')}</label>
              <Input 
                value={newResTitle} 
                onChange={(e) => setNewResTitle(e.target.value)} 
                placeholder="e.g. Distributed Consensus Algorithms Guide.pdf" 
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Resource Type', 'Resource Type')}</label>
              <select 
                value={newResType} 
                onChange={(e) => setNewResType(e.target.value as any)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="pdf">PDF Handbook / Notes</option>
                <option value="presentation">Presentation Slides (.pptx)</option>
                <option value="lecture_video">Recorded Video Lecture</option>
                <option value="study_material">Code & Study Repository</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Subject Area', 'Subject Area')}</label>
              <Input 
                value={newResSubject} 
                onChange={(e) => setNewResSubject(e.target.value)} 
                placeholder="e.g. Algorithms" 
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{t('Google Drive / Cloud Link', 'Google Drive / Cloud Link')}</span>
                <span className="text-[10px] text-blue-500 font-normal">Drive, Dropbox, GitHub</span>
              </label>
              <Input 
                value={newResDriveUrl} 
                onChange={(e) => setNewResDriveUrl(e.target.value)} 
                placeholder="https://drive.google.com/file/d/..." 
                className="text-xs rounded-xl"
              />
              <p className="text-[10px] text-slate-400">
                Trainees can directly preview or open this shared Drive folder/file from their course library.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setNewResourceOpen(false)} className="rounded-xl text-xs h-9 px-3.5">
                {t('Cancel', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-xs">
                {t('Upload Material', 'Upload Material')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Launch Remedial Workshop Modal */}
      <Dialog open={workshopModalOpen} onOpenChange={setWorkshopModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" />
              {t('Host Remedial Workshop', 'Host Remedial Workshop')}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Host an interactive live session to resolve the <strong className="text-blue-600">{selectedDemand?.skillName}</strong> skill gap for {selectedDemand?.traineeCount} interested trainees.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLaunchWorkshop} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Workshop Title', 'Workshop Title')}</label>
              <Input 
                value={workshopTitle} 
                onChange={(e) => setWorkshopTitle(e.target.value)} 
                placeholder="e.g. Mastering Binary Trees & Graph Traversal" 
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Date & Time', 'Date & Time')}</label>
                <Input 
                  value={workshopDate} 
                  onChange={(e) => setWorkshopDate(e.target.value)} 
                  placeholder="e.g. Tomorrow, 4:00 PM IST" 
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Seat Capacity', 'Seat Capacity')}</label>
                <Input 
                  type="number"
                  value={workshopMaxCapacity} 
                  onChange={(e) => setWorkshopMaxCapacity(parseInt(e.target.value) || 30)} 
                  className="text-xs rounded-xl"
                  min={5}
                  max={100}
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300">
              ✓ Automated notifications will be sent to all trainees diagnosed with this skill gap.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setWorkshopModalOpen(false)} className="rounded-xl text-xs">
                {t('Cancel', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                {t('Schedule & Announce Workshop', 'Schedule & Announce Workshop')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
