import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Award,
  Layers,
  FolderGit2,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { UserRole } from '@/types/capacityConnect';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RoleSelectorProps {
  onComplete: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onComplete }) => {
  const { setRole, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('trainee');

  const roleCards: {
    role: UserRole;
    title: string;
    badge: string;
    subtitle: string;
    icon: any;
    color: string;
    features: string[];
  }[] = [
    {
      role: 'trainee',
      title: 'Trainee / Learner',
      badge: 'Skill Development',
      subtitle: 'Build competencies, discover courses, bridge skill gaps, and earn verified credentials.',
      icon: GraduationCap,
      color: 'blue',
      features: [
        'Personalized Competency Profile',
        'AI Career & Competency Guide',
        'Accredited Courses & Video Lectures',
        'Automated Skill Gap Remediation',
        'Module Quizzes & Verifiable Certificates'
      ]
    },
    {
      role: 'trainer',
      title: 'Certified Trainer / Instructor',
      badge: 'Course Instruction',
      subtitle: 'Author accredited courses, upload lecture materials, and evaluate trainee progress.',
      icon: Users,
      color: 'emerald',
      features: [
        'Curriculum & Course Authoring',
        'Trainer Library (Lectures, PDFs, Slides)',
        'MCQ Questionnaires & Deadlines',
        'Trainee Progress & Cohort Monitoring',
        'Course Feedback & Student Ratings'
      ]
    },
    {
      role: 'admin',
      title: 'Platform Administrator',
      badge: 'Governance & Analytics',
      subtitle: 'Govern users, manage approvals, audit competency mapping, and broadcast alerts.',
      icon: ShieldCheck,
      color: 'purple',
      features: [
        'User Registration & Role Approval Queue',
        'Organization-Wide Capacity Analytics',
        'Competency Mapping & Trainer Discovery',
        'Announcement & Content Broadcasting',
        'System Governance & Security Auditing'
      ]
    }
  ];

  const handleContinue = () => {
    loginAsGuest(selectedRole);
    onComplete(selectedRole);
    if (selectedRole === 'trainer') {
      navigate('/trainer');
    } else if (selectedRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/main');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>PS 26075 — CAPACITY CONNECT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Choose Your Platform Role
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Select how you would like to participate in Capacity Connect. You can switch your role at any time from the left sidebar.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roleCards.map(card => {
            const Icon = card.icon;
            const isSelected = selectedRole === card.role;

            return (
              <Card
                key={card.role}
                onClick={() => setSelectedRole(card.role)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-lg ring-2 ring-blue-600/20'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <Badge variant="outline" className="text-[10px] font-semibold mb-1.5 bg-slate-50 border-slate-200">
                      {card.badge}
                    </Badge>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Key Capabilities:
                    </span>
                    {card.features.map((feat, idx) => (
                      <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-emerald-600'}`} />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4">
                  <Button
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    className={`w-full rounded-xl text-xs font-semibold h-9 ${
                      isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {isSelected ? 'Selected Role' : 'Select Role'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <span>Continue as {selectedRole.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default RoleSelector;
