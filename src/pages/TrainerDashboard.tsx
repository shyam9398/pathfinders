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
  ChevronRight,
  ArrowLeft,
  Share2,
  Code
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Course, TrainerResource, MentorshipSession, SkillGapDemand, TrainerWorkshop } from '@/types/capacityConnect';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { toast } from 'sonner';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Current trainer identity (defaults to trainer-2: Priya Narayanan or logged in user)
  const trainerId = user?.id?.startsWith('trainer') ? user.id : 'trainer-2';
  const trainerName = user?.name || 'Priya Narayanan';

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Resolve dedicated page from URL path or search parameter
  type TrainerPage = 'overview' | 'radar' | 'sessions' | 'courses' | 'resources' | 'clinic' | 'capstones' | 'analytics';

  const resolvePage = (): TrainerPage => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'radar', 'sessions', 'courses', 'resources', 'clinic', 'capstones', 'analytics'].includes(tabParam)) {
      return tabParam as TrainerPage;
    }
    const path = location.pathname.toLowerCase();
    if (path.includes('/courses')) return 'courses';
    if (path.includes('/library') || path.includes('/resources')) return 'resources';
    if (path.includes('/trainees') || path.includes('/sessions')) return 'sessions';
    if (path.includes('/clinic') || path.includes('/doubts')) return 'clinic';
    if (path.includes('/capstones') || path.includes('/reviews') || path.includes('/projects')) return 'capstones';
    if (path.includes('/analytics') || path.includes('/feedback')) return 'analytics';
    if (path.includes('/radar')) return 'radar';
    return 'overview';
  };

  const [currentPage, setCurrentPage] = useState<TrainerPage>(resolvePage);

  useEffect(() => {
    setCurrentPage(resolvePage());
  }, [location.pathname, searchParams]);

  const handleNavigatePage = (page: TrainerPage) => {
    setCurrentPage(page);
    navigate(`/trainer/${page === 'overview' ? '' : page}`);
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

  // Live Student Rapid Doubt Clinic Queue
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

  // Capstone & Project Submissions for review
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

  // Handle Publish Resource
  const handlePublishResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;

    const res: TrainerResource = {
      id: `res-${Date.now()}`,
      trainerId,
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

    capacityStore.createWorkshop({
      trainerId,
      trainerName,
      targetSkillGap: selectedDemand?.skillName || 'Data Structures',
      title: workshopTitle,
      date: workshopDate,
      time: '11:00 AM - 12:30 PM IST',
      maxSeats: workshopMaxCapacity,
      meetUrl: 'https://meet.google.com/capacity-remediation-live'
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

  // Breadcrumbs title resolution
  const getPageTitle = () => {
    switch (currentPage) {
      case 'radar': return t('Skill Gap Demand Radar', 'Skill Gap Demand Radar');
      case 'sessions': return t('1:1 Mentorship Sessions', '1:1 Mentorship Sessions');
      case 'courses': return t('Course Studio & Curriculum', 'Course Studio & Curriculum');
      case 'resources': return t('Trainer Digital Library', 'Trainer Digital Library');
      case 'clinic': return t('Rapid Doubt Clinic', 'Rapid Doubt Clinic');
      case 'capstones': return t('Capstone & Code Reviews', 'Capstone & Code Reviews');
      case 'analytics': return t('Cohort Intelligence & Analytics', 'Cohort Intelligence & Analytics');
      default: return t('Trainer Command Center', 'Trainer Command Center');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: t('Trainer Hub', 'Trainer Hub'), href: currentPage === 'overview' ? undefined : '/trainer' },
          ...(currentPage !== 'overview' ? [{ label: getPageTitle() }] : [])
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 1. DEDICATED PAGE 1: TRAINER OVERVIEW COMMAND CENTER */}
        {currentPage === 'overview' && (
          <div className="space-y-6">
            {/* HERO BANNER */}
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

              {/* Quick Metrics Bar inside Hero with ANIMATED COUNTERS */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
                <div>
                  <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Identified Gap Demands', 'Identified Gap Demands')}</span>
                  <span className="text-xl font-black text-white mt-0.5 block">
                    <AnimatedCounter target={gapDemands.reduce((acc, g) => acc + g.traineeCount, 0)} duration={1100} suffix=" Trainees" />
                  </span>
                </div>
                <div>
                  <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Active 1:1 Inquiries', 'Active 1:1 Inquiries')}</span>
                  <span className="text-xl font-black text-emerald-300 mt-0.5 block">
                    <AnimatedCounter target={sessions.filter(s => s.status === 'requested' || s.status === 'confirmed').length} duration={800} suffix=" Scheduled" />
                  </span>
                </div>
                <div>
                  <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Published Courses', 'Published Courses')}</span>
                  <span className="text-xl font-black text-white mt-0.5 block">
                    <AnimatedCounter target={courses.length} duration={700} suffix=" Active" />
                  </span>
                </div>
                <div>
                  <span className="text-blue-200/70 block uppercase tracking-wider text-[10px] font-semibold">{t('Competency Rating', 'Competency Rating')}</span>
                  <span className="text-xl font-black text-amber-300 mt-0.5 block">
                    <AnimatedCounter target={4.9} decimals={1} prefix="★ " suffix=" / 5.0" />
                  </span>
                </div>
              </div>
            </div>

            {/* DEDICATED FEATURE LAUNCHPAD: 7 DISTINCT MODULES AS RICH CARDS */}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Trainer Operations & Pedagogical Modules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Skill Gap Radar */}
                <Card 
                  onClick={() => handleNavigatePage('radar')}
                  className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <Badge className="bg-rose-500 text-white text-[10px]">Live Radar</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Skill Gap Radar & Demand
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Diagnose 5 high-priority technical deficit clusters. Launch remedial workshops with 1-click Google Meet.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>
                      <AnimatedCounter target={gapDemands.reduce((acc, g) => acc + g.traineeCount, 0)} suffix=" Trainees in Demand" />
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>

                {/* 2. 1:1 Mentorship */}
                <Card 
                  onClick={() => handleNavigatePage('sessions')}
                  className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                      Clinical Mentoring
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    1-on-1 Remedial Mentorship
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Review personalized student session bookings, manage availability slots, and confirm appointments.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>
                      <AnimatedCounter target={sessions.length} suffix=" Active Inquiries" />
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>

                {/* 3. Course Studio */}
                <Card 
                  onClick={() => handleNavigatePage('courses')}
                  className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-200">
                      Curriculum
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                    Curriculum Course Studio
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Curate accredited courses, structure video lectures, and monitor student completion progress.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span>
                      <AnimatedCounter target={courses.length} suffix=" Published Courses" />
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>

                {/* 4. Trainer Library */}
                <Card 
                  onClick={() => handleNavigatePage('resources')}
                  className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">
                      Drive Vault
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    Trainer Digital Library & Drive
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Share lecture slides, problem sheets, and sync direct Google Drive / OneDrive material links with trainees.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>
                      <AnimatedCounter target={resources.length} suffix=" Digital Assets" />
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>

                {/* 5. Rapid Doubt Clinic */}
                <Card 
                  onClick={() => handleNavigatePage('clinic')}
                  className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <Badge className="bg-rose-500 text-white text-[10px]">Rapid Desk</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                    Rapid Doubt Clinic Desk
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Resolve real-time blocker questions asked by trainees during coding practice and assessments.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600">
                    <span>
                      <AnimatedCounter target={doubtQueue.filter(d => d.status === 'pending').length} suffix=" Pending Questions" />
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>

                {/* 6. Capstone Reviews */}
                <Card 
                  onClick={() => handleNavigatePage('capstones')}
                  className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200">
                      Rubrics & PRs
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Capstone & PR Code Reviews
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Review student GitHub pull requests, evaluate architecture against industry rubrics, and certify portfolios.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>
                      <AnimatedCounter target={capstoneReviews.length} suffix=" Submissions" />
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>

                {/* 7. Cohort Analytics */}
                <Card 
                  onClick={() => handleNavigatePage('analytics')}
                  className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer group md:col-span-2 lg:col-span-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                      Growth Analytics
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Cohort Intelligence & Trainee Growth Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Analyze competency progression across remedial workshops, student pass rate curves, and feedback ratings.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>View Student Performance Intelligence Reports</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>

              </div>
            </div>

            {/* UPCOMING REMEDIAL WORKSHOPS & CLINICS */}
            <Card className="glass-card p-6 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    Scheduled Live Remedial Bootcamps & Workshops
                  </h2>
                  <p className="text-xs text-slate-500">Interactive live problem-solving clinics bridging diagnosed trainee gaps</p>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedDemand(gapDemands[0]);
                    setWorkshopTitle(`Remediation Lab: Mastering ${gapDemands[0]?.skillName || 'Data Structures'}`);
                    setWorkshopModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 rounded-xl"
                >
                  + New Workshop
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workshops.map(w => (
                  <div key={w.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                          {w.targetSkillGap}
                        </Badge>
                        <span className="text-xs font-bold text-emerald-600">
                          {w.registeredCount} / {w.maxSeats} Enrolled
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{w.title}</h4>
                      <span className="text-xs text-slate-500 block mt-1">{w.date} • {w.time}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400">Instructor: {w.trainerName}</span>
                      <a 
                        href={w.meetUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Room
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        )}

        {/* 2. DEDICATED PAGE 2: SKILL GAP DEMAND RADAR */}
        {currentPage === 'radar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-600" />
                  Live Trainee Skill Gap Demand Radar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated real-time deficits diagnosed from trainee diagnostic MCQs and career goal benchmark algorithms.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200 font-bold px-3 py-1">
                  <AnimatedCounter target={gapDemands.reduce((a, b) => a + b.traineeCount, 0)} suffix=" Total Trainees in Deficit" />
                </Badge>
              </div>
            </div>

            {/* Radar Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gapDemands.map((demand) => (
                <Card key={demand.id} className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] font-bold ${
                          demand.urgency === 'Critical' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {demand.urgency} Demand Gap
                      </Badge>
                      <span className="text-2xl font-black text-blue-600">
                        <AnimatedCounter target={demand.traineeCount} />
                        <span className="text-[10px] text-slate-400 block font-normal text-right">Trainees In Gap</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{demand.skillName}</h3>
                    <span className="text-xs text-slate-400 block mt-0.5">{demand.category}</span>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-slate-500">Avg Deficit Gap:</span>
                          <span className="text-rose-600 font-bold">{demand.averageGapPercent}% Deficient</span>
                        </div>
                        <Progress value={demand.averageGapPercent} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-rose-500" />
                      </div>
                      <span className="text-[11px] text-slate-500 block pt-1">
                        <strong>Curriculum Rec:</strong> {demand.topCourseRecommendation}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      onClick={() => openWorkshopLauncher(demand)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-4 h-4" />
                      Host Remedial Workshop
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 3. DEDICATED PAGE 3: 1:1 MENTORSHIP SESSIONS */}
        {currentPage === 'sessions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  1-on-1 Remedial Mentorship Hub
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct clinical appointments requested by trainees to bridge specific diagnostic gaps.
                </p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1 font-bold">
                <AnimatedCounter target={sessions.length} suffix=" Total Session Requests" />
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessions.map((sess) => (
                <Card key={sess.id} className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{sess.traineeName}</h3>
                        <span className="text-xs text-slate-500 block mt-0.5">Focus Gap: <strong>{sess.skillGap}</strong></span>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          sess.status === 'confirmed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : sess.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {sess.status}
                      </Badge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: <strong>{sess.scheduledDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Time Slot: <strong>{sess.timeSlot}</strong></span>
                      </div>
                      {sess.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                          "{sess.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {sess.status === 'pending' ? (
                      <Button 
                        size="sm"
                        onClick={() => handleSessionAction(sess.id, 'confirmed')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-lg font-semibold"
                      >
                        Confirm Booking
                      </Button>
                    ) : (
                      <>
                        <a 
                          href={sess.meetingLink || 'https://meet.google.com/capacity-mentorship-session'}
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg"
                        >
                          Launch Meet
                        </a>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleSessionAction(sess.id, 'completed')}
                          className="text-xs h-8 rounded-lg"
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 4. DEDICATED PAGE 4: COURSE STUDIO */}
        {currentPage === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Course Studio & Curriculum Hub
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Author and manage accredited technical courses structured to eradicate diagnostic skill gaps.
                </p>
              </div>
              <Button 
                onClick={() => setNewCourseOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create New Course
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <Card key={course.id} className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 font-semibold mb-1">
                        {course.subject}
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        ★ {course.rating.toFixed(1)}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Difficulty & Duration:</span>
                        <strong>{course.difficulty} • {course.duration}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Enrolled Trainees:</span>
                        <strong className="text-blue-600">
                          <AnimatedCounter target={course.enrolledCount || 28} suffix=" Trainees" />
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Modules in Syllabus:</span>
                        <span>{course.modules?.length || 2} Interactive Modules</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Published by {course.trainerName}</span>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/courses/${course.id}/learn`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 rounded-lg"
                    >
                      Preview Syllabus
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 5. DEDICATED PAGE 5: TRAINER DIGITAL LIBRARY & DRIVE VAULT */}
        {currentPage === 'resources' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-amber-500" />
                  Trainer Digital Vault & Course Materials
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish lecture presentations, cheat sheets, code templates, and sync direct Google Drive links with trainees.
                </p>
              </div>
              <Button 
                onClick={() => setNewResourceOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Upload Learning Asset
              </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search resources by title or subject..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-medium shrink-0">Type:</span>
                <select
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
                >
                  <option value="all">All File Types</option>
                  <option value="pdf">PDF Documents</option>
                  <option value="slides">Presentations & Slides</option>
                  <option value="code">Code Repositories</option>
                  <option value="worksheet">Problem Worksheets</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => (
                <Card key={res.id} className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border-amber-200">
                        {res.type}
                      </Badge>
                      <span className="text-[11px] text-slate-400">{res.fileSizeMb} MB</span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{res.title}</h3>
                    <span className="text-xs text-slate-500 block mt-0.5">{res.subject}</span>

                    {res.driveUrl && (
                      <div className="mt-3 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-medium truncate max-w-[200px]">{res.driveUrl}</span>
                        <a href={res.driveUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Uploaded {new Date(res.uploadedAt).toLocaleDateString()}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        window.open(res.driveUrl || res.fileUrl, '_blank');
                        toast.success('Resource downloaded!');
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 rounded-lg"
                    >
                      Open File
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 6. DEDICATED PAGE 6: RAPID DOUBT CLINIC */}
        {currentPage === 'clinic' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-rose-600" />
                  Rapid Doubt Clinic Desk — Real-Time Trainee Resolution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trainees facing code blockers submit queries. Provide step-by-step guidance and code explanations.
                </p>
              </div>
              <Badge className="bg-rose-500 text-white text-xs px-3 py-1 font-bold">
                <AnimatedCounter target={doubtQueue.filter(d => d.status === 'pending').length} suffix=" Active Blocker Doubts" />
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doubtQueue.map((item) => (
                <Card key={item.id} className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.studentName}</h3>
                        <span className="text-xs text-slate-400">{item.academicYear} • {item.postedTime}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${item.urgency === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50'}`}
                      >
                        {item.urgency}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <span className="text-xs font-bold text-blue-600 block">{item.topic}</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{item.question}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <Input 
                      placeholder="Write rapid code solution or explanation..."
                      className="text-xs h-8 rounded-lg"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setDoubtQueue(prev => prev.map(d => d.id === item.id ? { ...d, status: 'resolved' } : d));
                          toast.success(`Solution sent to ${item.studentName}! Doubt resolved.`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-lg font-semibold"
                      >
                        Send Solution & Resolve
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 7. DEDICATED PAGE 7: CAPSTONE & CODE REVIEWS */}
        {currentPage === 'capstones' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                  Capstone & PR Code Review Arena
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect student pull requests on GitHub, evaluate software architectural patterns, and grade capstones.
                </p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-3 py-1 font-bold">
                <AnimatedCounter target={capstoneReviews.length} suffix=" Submissions in Arena" />
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {capstoneReviews.map((rev) => (
                <Card key={rev.id} className="glass-card p-5 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{rev.projectTitle}</h3>
                        <span className="text-xs text-slate-500">Submitted by <strong>{rev.studentName}</strong> • {rev.submittedAt}</span>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-[10px] capitalize ${rev.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                      >
                        {rev.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {rev.skillsTargeted.map((s, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs font-semibold">
                      <a href={rev.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" />
                        GitHub Repository
                      </a>
                      <a href={rev.demoUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Demo App
                      </a>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Rubric Score: {rev.score ? `${rev.score}/100` : 'Pending Score'}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setCapstoneReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: 'approved', score: 96 } : r));
                        toast.success(`Project ${rev.projectTitle} certified! Grade: 96/100`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 rounded-lg font-semibold"
                    >
                      {rev.status === 'approved' ? 'Update Grade' : 'Approve & Certify'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 8. DEDICATED PAGE 8: COHORT ANALYTICS & INTELLIGENCE */}
        {currentPage === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Cohort Intelligence & Trainee Growth Analytics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pedagogical assessment pass rates, competency growth curves before vs. after instruction, and student NPS satisfaction.
                </p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1 font-bold">
                <AnimatedCounter target={94} suffix="% Success Pass Rate" />
              </Badge>
            </div>

            {/* Growth Curves */}
            <Card className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Skill Gap Eradication Trajectory (Before vs After Remediation)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Data Structures & Algorithmic Complexity</span>
                    <span className="text-emerald-600 font-bold">+52% Gain (32% → 84%)</span>
                  </div>
                  <Progress value={84} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Enterprise OOP & Modular Clean Architecture</span>
                    <span className="text-emerald-600 font-bold">+48% Gain (40% → 88%)</span>
                  </div>
                  <Progress value={88} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Relational Database Indexing & Query Plans</span>
                    <span className="text-emerald-600 font-bold">+55% Gain (35% → 90%)</span>
                  </div>
                  <Progress value={90} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500" />
                </div>
              </div>
            </Card>

            {/* Trainee Feedback Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-900 dark:text-white">Pavan Kalyan Varma</strong>
                  <span className="text-amber-500 text-xs font-bold">★ 5.0</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  "Dr. Priya's workshop on Graph algorithms helped me crack my Google mock interview. The 1-on-1 clinic resolved my AVL tree pointer confusion instantly."
                </p>
                <span className="text-[10px] text-slate-400 block mt-2">Placed at Google Cloud</span>
              </Card>

              <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-900 dark:text-white">Neha Chawla</strong>
                  <span className="text-amber-500 text-xs font-bold">★ 5.0</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  "The SQL Query Indexing clinic transformed my database understanding. The practical EXPLAIN ANALYZE traces made everything so clear."
                </p>
                <span className="text-[10px] text-slate-400 block mt-2">3rd Year IT • Anna University</span>
              </Card>
            </div>
          </div>
        )}

      </main>

      {/* CREATE COURSE MODAL */}
      <Dialog open={newCourseOpen} onOpenChange={setNewCourseOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Accredited Course</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Publish structured curriculum to bridge trainee skill gaps.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCourse} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Course Title</label>
              <Input 
                placeholder="e.g. Mastering High-Throughput Microservices"
                value={newCourseTitle}
                onChange={e => setNewCourseTitle(e.target.value)}
                required
                className="text-xs rounded-xl h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject Domain</label>
              <Input 
                placeholder="e.g. Distributed Systems"
                value={newCourseSubject}
                onChange={e => setNewCourseSubject(e.target.value)}
                required
                className="text-xs rounded-xl h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Difficulty</label>
                <select
                  value={newCourseDifficulty}
                  onChange={(e) => setNewCourseDifficulty(e.target.value as any)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duration</label>
                <Input 
                  value={newCourseDuration}
                  onChange={e => setNewCourseDuration(e.target.value)}
                  className="text-xs rounded-xl h-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
              <textarea 
                rows={3}
                placeholder="Course objectives and target competencies..."
                value={newCourseDesc}
                onChange={e => setNewCourseDesc(e.target.value)}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setNewCourseOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold rounded-xl">
                Publish Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* UPLOAD RESOURCE MODAL */}
      <Dialog open={newResourceOpen} onOpenChange={setNewResourceOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Upload Learning Material</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Publish study materials, slides, or direct Google Drive links for your trainees.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePublishResource} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Resource Title</label>
              <Input 
                placeholder="e.g. Graph Algorithms Cheat Sheet & Code Snippets"
                value={newResTitle}
                onChange={e => setNewResTitle(e.target.value)}
                required
                className="text-xs rounded-xl h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                <Input 
                  placeholder="e.g. Data Structures"
                  value={newResSubject}
                  onChange={e => setNewResSubject(e.target.value)}
                  className="text-xs rounded-xl h-9"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as any)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="pdf">PDF Guide</option>
                  <option value="slides">Slides Presentation</option>
                  <option value="code">Source Code Zip</option>
                  <option value="worksheet">Problem Worksheet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Google Drive or Cloud URL (Optional)
              </label>
              <Input 
                placeholder="https://drive.google.com/file/d/..."
                value={newResDriveUrl}
                onChange={e => setNewResDriveUrl(e.target.value)}
                className="text-xs rounded-xl h-9 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setNewResourceOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 font-semibold rounded-xl">
                Publish to Library
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* LAUNCH WORKSHOP MODAL */}
      <Dialog open={workshopModalOpen} onOpenChange={setWorkshopModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Schedule Remedial Live Workshop</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Host interactive video clinic for trainees diagnosed with {selectedDemand?.skillName || 'gaps'}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLaunchWorkshop} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Workshop Title</label>
              <Input 
                value={workshopTitle}
                onChange={e => setWorkshopTitle(e.target.value)}
                required
                className="text-xs rounded-xl h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date & Time</label>
                <Input 
                  value={workshopDate}
                  onChange={e => setWorkshopDate(e.target.value)}
                  className="text-xs rounded-xl h-9"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Seat Capacity</label>
                <Input 
                  type="number"
                  value={workshopMaxCapacity}
                  onChange={e => setWorkshopMaxCapacity(parseInt(e.target.value) || 30)}
                  className="text-xs rounded-xl h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setWorkshopModalOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold rounded-xl">
                Schedule & Notify Trainees
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
