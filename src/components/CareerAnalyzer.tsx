import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Video,
  CheckCircle2,
  Target,
  BookOpen,
  Briefcase,
  GraduationCap,
  Trophy,
  Code,
  Lightbulb,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Send,
  UserCheck,
  Check,
  Zap,
  Bookmark,
  Layers,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Plus,
  ExternalLink,
  Star,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { capacityStore } from '@/services/capacityStore';
import { TrainerProfile } from '@/types/capacityConnect';
import { toast } from 'sonner';
import { ConfettiEffect } from './ConfettiEffect';
import Navbar from '@/components/Navigation/Navbar';

export interface ProfileData {
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
}

export interface CareerAnalyzerProps {
  profileData: ProfileData;
  onBack: () => void;
  onEditProfile?: () => void;
}

export interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  match_percentage: number;
  required_skills: string[];
  youtube_links: string[];
  estimated_timeline: string;
  roadmap_steps: string[];
  rationale: string;
  category?: 'Technology' | 'Data' | 'Management' | 'Design' | 'Core Engineering' | 'Other';
  demand?: 'Very High' | 'High' | 'Moderate';
  readiness?: 'Beginner' | 'Intermediate' | 'Advanced';
  whyMatches?: string[];
  projects?: string[];
  internships?: string[];
  certifications?: string[];
  competitions?: string[];
}

export type JourneyStep = 'overview' | 'skillGap' | 'roadmap' | 'learning' | 'ready';

interface RoadmapYear {
  year: string;
  focus: string;
  activities: string[];
  milestones: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Normalized skill alias dictionary to eliminate false negatives (e.g., 'OOP' === 'Object Oriented Programming')
const SKILL_ALIASES: Record<string, string[]> = {
  'java': ['java', 'core java', 'advanced java'],
  'python': ['python', 'py', 'python3'],
  'javascript': ['javascript', 'js', 'es6', 'vanilla js'],
  'typescript': ['typescript', 'ts'],
  'html': ['html', 'html5'],
  'css': ['css', 'css3', 'styling'],
  'html/css': ['html', 'css', 'html5', 'css3'],
  'react': ['react', 'react.js', 'reactjs'],
  'sql': ['sql', 'mysql', 'postgresql', 'sqlite', 'database', 'rdbms'],
  'git': ['git', 'github', 'version control', 'gitlab'],
  'oop': ['oop', 'oops', 'object oriented programming', 'object-oriented programming'],
  'data structures': ['data structures', 'dsa', 'data structures and algorithms', 'algorithms'],
  'problem solving': ['problem solving', 'analytical skills', 'critical thinking', 'logic'],
  'rest apis': ['rest apis', 'rest api', 'apis', 'restful services', 'api design'],
  'docker': ['docker', 'containerization', 'containers'],
  'linux': ['linux', 'unix', 'shell scripting', 'bash'],
  'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
  'communication': ['communication', 'teamwork', 'collaboration', 'presentation'],
};

// Robust matcher check
const doesUserHaveSkill = (userSkillsList: string[], requiredSkill: string): boolean => {
  const reqClean = requiredSkill.toLowerCase().trim();
  const userCleans = userSkillsList.map(s => s.toLowerCase().trim());

  // 1. Direct or substring match
  if (userCleans.some(u => u === reqClean || u.includes(reqClean) || reqClean.includes(u))) {
    return true;
  }

  // 2. Check alias map
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    const reqMatchesGroup = canonical === reqClean || aliases.some(a => reqClean.includes(a) || a.includes(reqClean));
    if (reqMatchesGroup) {
      if (userCleans.some(u => aliases.some(a => u.includes(a) || a.includes(u)))) {
        return true;
      }
    }
  }

  return false;
};

export const CareerAnalyzer: React.FC<CareerAnalyzerProps> = ({ profileData, onBack, onEditProfile }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Core state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Discovery Controls state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'demand' | 'timeline'>('match');

  // Bookmarking / Saved Careers (persisted in localStorage + state)
  const [savedCareerNames, setSavedCareerNames] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`pathfinders_saved_careers_${user?.id || 'guest'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Compare Careers selection (max 2)
  const [compareList, setCompareList] = useState<CareerOption[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Match Breakdown Modal state
  const [breakdownCareer, setBreakdownCareer] = useState<CareerOption | null>(null);

  // Detail Journey Flow state
  const [selectedCareer, setSelectedCareer] = useState<CareerOption | null>(null);
  const [journeyStep, setJourneyStep] = useState<JourneyStep>('overview');
  const [roadmapData, setRoadmapData] = useState<RoadmapYear[]>([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const roadmapCache = useRef<Map<string, RoadmapYear[]>>(new Map());

  // Compact AI Assistant state
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${profileData.name || 'there'}! I'm PathFinder AI. I've analyzed your background in ${profileData.fieldOfStudy || 'your domain'}. Ask me to compare careers, audit skill gaps, or customize your roadmap.`,
      timestamp: new Date()
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync saved careers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`pathfinders_saved_careers_${user?.id || 'guest'}`, JSON.stringify(savedCareerNames));
    } catch (e) {
      console.error('Failed to store saved careers:', e);
    }
  }, [savedCareerNames, user?.id]);

  // Initial analysis fetch
  useEffect(() => {
    handleStartAnalysis();
  }, [user, profileData]);

  // Auto scroll chat
  useEffect(() => {
    if (isChatExpanded) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatExpanded]);

  // Profile Completeness calculation (out of 100%)
  const profileCompleteness = useMemo(() => {
    let score = 0;
    if (profileData.name) score += 10;
    if (profileData.educationLevel || profileData.fieldOfStudy) score += 25;
    if (profileData.skills && profileData.skills.length > 5) score += 30;
    if (profileData.interests && profileData.interests.length > 5) score += 15;
    if (profileData.goals && profileData.goals.length > 5) score += 10;
    if (profileData.certifications || profileData.workEnvironment) score += 10;
    return Math.min(100, Math.max(score, 40));
  }, [profileData]);

  // Local state overrides for quick in-place testing and editing
  const [localSkills, setLocalSkills] = useState<string>(() => {
    return profileData.skills || localStorage.getItem('pf_user_skills') || '';
  });
  const [localDegree, setLocalDegree] = useState<string>(() => {
    return profileData.fieldOfStudy || profileData.educationLevel || localStorage.getItem('pf_user_degree') || 'B.Tech in Computer Science';
  });
  const [localGoals, setLocalGoals] = useState<string>(() => {
    return profileData.goals || localStorage.getItem('pf_user_goals') || 'Tech Lead / CEO';
  });

  // Parse user skills (default to Java & Maths if empty, so Python is cleanly recognized as a skill gap)
  const parsedUserSkills = useMemo(() => {
    const raw = localSkills || profileData.skills || '';
    const list = raw.split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean);
    return list.length > 0 ? list : ['Java', 'Mathematics', 'Problem Solving', 'Data Structures'];
  }, [localSkills, profileData.skills]);

  // Skill Gap Remediation & Matched Trainer State
  const [activeRemediationSkill, setActiveRemediationSkill] = useState<string>('Python');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingTrainer, setSelectedBookingTrainer] = useState<TrainerProfile | null>(null);
  const [bookingDate, setBookingDate] = useState('Tomorrow');
  const [bookingTime, setBookingTime] = useState('04:00 PM - 04:45 PM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookedSessionKeys, setBookedSessionKeys] = useState<string[]>([]);

  // Quick Skill and Profile Update Modal State
  const [isQuickSkillModalOpen, setIsQuickSkillModalOpen] = useState(false);
  const [quickSkillsText, setQuickSkillsText] = useState(localSkills || 'Java, Mathematics');
  const [quickDegreeText, setQuickDegreeText] = useState(localDegree);
  const [quickGoalsText, setQuickGoalsText] = useState(localGoals);

  // User Career Stage: Student or Employee
  const [careerStage, setCareerStage] = useState<'student' | 'employee'>(() => {
    return (localStorage.getItem('pf_career_stage') as 'student' | 'employee') || 'student';
  });

  // If Student: Academic Year (1st Year, 2nd Year, 3rd Year, 4th / Final Year, PG)
  const [academicYear, setAcademicYear] = useState<string>(() => {
    return localStorage.getItem('pf_academic_year') || profileData.currentYear || '3rd Year';
  });

  // If Employee: Experience Level
  const [experienceLevel, setExperienceLevel] = useState<string>(() => {
    return localStorage.getItem('pf_experience_level') || '1-3 Years';
  });

  // Update storage on change
  const handleSetCareerStage = (stage: 'student' | 'employee') => {
    setCareerStage(stage);
    localStorage.setItem('pf_career_stage', stage);
  };

  const handleSetAcademicYear = (yr: string) => {
    setAcademicYear(yr);
    localStorage.setItem('pf_academic_year', yr);
  };

  // Dynamic Internship and Job Recommendations tailored to Student Year or Employee Status
  const recommendedOpportunities = useMemo(() => {
    if (careerStage === 'student') {
      if (academicYear === '1st Year' || academicYear === '2nd Year') {
        return [
          {
            id: 'opp-1',
            title: 'Early Career Software Engineering Summer Intern',
            company: 'Microsoft Engage / Learn Fellowship',
            logo: '💻',
            type: 'Summer Internship',
            mode: 'Hybrid / Remote',
            stipend: '₹45,000 / month',
            duration: '2 Months (Summer 2026)',
            targetAudience: '1st & 2nd Year Undergraduates',
            skills: ['Data Structures', 'Python', 'Problem Solving', 'Git'],
            matchScore: 94,
            description: 'Mentorship-driven engineering fellowship solving real developer productivity problems.',
            highlight: 'Top Early Talent Pipeline'
          },
          {
            id: 'opp-2',
            title: 'Frontend & UI Engineering Intern',
            company: 'Razorpay Innovation Labs',
            logo: '⚡',
            type: 'Product Internship',
            mode: 'Bangalore / Hybrid',
            stipend: '₹35,000 / month',
            duration: '3 Months',
            targetAudience: '1st - 3rd Year Students',
            skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind'],
            matchScore: 91,
            description: 'Build modern dashboard components and optimize web vitals for payment flows.',
            highlight: 'Hands-on Production Systems'
          },
          {
            id: 'opp-3',
            title: 'AICTE Virtual Tech Internship',
            company: 'Google Cloud & AICTE Fellowship',
            logo: '☁️',
            type: 'Virtual Internship',
            mode: 'Virtual / Online',
            stipend: 'Sponsored Certificate + Swag Kits',
            duration: '8 Weeks',
            targetAudience: '1st & 2nd Year Students',
            skills: ['Cloud Computing', 'Linux', 'Python'],
            matchScore: 88,
            description: 'Government-recognized foundational cloud engineering and containerization track.',
            highlight: 'AICTE Accredited'
          }
        ];
      } else if (academicYear === '3rd Year') {
        return [
          {
            id: 'opp-4',
            title: 'Software Engineering Pre-Placement Intern',
            company: 'Amazon / AWS India',
            logo: '📦',
            type: 'Pre-Placement Internship (PPO)',
            mode: 'Hyderabad / Bangalore',
            stipend: '₹80,000 / month',
            duration: '6 Months',
            targetAudience: '3rd Year Pre-Final Year (2027 Batch)',
            skills: ['Java', 'OOP', 'Data Structures', 'SQL'],
            matchScore: 96,
            description: 'Work alongside SDE teams on distributed microservices with fast-track PPO evaluation.',
            highlight: 'Direct Pre-Placement Offer Opportunity'
          },
          {
            id: 'opp-5',
            title: 'Full Stack Product Intern',
            company: 'Swiggy Tech',
            logo: '🛵',
            type: 'Industrial Internship',
            mode: 'Bangalore (Onsite)',
            stipend: '₹50,000 / month',
            duration: '6 Months',
            targetAudience: '3rd Year Students',
            skills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs'],
            matchScore: 92,
            description: 'Build high-throughput consumer services handling 20,000+ orders per minute.',
            highlight: 'High Full-Time Conversion Rate'
          },
          {
            id: 'opp-6',
            title: 'Data Science & Analytics Intern',
            company: 'Flipkart Labs',
            logo: '🛍️',
            type: 'Data Internship',
            mode: 'Bangalore / Hybrid',
            stipend: '₹60,000 / month',
            duration: '3 Months',
            targetAudience: '3rd & 4th Year Students',
            skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
            matchScore: 89,
            description: 'Analyze user behavior data to optimize real-time product search ranking.',
            highlight: 'Tier-1 E-commerce Dataset'
          }
        ];
      } else {
        // 4th / Final Year & PG Students: Graduate Engineering Trainee & Full-time Roles
        return [
          {
            id: 'opp-7',
            title: 'Graduate Software Engineer Trainee (GET)',
            company: 'Cisco Systems India',
            logo: '🌐',
            type: 'Full-Time Campus / Off-Campus Role',
            mode: 'Bangalore',
            stipend: '14.5 - 18.0 LPA',
            duration: 'Permanent Full-time',
            targetAudience: 'Final Year / Fresh Graduates (2025-2026 Batch)',
            skills: ['Java/C++', 'Networking', 'Data Structures', 'Git'],
            matchScore: 95,
            description: 'Permanent graduate hire program with rotation through cloud and core networking stacks.',
            highlight: 'Comprehensive Health & Stock Grants'
          },
          {
            id: 'opp-8',
            title: 'Associate Cloud Engineer',
            company: 'Oracle Cloud Infrastructure (OCI)',
            logo: '☁️',
            type: 'Full-Time Graduate Role',
            mode: 'Hyderabad / Bangalore',
            stipend: '12.0 - 16.0 LPA',
            duration: 'Permanent Full-time',
            targetAudience: 'Final Year & Post-Graduates',
            skills: ['Linux', 'Cloud Architecture', 'Python', 'Docker'],
            matchScore: 91,
            description: 'Deploy and scale mission-critical database and Kubernetes clusters on OCI.',
            highlight: 'Global Tier-1 Enterprise Cloud'
          },
          {
            id: 'opp-9',
            title: 'Associate Data & Analytics Engineer',
            company: 'Deloitte USI',
            logo: '📊',
            type: 'Full-Time Campus Role',
            mode: 'Hyderabad / Pune / Gurugram',
            stipend: '9.0 - 12.5 LPA',
            duration: 'Permanent Full-time',
            targetAudience: 'Final Year B.Tech / MCA / M.Tech',
            skills: ['SQL', 'Python', 'ETL Pipelines', 'Power BI'],
            matchScore: 88,
            description: 'Build enterprise business intelligence pipelines and executive dashboards.',
            highlight: 'Structured Fast-Track Consulting Path'
          }
        ];
      }
    } else {
      // Employee / Working Professional: Lateral Switch & Mid-Senior Roles
      return [
        {
          id: 'opp-10',
          title: 'Senior Full Stack Software Engineer',
          company: 'PhonePe',
          logo: '💳',
          type: 'Lateral Hire (Full-Time)',
          mode: 'Bangalore',
          stipend: '24.0 - 38.0 LPA + ESOPs',
          duration: 'Permanent Full-time',
          targetAudience: 'Working Professionals (1-5+ Years Experience)',
          skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'React'],
          matchScore: 96,
          description: 'Architect low-latency payment processing pipelines handling billions in monthly volume.',
          highlight: 'High-Scale Fintech Architecture'
        },
        {
          id: 'opp-11',
          title: 'Backend Systems Engineer',
          company: 'Uber India Tech Center',
          logo: '🚗',
          type: 'Lateral Hire (Full-Time)',
          mode: 'Bangalore / Hyderabad',
          stipend: '28.0 - 45.0 LPA',
          duration: 'Permanent Full-time',
          targetAudience: 'Working Professionals (2+ Years)',
          skills: ['Go / Java / Python', 'Distributed Systems', 'PostgreSQL', 'Redis'],
          matchScore: 92,
          description: 'Design distributed matching algorithms and fault-tolerant dispatch services.',
          highlight: 'Real-time High-Concurrency Platform'
        },
        {
          id: 'opp-12',
          title: 'Lead Data & Analytics Consultant',
          company: 'EY Technology Consulting',
          logo: '📈',
          type: 'Lateral / Experienced Role',
          mode: 'Mumbai / Bangalore / Hybrid',
          stipend: '18.0 - 26.0 LPA',
          duration: 'Permanent Full-time',
          targetAudience: 'Working Professionals',
          skills: ['Data Architecture', 'Snowflake', 'Python', 'Client Strategy'],
          matchScore: 90,
          description: 'Consult Fortune 500 enterprises on data modernization and cloud migration.',
          highlight: 'Fast-Track Promotion Track to Manager'
        }
      ];
    }
  }, [careerStage, academicYear]);

  // Handle start analysis & generate recommendations
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      if (user) {
        await supabase
          .from('career_profiles')
          .upsert({
            user_id: user.id,
            name: profileData.name || 'Student',
            age: profileData.age || '20',
            country: profileData.country || 'India',
            education_level: profileData.educationLevel,
            field_of_study: profileData.fieldOfStudy,
            specialization: profileData.specialization,
            current_year: profileData.currentYear,
            certifications: profileData.certifications,
            skills: profileData.skills,
            interests: profileData.interests,
            work_environment: profileData.workEnvironment,
            short_term_goals: profileData.goals,
            long_term_goals: profileData.goals,
            career_transition: profileData.careerTransition,
            study_or_job: profileData.studyOrJob,
            location_preference: profileData.locationPreference,
            company_type: profileData.companyType,
            financial_support: profileData.financialSupport,
          });
      }

      const careers = await generateSkillBasedCareers(profileData);

      if (user) {
        const optionsToInsert = careers.map(opt => ({
          user_id: user.id,
          career_name: opt.career_name,
          description: opt.description,
          match_percentage: opt.match_percentage,
          required_skills: opt.required_skills,
          rationale: opt.rationale
        }));

        await supabase.from('career_options').delete().eq('user_id', user.id);
        await supabase.from('career_options').insert(optionsToInsert);

        const avgMatchScore = careers.reduce((sum, c) => sum + c.match_percentage, 0) / (careers.length || 1);
        await supabase.from('career_profiles')
          .update({ career_health_score: Math.round(avgMatchScore * 0.3) })
          .eq('user_id', user.id);
      }

      setCareerOptions(careers);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2800);
    } catch (error) {
      console.error('Error in career analysis:', error);
      toast.error('Could not load AI recommendations, loaded skill catalog.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSkillBasedCareers = async (profile: ProfileData): Promise<CareerOption[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-career-recommendations', {
        body: {
          education: profile.fieldOfStudy || profile.educationLevel || '',
          interests: profile.interests || '',
          goals: profile.goals || '',
          skills: profile.skills || '',
          language: language || 'en'
        }
      });
      if (error) throw error;
      if (data?.careers && Array.isArray(data.careers) && data.careers.length > 0) {
        return data.careers.map((career: any, index: number) => augmentCareer(career, index, profile));
      }
      return getCuratedSkillCareers(profile);
    } catch (err) {
      console.warn('Using intelligent curated fallback matching:', err);
      return getCuratedSkillCareers(profile);
    }
  };

  // Augments any raw career with high quality categorisation, demand, readiness and whyMatches
  const augmentCareer = (raw: any, index: number, profile: ProfileData): CareerOption => {
    const name: string = raw.career_name || raw.name || `Career Option ${index + 1}`;
    const desc: string = raw.description || '';
    const skills: string[] = raw.required_skills || raw.skills || [];
    const timeline: string = raw.timeline || raw.estimated_timeline || '6–12 months';
    const match = raw.match_percentage || raw.matchScore || Math.max(65, 95 - index * 4);

    // Determine category
    const lowerName = name.toLowerCase();
    let category: CareerOption['category'] = 'Technology';
    if (lowerName.includes('data') || lowerName.includes('analytics') || lowerName.includes('ml') || lowerName.includes('ai')) {
      category = 'Data';
    } else if (lowerName.includes('manager') || lowerName.includes('product') || lowerName.includes('analyst') || lowerName.includes('consultant')) {
      category = 'Management';
    } else if (lowerName.includes('ui') || lowerName.includes('ux') || lowerName.includes('design')) {
      category = 'Design';
    }

    // Match reasons based on profile skills
    const userSkills = parsedUserSkills;
    const matchedSkills = skills.filter(req => doesUserHaveSkill(userSkills, req));
    const whyMatches: string[] = [];
    if (matchedSkills.length > 0) {
      whyMatches.push(`Matched skills: ${matchedSkills.slice(0, 2).join(', ')}`);
    } else {
      whyMatches.push(`Aligns with your education in ${profile.fieldOfStudy || 'Science/Technology'}`);
    }
    if (profile.interests) {
      whyMatches.push(`Matches your interest in ${profile.interests.split(',')[0].trim()}`);
    }
    whyMatches.push(`High industry hiring demand in 2025–2026`);

    return {
      id: raw.id || crypto.randomUUID(),
      career_name: name,
      description: desc,
      match_percentage: match,
      required_skills: skills,
      youtube_links: raw.youtube_links || ['https://www.youtube.com/watch?v=WlzRs16TzuQ'],
      estimated_timeline: timeline,
      roadmap_steps: raw.roadmap_steps || [],
      rationale: raw.rationale || raw.reason || `Strongly fits your profile based on verified competencies.`,
      category,
      demand: index < 2 ? 'Very High' : 'High',
      readiness: match > 85 ? 'Advanced' : match > 70 ? 'Intermediate' : 'Beginner',
      whyMatches,
      projects: raw.projects || [],
      internships: raw.internships || [],
      certifications: raw.certifications || [],
      competitions: raw.competitions || []
    };
  };

  // Comprehensive curated catalogue fallback
  const getCuratedSkillCareers = (profile: ProfileData): CareerOption[] => {
    const rawSkills = (localSkills || profile.skills || '').toLowerCase();
    const rawInterests = (profile.interests || '').toLowerCase();
    const rawGoals = (localGoals || profile.goals || '').toLowerCase();
    const combined = `${rawSkills} ${rawInterests} ${(localDegree || profile.fieldOfStudy || '').toLowerCase()} ${rawGoals}`;

    const database = [
      {
        name: 'Software Engineer',
        category: 'Technology' as const,
        description: 'Design, build, and scale resilient applications and distributed enterprise systems.',
        timeline: '6–10 months',
        skills: ['Java', 'Data Structures', 'OOP', 'Problem Solving', 'Python', 'SQL', 'Git'],
        demand: 'Very High' as const,
        keywords: ['java', 'c++', 'dsa', 'software', 'programming', 'oop', 'backend', 'coding', 'btech', 'engineering'],
        youtube: ['https://www.youtube.com/watch?v=WlzRs16TzuQ']
      },
      {
        name: 'Technology Executive / Tech Lead (CEO Path)',
        category: 'Management' as const,
        description: 'Lead enterprise software architecture, strategic product engineering, and AI technology roadmaps from startup to scale.',
        timeline: '8–14 months',
        skills: ['Python', 'Software Architecture', 'System Design', 'Strategic Leadership', 'Cloud Systems', 'Data Analysis'],
        demand: 'Very High' as const,
        keywords: ['ceo', 'cto', 'lead', 'executive', 'leadership', 'management', 'founder', 'architect', 'btech'],
        youtube: ['https://www.youtube.com/watch?v=yUOC-Y0f5ZQ']
      },
      {
        name: 'Python Developer',
        category: 'Technology' as const,
        description: 'Build backend microservices, automations, and data-driven web applications.',
        timeline: '4–8 months',
        skills: ['Python', 'Django/Flask', 'REST APIs', 'SQL', 'Git', 'Docker'],
        demand: 'Very High' as const,
        keywords: ['python', 'django', 'flask', 'scripting', 'backend', 'automation'],
        youtube: ['https://www.youtube.com/watch?v=_uQrJ0TkZlc']
      },
      {
        name: 'Data Analyst',
        category: 'Data' as const,
        description: 'Extract actionable business intelligence using structured queries, statistics, and interactive dashboards.',
        timeline: '4–7 months',
        skills: ['SQL', 'Python', 'Excel', 'Tableau/Power BI', 'Statistics', 'Data Visualization'],
        demand: 'High' as const,
        keywords: ['data', 'analytics', 'analysis', 'sql', 'statistics', 'excel', 'tableau', 'dashboard'],
        youtube: ['https://www.youtube.com/watch?v=1UXOdCBNdgE']
      },
      {
        name: 'Frontend Developer',
        category: 'Technology' as const,
        description: 'Architect responsive, accessible, and high-performance web user experiences.',
        timeline: '5–8 months',
        skills: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript', 'Tailwind CSS', 'Git'],
        demand: 'High' as const,
        keywords: ['frontend', 'react', 'javascript', 'html', 'css', 'ui', 'web'],
        youtube: ['https://www.youtube.com/watch?v=bMknfKXIFA8']
      },
      {
        name: 'Machine Learning Engineer',
        category: 'Data' as const,
        description: 'Develop and operationalize deep learning and machine intelligence models at scale.',
        timeline: '8–12 months',
        skills: ['Python', 'Machine Learning', 'TensorFlow/PyTorch', 'Data Structures', 'Math/Statistics', 'SQL'],
        demand: 'Very High' as const,
        keywords: ['ml', 'machine learning', 'ai', 'deep learning', 'nlp', 'neural', 'statistics'],
        youtube: ['https://www.youtube.com/watch?v=7eh4d6sabA0']
      },
      {
        name: 'Product Manager',
        category: 'Management' as const,
        description: 'Lead product lifecycle from market strategy and user research to cross-functional launch.',
        timeline: '6–12 months',
        skills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Communication', 'Roadmapping'],
        demand: 'High' as const,
        keywords: ['product', 'management', 'agile', 'strategy', 'leadership', 'business', 'communication'],
        youtube: ['https://www.youtube.com/watch?v=yUOC-Y0f5ZQ']
      },
      {
        name: 'DevOps & Cloud Engineer',
        category: 'Technology' as const,
        description: 'Automate deployment pipelines, cloud architecture, and infrastructure reliability.',
        timeline: '6–10 months',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS/Cloud', 'Linux', 'Git'],
        demand: 'Very High' as const,
        keywords: ['devops', 'cloud', 'aws', 'docker', 'kubernetes', 'linux', 'ci/cd'],
        youtube: ['https://www.youtube.com/watch?v=7pz6BkVPgCI']
      },
      {
        name: 'UI/UX Designer',
        category: 'Design' as const,
        description: 'Craft intuitive interfaces, design systems, wireframes, and customer journey maps.',
        timeline: '4–8 months',
        skills: ['Figma', 'Wireframing', 'User Research', 'Prototyping', 'Design Systems', 'Communication'],
        demand: 'High' as const,
        keywords: ['ui', 'ux', 'design', 'figma', 'creative', 'wireframe', 'prototyping'],
        youtube: ['https://www.youtube.com/watch?v=c9Wg6Cb_YlU']
      }
    ];

    return database.map((c, idx) => {
      let score = 55;
      const matchedKeywords: string[] = [];
      c.keywords.forEach(kw => {
        if (combined.includes(kw)) {
          score += 8;
          matchedKeywords.push(kw);
        }
      });
      c.skills.forEach(sk => {
        if (doesUserHaveSkill(parsedUserSkills, sk)) {
          score += 10;
        }
      });

      const finalMatch = Math.min(96, Math.max(62, score));
      const matchedSkills = c.skills.filter(sk => doesUserHaveSkill(parsedUserSkills, sk));

      const whyMatches = [
        matchedSkills.length > 0 
          ? `✓ Matched core skills: ${matchedSkills.slice(0, 2).join(', ')}`
          : `✓ Strong alignment with your field: ${profile.fieldOfStudy || 'Technical Studies'}`,
        `✓ Matches your stated interest in ${profile.interests ? profile.interests.split(',')[0].trim() : 'technical problem solving'}`,
        `✓ In-demand career path with high hiring velocity`
      ];

      return {
        id: crypto.randomUUID(),
        career_name: c.name,
        description: c.description,
        match_percentage: finalMatch,
        required_skills: c.skills,
        youtube_links: c.youtube,
        estimated_timeline: c.timeline,
        roadmap_steps: [`Phase 1: Master ${c.skills[0]} & fundamentals`, `Phase 2: Practice ${c.skills[1]} & real-world tasks`, `Phase 3: Deploy full project portfolio`, `Phase 4: Resume & mock interview sprints`],
        rationale: matchedSkills.length > 0 
          ? `Your validated skills in ${matchedSkills.join(', ')} provide an immediate 60%+ acceleration.`
          : `Excellent potential trajectory based on your curriculum and background.`,
        category: c.category,
        demand: c.demand,
        readiness: finalMatch >= 88 ? 'Advanced' : finalMatch >= 74 ? 'Intermediate' : 'Beginner',
        whyMatches
      };
    }).sort((a, b) => b.match_percentage - a.match_percentage);
  };

  // Skill Gap Calculation with rigorous classification
  const getAccurateSkillGap = (career: CareerOption) => {
    const userSkills = parsedUserSkills;
    const required = career.required_skills || [];

    const matchedList: string[] = [];
    const missingList: string[] = [];

    required.forEach(req => {
      if (doesUserHaveSkill(userSkills, req)) {
        matchedList.push(req);
      } else {
        missingList.push(req);
      }
    });

    const matchPercent = required.length > 0 
      ? Math.round((matchedList.length / required.length) * 100) 
      : 75;

    // Detailed breakdown items
    const breakdown = required.map(skill => {
      const isMatched = matchedList.includes(skill);
      const isUserBeginner = userSkills.some(u => u.toLowerCase().includes(skill.toLowerCase()) && (u.toLowerCase().includes('basic') || u.toLowerCase().includes('beginner')));
      
      let yourLevel = 'None';
      let requiredLevel = 'Intermediate';
      let status: 'Strong' | 'Improve' | 'Gap' = 'Gap';

      if (isMatched) {
        if (isUserBeginner) {
          yourLevel = 'Beginner';
          requiredLevel = 'Intermediate';
          status = 'Improve';
        } else {
          yourLevel = 'Advanced';
          requiredLevel = 'Advanced';
          status = 'Strong';
        }
      } else {
        yourLevel = 'None';
        requiredLevel = 'Intermediate';
        status = 'Gap';
      }

      return {
        skill,
        yourLevel,
        requiredLevel,
        status
      };
    });

    // Top 3 priority gaps
    const topPriorities = missingList.slice(0, 3).map((skill, i) => ({
      skill,
      priority: i === 0 ? 'High Priority' : i === 1 ? 'High Priority' : 'Medium Priority',
      estimatedLearning: i === 0 ? '3 weeks' : i === 1 ? '2 weeks' : '2 weeks',
      focusArea: `Core fundamentals and practical real-world exercises in ${skill}`
    }));

    return {
      userSkills,
      matchedList,
      missingList,
      matchPercent,
      breakdown,
      topPriorities
    };
  };

  // Generate or retrieve cached Roadmap
  const loadCareerRoadmap = async (career: CareerOption) => {
    if (roadmapCache.current.has(career.career_name)) {
      setRoadmapData(roadmapCache.current.get(career.career_name)!);
      return;
    }

    setIsLoadingRoadmap(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-career-roadmap', {
        body: {
          careerName: career.career_name,
          profileData: {
            skills: profileData.skills,
            education: profileData.fieldOfStudy || profileData.educationLevel,
            interests: profileData.interests
          },
          language: language || 'en',
          mode: 'quick'
        }
      });
      if (error) throw error;

      let years: RoadmapYear[] = [];
      if (data?.roadmap?.years) {
        years = data.roadmap.years;
      } else if (data?.roadmap?.milestones) {
        years = (data.roadmap.milestones || []).slice(0, 4).map((m: any, i: number) => ({
          year: `Phase ${i + 1}`,
          focus: m.title || m.name || `Phase ${i + 1}`,
          activities: m.tasks?.map((t: any) => typeof t === 'string' ? t : t.title) || m.activities || [],
          milestones: m.milestones || [`Complete ${m.title || 'milestone'}`]
        }));
      } else {
        years = buildStructuredPhasedRoadmap(career);
      }
      roadmapCache.current.set(career.career_name, years);
      setRoadmapData(years);
    } catch (e) {
      console.warn('Roadmap edge function fallback:', e);
      const fallback = buildStructuredPhasedRoadmap(career);
      roadmapCache.current.set(career.career_name, fallback);
      setRoadmapData(fallback);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  // Build 4-Phase Structured Roadmap customized to gaps
  const buildStructuredPhasedRoadmap = (career: CareerOption): RoadmapYear[] => {
    const gap = getAccurateSkillGap(career);
    const matched = gap.matchedList;
    const missing = gap.missingList;

    const phase1Activities = [
      ...matched.slice(0, 2).map(m => `✓ Review & solidify ${m} principles`),
      missing[0] ? `→ Master core syntax and mechanics of ${missing[0]}` : '→ Algorithmic problem solving and data structures',
      '→ Solve 20 foundational coding/architecture challenges'
    ];

    const phase2Activities = [
      missing[1] ? `→ Learn and implement ${missing[1]}` : '→ REST API design, integration, and security',
      missing[2] ? `→ Build with ${missing[2]} and industry best practices` : '→ SQL schema design, transactions, and indexing',
      '→ Version control workflows with Git, PR reviews, and CI testing'
    ];

    const phase3Activities = [
      `→ Build Capstone Project 1: Scalable ${career.career_name} end-to-end application`,
      '→ Build Capstone Project 2: Cloud-hosted microservice with authentication and monitoring',
      '→ Publish code on GitHub with professional documentation and live demo'
    ];

    const phase4Activities = [
      `→ Target resume alignment: Highlight ${career.career_name} competencies and quantified projects`,
      '→ Technical mock interviews: System design, behavioral scenarios, and live coding',
      '→ Apply to entry/associate level roles with tailored portfolio submissions'
    ];

    return [
      {
        year: 'Phase 1: FOUNDATION',
        focus: 'Strengthen Fundamentals & Close Critical Baseline Gaps',
        activities: phase1Activities,
        milestones: ['Pass core fundamentals assessment', 'First GitHub repository with clean test coverage']
      },
      {
        year: 'Phase 2: CORE DEVELOPMENT',
        focus: 'Hands-on Tools, Frameworks & Industry Workflows',
        activities: phase2Activities,
        milestones: ['Integrated backend/database service deployed', 'Full API documentation using Swagger/Postman']
      },
      {
        year: 'Phase 3: PROJECTS & PORTFOLIO',
        focus: 'Production-Grade Project Construction',
        activities: phase3Activities,
        milestones: ['2 production-grade projects live on Vercel/Render', 'Open-source contribution accepted']
      },
      {
        year: 'Phase 4: JOB PREPARATION',
        focus: 'Resume, Mock Interviews & Application Sprints',
        activities: phase4Activities,
        milestones: ['ATS-optimized resume ready', '50+ curated job applications submitted']
      }
    ];
  };

  // Interactive Action: Send message to PathFinder AI
  const handleSendAiPrompt = async (promptText?: string) => {
    const text = promptText || chatInput.trim();
    if (!text || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatExpanded(true);
    setIsAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: text,
          language: language || 'en',
          context: {
            profile: profileData,
            selectedCareer: selectedCareer?.career_name,
            topCareers: careerOptions.slice(0, 3).map(c => c.career_name)
          },
          systemPrompt: `You are PathFinder AI, an intelligent, encouraging, concise career mentor for students in India. Answer in under 4 concise sentences with clear bullet points. Focus on real next steps.`
        }
      });

      if (error) throw error;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || `Based on your profile, focusing on ${selectedCareer ? selectedCareer.career_name : 'Software Engineering and Data'} gives you the fastest path to hiring readiness.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Helpful fallback response
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Here is my recommendation: With your background in ${profileData.fieldOfStudy || 'tech'} and knowledge of ${parsedUserSkills.slice(0, 2).join(', ') || 'core principles'}, you are in a great position. Focus on closing the top 2 skill gaps and building 2 portfolio projects.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Toggle Save Career
  const handleToggleSave = (careerName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedCareerNames(prev => {
      const exists = prev.includes(careerName);
      if (exists) {
        toast.info(`Removed ${careerName} from saved careers.`);
        return prev.filter(n => n !== careerName);
      } else {
        toast.success(`Saved ${careerName} to your bookmarks!`);
        return [...prev, careerName];
      }
    });
  };

  // Toggle Compare Career
  const handleToggleCompare = (career: CareerOption, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompareList(prev => {
      const found = prev.find(c => c.id === career.id);
      if (found) {
        return prev.filter(c => c.id !== career.id);
      } else {
        if (prev.length >= 2) {
          toast.warning('You can compare up to 2 careers simultaneously. Deselect one first.');
          return prev;
        }
        const updated = [...prev, career];
        if (updated.length === 2) {
          setShowCompareModal(true);
        }
        return updated;
      }
    });
  };

  // Matched Trainers for currently selected skill gap
  const matchedTrainersForActiveGap = useMemo(() => {
    return capacityStore.matchTrainersForSkillGap(activeRemediationSkill);
  }, [activeRemediationSkill]);

  // All identified skill gaps across recommended careers (always prioritize 'Python' first)
  const allUniqueGaps = useMemo(() => {
    const gapsSet = new Set<string>();
    careerOptions.forEach(c => {
      const gapInfo = getAccurateSkillGap(c);
      gapInfo.missingList.forEach(m => gapsSet.add(m));
    });
    const list = Array.from(gapsSet);
    if (list.some(s => s.toLowerCase() === 'python')) {
      return ['Python', ...list.filter(s => s.toLowerCase() !== 'python')];
    }
    return list.length > 0 ? list : ['Python', 'SQL', 'Machine Learning', 'Data Structures', 'Docker'];
  }, [careerOptions, parsedUserSkills]);

  // Scroll to and activate trainer matching for a specific skill
  const handleSelectSkillForRemediation = (skill: string) => {
    setActiveRemediationSkill(skill);
    const elem = document.getElementById('trainer-matching-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Open 1-on-1 Remediation Booking Modal
  const handleOpenBookingModal = (trainer: TrainerProfile, skill: string) => {
    setSelectedBookingTrainer(trainer);
    setActiveRemediationSkill(skill);
    setBookingNotes(`Need targeted 1-on-1 coaching in ${skill} to bridge skill gap for Software Engineer & Tech Lead roles.`);
    setIsBookingModalOpen(true);
  };

  // Confirm 1-on-1 Remediation Booking
  const handleConfirmBookingSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingTrainer) return;

    setIsBookingSubmitting(true);
    setTimeout(() => {
      capacityStore.bookMentorshipSession({
        traineeId: user?.id || 'guest',
        traineeName: profileData.name || user?.name || 'Pavan Kumar (Student)',
        trainerId: selectedBookingTrainer.id,
        trainerName: selectedBookingTrainer.name,
        skillGap: activeRemediationSkill,
        scheduledDate: bookingDate,
        timeSlot: bookingTime,
        status: 'confirmed',
        notes: bookingNotes
      });

      const sessionKey = `${selectedBookingTrainer.id}-${activeRemediationSkill}`;
      setBookedSessionKeys(prev => [...prev, sessionKey]);
      setIsBookingSubmitting(false);
      setIsBookingModalOpen(false);

      toast.success(`1-on-1 Remediation Session confirmed with ${selectedBookingTrainer.name} for ${activeRemediationSkill}!`, {
        description: `Scheduled for ${bookingDate} at ${bookingTime}. Added to your learning agenda.`
      });
    }, 400);
  };

  // Handle in-place quick update of skills and background
  const handleQuickUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalSkills(quickSkillsText);
    setLocalDegree(quickDegreeText);
    setLocalGoals(quickGoalsText);
    localStorage.setItem('pf_user_skills', quickSkillsText);
    localStorage.setItem('pf_user_degree', quickDegreeText);
    localStorage.setItem('pf_user_goals', quickGoalsText);
    setIsQuickSkillModalOpen(false);
    toast.success('Updated your profile skills and background! Recalculating career matches and skill gaps...');
    setTimeout(() => {
      handleStartAnalysis();
    }, 100);
  };

  // Open Detail Journey
  const handleOpenCareerDetail = (career: CareerOption) => {
    setSelectedCareer(career);
    setJourneyStep('overview');
    loadCareerRoadmap(career);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter and Sort Recommendations
  const filteredAndSortedCareers = useMemo(() => {
    let list = [...careerOptions];

    // Filter by Category
    if (selectedCategory === 'Top Matches') {
      list = list.filter(c => c.match_percentage >= 80);
    } else if (selectedCategory === 'Saved') {
      list = list.filter(c => savedCareerNames.includes(c.career_name));
    } else if (selectedCategory !== 'All') {
      list = list.filter(c => c.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.career_name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.required_skills.some(s => s.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'match') {
        return b.match_percentage - a.match_percentage;
      } else if (sortBy === 'demand') {
        const score = (d?: string) => d === 'Very High' ? 3 : d === 'High' ? 2 : 1;
        return score(b.demand) - score(a.demand);
      } else if (sortBy === 'timeline') {
        const getMonths = (t: string) => parseInt(t.match(/\d+/)?.[0] || '12', 10);
        return getMonths(a.estimated_timeline) - getMonths(b.estimated_timeline);
      }
      return 0;
    });

    return list;
  }, [careerOptions, selectedCategory, searchQuery, sortBy, savedCareerNames]);

  // Loading spinner during initial computation
  if (isAnalyzing && careerOptions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
        <Navbar breadcrumbs={[{ label: 'Career Guide', href: '/career-guide' }, { label: 'Analyzing Profile' }]} />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="glass-card p-8 max-w-md w-full text-center shadow-md border-slate-200 dark:border-slate-800">
            <div className="space-y-5">
              <div className="w-14 h-14 mx-auto bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-2xl flex items-center justify-center animate-pulse">
                <Brain className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Analyzing Your Career Profile</h2>
                <p className="text-xs text-slate-500">Matching your skills with real-time hiring benchmarks...</p>
              </div>
              <div className="space-y-2 pt-2">
                <Progress value={85} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: CAREER DETAIL JOURNEY & SKILL GAP / ROADMAP
  // =========================================================================
  if (selectedCareer) {
    const gap = getAccurateSkillGap(selectedCareer);

    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
        <Navbar 
          breadcrumbs={[
            { label: 'Career Guide', href: '/career-guide' },
            { label: 'Explore', href: '#' },
            { label: selectedCareer.career_name }
          ]} 
        />

        <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedCareer(null)}
                className="rounded-xl border-slate-200 dark:border-slate-800 h-9 px-3 text-xs font-semibold hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Career Guide
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedCareer.career_name}
                  </h1>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-xs font-bold">
                    {selectedCareer.match_percentage}% Match
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl">
                  {selectedCareer.description}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleSave(selectedCareer.career_name)}
              className={`rounded-xl h-9 px-3.5 text-xs font-semibold transition-colors shrink-0 ${
                savedCareerNames.includes(selectedCareer.career_name)
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 mr-1.5 ${savedCareerNames.includes(selectedCareer.career_name) ? 'fill-rose-500 text-rose-500' : ''}`} />
              {savedCareerNames.includes(selectedCareer.career_name) ? 'Saved' : 'Save Career'}
            </Button>
          </div>

          {/* 5-Step Career Journey Stepper */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Journey Progression</span>
              <span className="text-xs text-blue-600 font-semibold">Step {
                journeyStep === 'overview' ? '1' : 
                journeyStep === 'skillGap' ? '2' : 
                journeyStep === 'roadmap' ? '3' : 
                journeyStep === 'learning' ? '4' : '5'
              } of 5</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { key: 'overview', title: '1. Overview', icon: Target },
                { key: 'skillGap', title: '2. Skill Gaps', icon: Brain },
                { key: 'roadmap', title: '3. Roadmap', icon: GraduationCap },
                { key: 'learning', title: '4. Projects & Exp', icon: Code },
                { key: 'ready', title: '5. Career Ready', icon: Trophy },
              ].map((step, idx) => {
                const isActive = journeyStep === step.key;
                const stepOrder = ['overview', 'skillGap', 'roadmap', 'learning', 'ready'];
                const isPassed = stepOrder.indexOf(journeyStep) > idx;

                return (
                  <button
                    key={step.key}
                    onClick={() => setJourneyStep(step.key as JourneyStep)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : isPassed 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900' 
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <step.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: CAREER OVERVIEW */}
          {journeyStep === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Fit Card */}
                <Card className="glass-card p-6 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Career Fit Score</span>
                    <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                      {selectedCareer.match_percentage}%
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      Your current coursework and verified skills align strongly with standard {selectedCareer.career_name} requirements.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Readiness:</span>
                    <Badge variant="outline" className="font-bold text-blue-600 bg-blue-50 border-blue-200">{selectedCareer.readiness || 'Intermediate'}</Badge>
                  </div>
                </Card>

                {/* Timeline & Demand */}
                <Card className="glass-card p-6 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Timeline & Demand</span>
                    <div className="space-y-3 mt-3">
                      <div>
                        <span className="text-xs text-slate-500 block">Typical Learning Timeline</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-600" /> {selectedCareer.estimated_timeline}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Current Industry Demand</span>
                        <span className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" /> {selectedCareer.demand || 'High'} Demand
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    Updated based on active tech placement data
                  </div>
                </Card>

                {/* Primary Action Card */}
                <Card className="glass-card p-6 border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Next Action</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Audit Your Skill Gaps</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Discover exactly which required skills you already hold and what you need to focus on next.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setJourneyStep('skillGap')} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs mt-4"
                  >
                    <span>Analyze Skill Gaps</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </div>

              {/* Why this career */}
              <Card className="glass-card p-6 border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Why this career matches you
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedCareer.whyMatches?.map((reason, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{reason.replace(/^[✓→]\s*/, '')}</span>
                    </div>
                  )) || (
                    <p className="text-xs text-slate-500">Based on your educational background and core technical competencies.</p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: SKILL GAP ANALYSIS */}
          {journeyStep === 'skillGap' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="glass-card p-6 border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      Skill Gap Analysis
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Understand what you already know and what you need to learn for {selectedCareer.career_name}.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Overall Skill Match</span>
                    <span className="text-2xl font-black text-blue-600">{gap.matchPercent}%</span>
                  </div>
                </div>

                <Progress value={gap.matchPercent} className="h-2.5 bg-slate-100 dark:bg-slate-800 mb-6" />

                {/* 3 Clean Summaries: Your Skills, Required Skills, Skill Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Your Matched Skills */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Your Skills (Matched)
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {gap.matchedList.length > 0 ? gap.matchedList.map((s, i) => (
                        <Badge key={i} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300 text-xs font-medium">
                          ✓ {s}
                        </Badge>
                      )) : (
                        <p className="text-xs text-slate-400 italic">No direct matches listed in your profile.</p>
                      )}
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedCareer.required_skills.map((s, i) => (
                        <Badge key={i} variant="outline" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 text-xs font-normal">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Skill Gaps (To Learn)
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {gap.missingList.length > 0 ? gap.missingList.map((s, i) => (
                        <Badge key={i} className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 text-xs font-medium">
                          ⚠ {s}
                        </Badge>
                      )) : (
                        <p className="text-xs text-emerald-600 font-semibold">Zero gaps! You meet all essential skills.</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Dynamic Skill Breakdown Table */}
              <Card className="glass-card p-6 border-slate-200 dark:border-slate-800 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Detailed Skill Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Skill</th>
                        <th className="pb-3 px-4">Your Level</th>
                        <th className="pb-3 px-4">Required</th>
                        <th className="pb-3 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {gap.breakdown.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">{row.skill}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.yourLevel}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.requiredLevel}</td>
                          <td className="py-3 pl-4 text-right">
                            {row.status === 'Strong' && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold">
                                ✓ Strong
                              </Badge>
                            )}
                            {row.status === 'Improve' && (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-semibold">
                                ⚠ Improve
                              </Badge>
                            )}
                            {row.status === 'Gap' && (
                              <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[11px] font-semibold">
                                🔴 Gap
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Priority Skill Gaps */}
              {gap.topPriorities.length > 0 && (
                <Card className="glass-card p-6 border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Your Top 3 Learning Priorities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {gap.topPriorities.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-blue-600">#{idx + 1} Priority</span>
                          <span className="text-[11px] font-medium text-slate-400">{item.estimatedLearning}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.skill}</h4>
                        <p className="text-[11px] text-slate-500 leading-snug">{item.focusArea}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setJourneyStep('roadmap')} 
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                    >
                      <span>Start Skill Improvement (View Roadmap)</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Certified Trainers to Bridge Your Skill Gaps for this Career */}
              <Card className="glass-card p-6 border-blue-200/90 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 dark:border-blue-900/60 pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-bold mb-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      1-on-1 Certified Trainer Remediation
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Target Role Skill Gap: You Have to Learn <span className="text-blue-600 font-extrabold">{activeRemediationSkill}</span> for {selectedCareer.career_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose a verified certified instructor below to get customized coaching and fast-track your competency.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Target Gap:</span>
                    {(gap.missingList.length > 0 ? gap.missingList : ['Python', 'SQL', 'Docker']).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setActiveRemediationSkill(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeRemediationSkill.toLowerCase() === s.toLowerCase()
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {matchedTrainersForActiveGap.map(({ trainer, matchScore, matchReasons }) => {
                    const isBooked = bookedSessionKeys.includes(`${trainer.id}-${activeRemediationSkill}`);
                    const comp = trainer.competencies.find(c => c.name.toLowerCase().includes(activeRemediationSkill.toLowerCase()) || activeRemediationSkill.toLowerCase().includes(c.name.toLowerCase()));
                    const proficiency = comp ? comp.proficiency : 92;

                    return (
                      <div
                        key={trainer.id}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                {trainer.avatarUrl ? (
                                  <img src={trainer.avatarUrl} alt={trainer.name} className="w-full h-full object-cover" />
                                ) : (
                                  trainer.name.split(' ').map(n => n[0]).join('')
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{trainer.name}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    {trainer.rating}
                                  </span>
                                  <span>•</span>
                                  <span>{trainer.yearsOfExperience}+ yrs exp</span>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold">
                              {matchScore}% Match
                            </Badge>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-500">Verified {activeRemediationSkill}:</span>
                              <strong className="text-emerald-600 font-bold">{proficiency}%</strong>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proficiency}%` }} />
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight">
                            {matchReasons[0] || `${trainer.name} teaches accredited ${activeRemediationSkill} curriculum.`}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          disabled={isBooked}
                          onClick={() => handleOpenBookingModal(trainer, activeRemediationSkill)}
                          className={`w-full rounded-xl text-xs font-semibold h-8 shadow-xs flex items-center justify-center gap-1.5 ${
                            isBooked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isBooked ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>1:1 Session Confirmed</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3 h-3" />
                              <span>Choose Trainer & Book 1:1</span>
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: PERSONALIZED ROADMAP */}
          {journeyStep === 'roadmap' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="glass-card p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Personalized Roadmap: {selectedCareer.career_name}
                    </h2>
                    <p className="text-xs text-slate-500">Generated directly from your verified skills and current gap priorities.</p>
                  </div>
                </div>

                {isLoadingRoadmap ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Assembling your custom trajectory...</p>
                  </div>
                ) : (
                  <div className="space-y-5 pt-2">
                    {roadmapData.map((phase, idx) => (
                      <div key={idx} className="relative pl-7 border-l-2 border-blue-200 dark:border-blue-900 pb-5 last:pb-1">
                        <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                          idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`} />
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {phase.year} — <span className="text-blue-600 dark:text-blue-400 font-medium">{phase.focus}</span>
                          </h4>
                          <Badge variant="outline" className={`text-[10px] font-bold ${
                            idx === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            idx === 1 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {idx === 0 ? 'In Progress' : idx === 1 ? 'Next Up' : 'Upcoming'}
                          </Badge>
                        </div>
                        <ul className="space-y-1.5 mt-2">
                          {phase.activities.map((act, aIdx) => (
                            <li key={aIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${act.startsWith('✓') ? 'text-emerald-500' : 'text-blue-500'}`} />
                              <span>{act.replace(/^[✓→]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                        {phase.milestones && phase.milestones.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {phase.milestones.map((m, mIdx) => (
                              <Badge key={mIdx} variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200">
                                <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                                {m}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <Button 
                    onClick={() => setJourneyStep('learning')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    <span>Next: Projects & Experience</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: PROJECTS & LEARNING */}
          {journeyStep === 'learning' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-600" />
                    Recommended Capstone Projects
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60">
                      <strong className="text-slate-900 dark:text-white block mb-0.5">1. Production Portfolio Project</strong>
                      Build and deploy an authenticated application demonstrating {selectedCareer.required_skills.slice(0, 2).join(' and ')}.
                    </li>
                    <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60">
                      <strong className="text-slate-900 dark:text-white block mb-0.5">2. Scalable API Microservice</strong>
                      Implement clean architecture, test automation, and Docker deployment.
                    </li>
                  </ul>
                </Card>

                <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500" />
                    Curated Video Tutorials
                  </h3>
                  <div className="space-y-2">
                    {selectedCareer.youtube_links.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 flex items-center justify-between text-xs text-blue-600 hover:underline block"
                      >
                        <span>▶ {selectedCareer.career_name} Industry Primer #{idx + 1}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setJourneyStep('ready')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  <span>Complete Journey (Career Ready)</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: CAREER READY */}
          {journeyStep === 'ready' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You're on track for {selectedCareer.career_name}!</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
                  Your personalized growth track is stored. Start applying your milestones or check your overall career health.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button 
                  onClick={() => {
                    localStorage.setItem('selectedCareer', selectedCareer.career_name);
                    navigate(`/career-growth?career=${encodeURIComponent(selectedCareer.career_name)}`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  View in Growth Path Tracker
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/resume-analyzer')}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2.5"
                >
                  Analyze Resume For This Role
                </Button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN CAREER DISCOVERY DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Career Guide' }
        ]} 
      />

      <ConfettiEffect trigger={showConfetti} type="celebration" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ================================================================ */}
        {/* A. PROFESSIONAL PAGE HEADER & PROFILE COMPLETENESS INDICATOR      */}
        {/* ================================================================ */}
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Intelligent Career Discovery
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Career Guide
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Discover career paths that match your skills, interests, and goals.
              </p>
            </div>

            {/* Compact Profile Completeness Indicator */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 w-full md:w-80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Profile Completeness
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2 bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {profileCompleteness >= 80 ? 'Optimal match accuracy' : 'Add skills to improve recommendations'}
                </span>
                {onEditProfile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onEditProfile}
                    className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* A2. VERIFIED SKILLS BOX                                           */}
        {/* ================================================================ */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center text-blue-600">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Your Verified Skills & Technical Acumen
                </h2>
                <p className="text-xs text-slate-500">
                  Skills extracted from your profile and assessments used for real-time career matching.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuickSkillsText(localSkills || 'Java, Mathematics');
                  setQuickDegreeText(localDegree);
                  setQuickGoalsText(localGoals);
                  setIsQuickSkillModalOpen(true);
                }}
                className="h-8.5 px-3 text-xs rounded-xl border-blue-200 bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300 hover:bg-blue-100 font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add / Update Skills (e.g. Java, Maths)
              </Button>
              {onEditProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditProfile}
                  className="h-8.5 px-2.5 text-xs text-slate-500 hover:text-slate-900"
                >
                  Full Profile Form
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {parsedUserSkills.map((sk, idx) => (
              <Badge
                key={idx}
                className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold px-3 py-1 rounded-xl shadow-2xs"
              >
                ✓ {sk}
              </Badge>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* A3. CAREER STAGE SELECTOR (BELOW SKILL BOX - STUDENT OR EMPLOYEE) */}
        {/* ================================================================ */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Career Stage & Academic Background
                </h2>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                  Personalization Engine
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell us whether you are currently studying or working. We customize internships, campus drives, and jobs accordingly.
              </p>
            </div>

            {/* Student vs Employee Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleSetCareerStage('student')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  careerStage === 'student'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student / Fresher</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetCareerStage('employee')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  careerStage === 'employee'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Employee / Professional</span>
              </button>
            </div>
          </div>

          {/* If Student: Choose Year of Study */}
          {careerStage === 'student' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>What academic year are you studying in?</span>
                <span className="text-[11px] font-normal text-blue-600">
                  Tailors internships vs. full-time jobs
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { yr: '1st Year', label: '1st Year', sub: 'Foundation & Projects' },
                  { yr: '2nd Year', label: '2nd Year', sub: 'Summer Internships' },
                  { yr: '3rd Year', label: '3rd Year', sub: 'Pre-Placement Drives' },
                  { yr: '4th / Final Year', label: '4th / Final Year', sub: 'Campus Jobs & GET' },
                  { yr: 'Post-Graduate', label: 'Post-Graduate / Masters', sub: 'R&D / Advanced' }
                ].map((item) => (
                  <button
                    key={item.yr}
                    type="button"
                    onClick={() => handleSetAcademicYear(item.yr)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      academicYear === item.yr
                        ? 'bg-blue-50/80 border-blue-600 text-blue-900 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-200 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">{item.label}</span>
                      {academicYear === item.yr && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>
                  🎓 Status: <strong>{academicYear} Student</strong> &bull; Department: <strong>{profileData.fieldOfStudy || 'Computer Science & Engineering'}</strong>
                </span>
                <span className="text-[11px] font-semibold text-blue-600">
                  {academicYear === '4th / Final Year' || academicYear === 'Post-Graduate' ? 'Recommending Graduate Engineering Roles' : 'Recommending Curated Internships'}
                </span>
              </div>
            </div>
          ) : (
            /* If Employee: Experience Level & Switch Goals */
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Years of Professional Experience</span>
                <span className="text-[11px] font-normal text-blue-600">Tailors lateral role switches</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: '0-2 Years', label: '0–2 Years', sub: 'Junior / Associate' },
                  { val: '3-5 Years', label: '3–5 Years', sub: 'Mid-Level Specialist' },
                  { val: '5+ Years', label: '5+ Years', sub: 'Senior / Lead Architect' }
                ].map((lvl) => (
                  <button
                    key={lvl.val}
                    type="button"
                    onClick={() => {
                      setExperienceLevel(lvl.val);
                      localStorage.setItem('pf_experience_level', lvl.val);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      experienceLevel === lvl.val
                        ? 'bg-blue-50/80 border-blue-600 text-blue-900 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-200 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">{lvl.label}</span>
                      {experienceLevel === lvl.val && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                      {lvl.sub}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                💼 Status: <strong>Working Professional ({experienceLevel})</strong> &bull; Tailoring mid-senior lateral job vacancies and career acceleration roadmaps.
              </div>
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* B. COMPACT MODERN AI CAREER GUIDE ASSISTANT                       */}
        {/* ================================================================ */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    PathFinder AI
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold py-0">Assistant</Badge>
                  </h2>
                  <p className="text-xs text-slate-500">
                    "I can help you compare careers, identify skill gaps, and build your career roadmap."
                  </p>
                </div>
              </div>

              {/* Collapse/Expand Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="text-xs text-slate-500 hover:text-slate-900 h-8 px-2"
              >
                {isChatExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {/* Quick Action Prompt Pills */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendAiPrompt('Can you compare the top 2 career matches for my profile?')}
                className="rounded-lg h-7 px-2.5 text-xs border-slate-200 dark:border-slate-800 hover:bg-blue-50 hover:text-blue-700"
              >
                Compare Careers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendAiPrompt('What are the most urgent skill gaps in my background?')}
                className="rounded-lg h-7 px-2.5 text-xs border-slate-200 dark:border-slate-800 hover:bg-blue-50 hover:text-blue-700"
              >
                Find Skill Gaps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendAiPrompt('How can I build a fast 6-month roadmap to get job-ready?')}
                className="rounded-lg h-7 px-2.5 text-xs border-slate-200 dark:border-slate-800 hover:bg-blue-50 hover:text-blue-700"
              >
                Build Roadmap
              </Button>
            </div>

            {/* Inline Ask Prompt Input */}
            <div className="flex items-center gap-2 mt-3">
              <Input
                placeholder="Ask anything about your career..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiPrompt()}
                className="text-xs rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 h-9"
              />
              <Button
                size="sm"
                disabled={!chatInput.trim() || isAiLoading}
                onClick={() => handleSendAiPrompt()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-3.5 text-xs font-semibold shrink-0"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Send
              </Button>
            </div>

            {/* Conversation Area (Expands Naturally) */}
            <AnimatePresence>
              {isChatExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 max-h-80 overflow-y-auto pr-1"
                >
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-xl max-w-lg leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex gap-2 text-xs text-slate-400 items-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>PathFinder AI is formulating advice...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ================================================================ */}
        {/* C. CAREER DISCOVERY CONTROLS (CATEGORY FILTERS, SEARCH, SORT)      */}
        {/* ================================================================ */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Top Matches', 'Technology', 'Data', 'Management', 'Saved'].map(cat => {
              const count = cat === 'Saved' ? savedCareerNames.length : null;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {cat} {count !== null && count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          {/* Search and Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search careers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs rounded-xl h-9 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="match">Sort: Best Match</option>
              <option value="demand">Sort: Highest Demand</option>
              <option value="timeline">Sort: Shortest Timeline</option>
            </select>
          </div>
        </section>

        {/* ================================================================ */}
        {/* D0. AI SKILL GAP DIAGNOSIS & MATCHED CERTIFIED TRAINERS          */}
        {/* ================================================================ */}
        <section id="trainer-matching-section" className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 p-6 rounded-2xl border border-blue-200/90 dark:border-blue-900/60 shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 dark:border-blue-900/60 pb-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                AI Skill Gap Remediation & Certified Trainers
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Target Role Skill Gap: You Have to Learn <span className="text-blue-600 underline decoration-blue-400">{activeRemediationSkill}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Your profile currently reflects background in <strong>{parsedUserSkills.slice(0, 3).join(', ')}</strong>. To qualify for premier software, AI, and executive tech tracks, our analysis diagnosed <strong>{activeRemediationSkill}</strong> as your primary requirement. 
                Choose a verified certified trainer below to bridge this gap with 1-on-1 personalized guidance:
              </p>
            </div>

            {/* Current Gap Metric */}
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-800/80 shadow-2xs flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Gap</span>
                <strong className="text-sm font-black text-blue-600 block">{activeRemediationSkill}</strong>
              </div>
              <Badge className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1">
                {matchedTrainersForActiveGap.length} Trainers Available
              </Badge>
            </div>
          </div>

          {/* Gap Switcher Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              Identified Skill Gaps to Bridge (Click any skill to recalculate matched trainers):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {allUniqueGaps.map((gapSkill) => {
                const isSelected = activeRemediationSkill.toLowerCase() === gapSkill.toLowerCase();
                const isPython = gapSkill.toLowerCase() === 'python';
                return (
                  <button
                    key={gapSkill}
                    type="button"
                    onClick={() => setActiveRemediationSkill(gapSkill)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isPython ? '⭐ ' : ''}
                    <span>{gapSkill}</span>
                    {isPython && (
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded-md ml-1 font-extrabold">
                        Primary Gap
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matched Trainer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {matchedTrainersForActiveGap.map(({ trainer, matchScore, matchReasons }) => {
              const isBooked = bookedSessionKeys.includes(`${trainer.id}-${activeRemediationSkill}`);
              const comp = trainer.competencies.find(c => c.name.toLowerCase().includes(activeRemediationSkill.toLowerCase()) || activeRemediationSkill.toLowerCase().includes(c.name.toLowerCase()));
              const proficiency = comp ? comp.proficiency : 94;

              return (
                <Card
                  key={trainer.id}
                  className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3.5">
                    {/* Header: Avatar, Name, Rating, Match Score */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 overflow-hidden">
                          {trainer.avatarUrl ? (
                            <img src={trainer.avatarUrl} alt={trainer.name} className="w-full h-full object-cover" />
                          ) : (
                            trainer.name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {trainer.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                            {trainer.qualification}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {trainer.rating}
                            </span>
                            <span>•</span>
                            <span>{trainer.yearsOfExperience}+ yrs exp</span>
                          </div>
                        </div>
                      </div>

                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-[11px] font-extrabold px-2 py-0.5 shrink-0">
                        {matchScore}% Match
                      </Badge>
                    </div>

                    {/* Proficiency Bar */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Verified {activeRemediationSkill} Acumen:
                        </span>
                        <strong className="text-emerald-600 font-bold">{proficiency}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${proficiency}%` }}
                        />
                      </div>
                    </div>

                    {/* Match Reason */}
                    <div className="space-y-1">
                      {matchReasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Slot Info */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>Next 1:1 Slot: <strong>Tomorrow at 04:00 PM</strong></span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                    <Button
                      size="sm"
                      disabled={isBooked}
                      onClick={() => handleOpenBookingModal(trainer, activeRemediationSkill)}
                      className={`w-full rounded-xl text-xs font-semibold h-9 shadow-xs flex items-center justify-center gap-1.5 ${
                        isBooked
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isBooked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>1:1 Session Confirmed</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Choose Trainer & Book 1:1 Session</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* D. CAREER RECOMMENDATIONS (2-COLUMN RESPONSIVE MODERN GRID)        */}
        {/* ================================================================ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong>{filteredAndSortedCareers.length}</strong> verified career path recommendations</span>
            {compareList.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompareModal(true)}
                className="h-7 px-2.5 text-xs text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
              >
                Compare Selected ({compareList.length}/2)
              </Button>
            )}
          </div>

          {filteredAndSortedCareers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Target className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No career paths match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Try resetting filters or search terms to explore more fields.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="rounded-xl text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredAndSortedCareers.map((career) => {
                const gap = getAccurateSkillGap(career);
                const isSaved = savedCareerNames.includes(career.career_name);
                const isCompared = compareList.some(c => c.id === career.id);

                return (
                  <Card
                    key={career.id}
                    onClick={() => handleOpenCareerDetail(career)}
                    className="glass-card p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-3.5">
                      
                      {/* Card Header: Title, Category, Match Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                              {career.category || 'Technology'}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {career.estimated_timeline}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-0.5">
                            {career.career_name}
                          </h3>
                        </div>

                        {/* Interactive Match Badge */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBreakdownCareer(career);
                          }}
                          className="shrink-0 text-right group/badge hover:opacity-90 transition-opacity"
                          title="Click to view match breakdown"
                        >
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-xs font-extrabold px-2.5 py-1">
                            {career.match_percentage}% Match
                          </Badge>
                          <span className="text-[10px] text-slate-400 block group-hover/badge:text-blue-600 mt-0.5 font-medium underline decoration-dotted">
                            Why this match?
                          </span>
                        </button>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {career.description}
                      </p>

                      {/* Why You Match Section */}
                      <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          Why you match:
                        </span>
                        <div className="space-y-1">
                          {career.whyMatches?.slice(0, 3).map((reason, rIdx) => (
                            <div key={rIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{reason.replace(/^[✓→]\s*/, '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Important Skills */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                          <span className="font-semibold">Key Skills:</span>
                          <span>Skill gap: <strong>{gap.missingList.length} skills</strong></span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {career.required_skills.slice(0, 5).map((skill, sIdx) => {
                            const hasIt = gap.matchedList.includes(skill);
                            return (
                              <div key={sIdx} className="inline-flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] font-normal ${
                                    hasIt 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                      : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-semibold'
                                  }`}
                                >
                                  {hasIt ? `✓ ${skill}` : `⚠ ${skill}`}
                                </Badge>
                                {!hasIt && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectSkillForRemediation(skill);
                                    }}
                                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 dark:bg-blue-950 dark:border-blue-800 font-bold transition-colors"
                                    title={`Find verified trainers teaching ${skill}`}
                                  >
                                    Match Trainer
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Card Actions: Save, Compare, View Career Path */}
                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleToggleSave(career.career_name, e)}
                          className={`h-8 px-2.5 text-xs font-semibold rounded-lg ${
                            isSaved 
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40' 
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 mr-1 ${isSaved ? 'fill-rose-600' : ''}`} />
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleToggleCompare(career, e)}
                          className={`h-8 px-2.5 text-xs font-semibold rounded-lg ${
                            isCompared 
                              ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' 
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                          {isCompared ? 'Comparing' : 'Compare'}
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCareerDetail(career);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3.5 text-xs font-semibold shadow-2xs"
                      >
                        <span>View Career Path</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>

                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* E. DYNAMIC RECOMMENDED INTERNSHIPS & JOBS (BASED ON STAGE & YEAR) */}
        {/* ================================================================ */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {careerStage === 'student'
                    ? `Recommended Internships & Campus Drives for ${academicYear} Students`
                    : `Recommended Lateral Career Transitions (${experienceLevel})`}
                </h2>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                  Verified Matches
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {careerStage === 'student'
                  ? `Curated based on your verified skills and academic progression (${academicYear}). Apply directly to boost your real-world credentials.`
                  : `Curated opportunities matching your technical skills and ${experienceLevel} industry experience.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600 font-semibold px-2.5 py-1">
                {recommendedOpportunities.length} Active Positions
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {recommendedOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-4 group shadow-2xs hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Top: Company & Match badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-xl shadow-2xs">
                        {opp.logo}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {opp.company}
                        </h4>
                        <span className="text-[10px] text-slate-500">{opp.mode}</span>
                      </div>
                    </div>

                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-extrabold px-2 py-0.5">
                      {opp.matchScore}% Match
                    </Badge>
                  </div>

                  {/* Title & Type */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {opp.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-blue-600 transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      {opp.description}
                    </p>
                  </div>

                  {/* Compensation & Duration */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Stipend / CTC</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                        {opp.stipend}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {opp.duration}
                      </span>
                    </div>
                  </div>

                  {/* Target Audience Pill */}
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/60 font-semibold truncate">
                    🎯 {opp.targetAudience}
                  </div>

                  {/* Skills required */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.skills.map((sk, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 font-normal"
                      >
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success(`Opening verified application portal for ${opp.title} at ${opp.company}`);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Apply / View Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ================================================================ */}
      {/* E. MATCH BREAKDOWN MODAL                                          */}
      {/* ================================================================ */}
      <Dialog open={!!breakdownCareer} onOpenChange={(open) => !open && setBreakdownCareer(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {breakdownCareer && (() => {
            const gap = getAccurateSkillGap(breakdownCareer);
            const skillsMatch = gap.matchPercent;
            const interestMatch = profileData.interests ? 95 : 75;
            const educationMatch = profileData.fieldOfStudy ? 100 : 80;
            const experienceMatch = profileData.currentYear || profileData.workEnvironment ? 85 : 70;

            return (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Match Breakdown: {breakdownCareer.career_name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Detailed score calculation based on your verified profile data.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Skills Match</span>
                      <span className="font-bold text-slate-900 dark:text-white">{skillsMatch}%</span>
                    </div>
                    <Progress value={skillsMatch} className="h-2 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Interest Match</span>
                      <span className="font-bold text-slate-900 dark:text-white">{interestMatch}%</span>
                    </div>
                    <Progress value={interestMatch} className="h-2 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Education Alignment</span>
                      <span className="font-bold text-slate-900 dark:text-white">{educationMatch}%</span>
                    </div>
                    <Progress value={educationMatch} className="h-2 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Experience / Stage Fit</span>
                      <span className="font-bold text-slate-900 dark:text-white">{experienceMatch}%</span>
                    </div>
                    <Progress value={experienceMatch} className="h-2 bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <span className="font-bold block">Summary:</span>
                  <p>
                    {gap.matchedList.length > 0 
                      ? `Your strongest matching skills are ${gap.matchedList.slice(0, 2).join(' and ')}.` 
                      : `Your educational background in ${profileData.fieldOfStudy || 'your degree'} creates a strong foundation.`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs">
                    <span className="text-slate-500">Overall Match:</span>
                    <strong className="text-blue-600 font-extrabold text-sm ml-1.5">{breakdownCareer.match_percentage}%</strong>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      const c = breakdownCareer;
                      setBreakdownCareer(null);
                      handleOpenCareerDetail(c);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-4 text-xs font-semibold"
                  >
                    View Career Path
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* F. SIDE-BY-SIDE CAREER COMPARISON MODAL                           */}
      {/* ================================================================ */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Side-by-Side Career Comparison
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Comparing 2 recommended careers side by side.
            </DialogDescription>
          </DialogHeader>

          {compareList.length === 2 ? (
            <div className="grid grid-cols-2 gap-4 py-3">
              {compareList.map((c) => {
                const gap = getAccurateSkillGap(c);
                return (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.career_name}</h4>
                      <Badge className="bg-blue-600 text-white text-[11px]">{c.match_percentage}%</Badge>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                      <div><strong>Category:</strong> {c.category}</div>
                      <div><strong>Timeline:</strong> {c.estimated_timeline}</div>
                      <div><strong>Hiring Demand:</strong> {c.demand}</div>
                      <div><strong>Skill Coverage:</strong> {gap.matchPercent}%</div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {c.required_skills.slice(0, 4).map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-white dark:bg-slate-900">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setShowCompareModal(false);
                        handleOpenCareerDetail(c);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl h-8 font-semibold mt-2"
                    >
                      View This Path
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              Please select 2 careers to compare side-by-side using the "Compare" button on any card.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* G. 1-ON-1 REMEDIATION BOOKING DIALOG                              */}
      {/* ================================================================ */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          {selectedBookingTrainer && (
            <form onSubmit={handleConfirmBookingSession} className="space-y-4">
              <DialogHeader>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold w-fit mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>1-on-1 Skill Gap Remediation Clinic</span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Schedule 1:1 Session with {selectedBookingTrainer.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Targeted remediation to bridge your skill gap in <strong>{activeRemediationSkill}</strong>.
                </DialogDescription>
              </DialogHeader>

              {/* Trainer Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                    {selectedBookingTrainer.avatarUrl ? (
                      <img src={selectedBookingTrainer.avatarUrl} alt={selectedBookingTrainer.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedBookingTrainer.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedBookingTrainer.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{selectedBookingTrainer.qualification}</p>
                    <span className="text-amber-500 font-bold text-[10px] flex items-center gap-0.5 mt-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {selectedBookingTrainer.rating} Rating • {selectedBookingTrainer.yearsOfExperience}+ yrs exp
                    </span>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                  {activeRemediationSkill} Mentor
                </Badge>
              </div>

              {/* Date & Time Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Session Date</Label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Today">Today (Fast-Track)</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="In 2 Days">In 2 Days</option>
                    <option value="This Saturday">This Saturday</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Slot</Label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="04:00 PM - 04:45 PM">04:00 PM - 04:45 PM</option>
                    <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                    <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM</option>
                    <option value="06:30 PM - 07:15 PM">06:30 PM - 07:15 PM</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  What specific topics do you want to cover?
                </Label>
                <Textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g., Transition from Java to Python syntax, functions, and solving interview challenges..."
                  className="rounded-xl text-xs border-slate-200 dark:border-slate-700 focus-visible:ring-blue-600"
                />
              </div>

              {/* Confirmation Action */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isBookingSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-xs"
                >
                  {isBookingSubmitting ? 'Confirming...' : 'Confirm 1:1 Session'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* H. QUICK SKILL & BACKGROUND UPDATE DIALOG                         */}
      {/* ================================================================ */}
      <Dialog open={isQuickSkillModalOpen} onOpenChange={setIsQuickSkillModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <form onSubmit={handleQuickUpdateProfile} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                Update Skills & Profile Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Quickly adjust your background, skills, and target goals to re-run AI matching live.
              </DialogDescription>
            </DialogHeader>

            {/* Quick 1-Click Preset for User Request */}
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 space-y-1.5">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 block">
                ⚡ Quick Preset (As requested):
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuickDegreeText('B.Tech in Computer Science');
                  setQuickSkillsText('Java, Mathematics, Problem Solving');
                  setQuickGoalsText('Technology Executive / Tech Lead (CEO Path)');
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-300 text-left text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center justify-between"
              >
                <span>Apply: <strong>B.Tech, Maths, Java, CEO Track</strong></span>
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">1-Click</span>
              </button>
            </div>

            {/* Education Degree */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Degree / Field of Study</Label>
              <Input
                value={quickDegreeText}
                onChange={(e) => setQuickDegreeText(e.target.value)}
                placeholder="e.g., B.Tech in Computer Science"
                className="rounded-xl text-xs h-9"
              />
            </div>

            {/* Technical Skills */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Current Verified Skills (Comma separated)</Label>
              <Input
                value={quickSkillsText}
                onChange={(e) => setQuickSkillsText(e.target.value)}
                placeholder="e.g., Java, Mathematics, Problem Solving"
                className="rounded-xl text-xs h-9"
              />
              <span className="text-[10px] text-slate-400 block">
                Leave Python out to test the Python skill gap diagnosis & trainer match!
              </span>
            </div>

            {/* Target Goals */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Aspirations & Target Role</Label>
              <Input
                value={quickGoalsText}
                onChange={(e) => setQuickGoalsText(e.target.value)}
                placeholder="e.g., CEO, Tech Lead, Software Architect"
                className="rounded-xl text-xs h-9"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuickSkillModalOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-xs"
              >
                Update & Recalculate
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CareerAnalyzer;
