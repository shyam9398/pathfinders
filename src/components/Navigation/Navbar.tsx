import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers,
  ArrowLeft, 
  LayoutDashboard, 
  Brain, 
  FileText, 
  TrendingUp, 
  BookOpen, 
  GraduationCap, 
  Award,
  Users, 
  CheckSquare, 
  BarChart3, 
  Bell,
  Menu, 
  X,
  ChevronRight,
  Home,
  ShieldCheck,
  FolderGit2,
  Sparkles,
  Search,
  ExternalLink,
  Target,
  Calendar,
  Heart,
  Briefcase,
  Building2,
  Lock,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import UserMenu from '@/components/UserMenu';
import { LanguageToggle } from '@/components/LanguageToggle';
import { UserRole } from '@/types/capacityConnect';

interface NavbarProps {
  pageTitle?: string;
  showBack?: boolean;
  backTo?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  showBack = true,
  backTo,
  breadcrumbs
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, setRole } = useAuth();
  const { t } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
  const isHome = isLandingPage || location.pathname === '/main';

  // Role-specific Navigation Items placed on the LEFT SIDEBAR
  const traineeNavItems = [
    { label: 'Trainee Hub', path: '/main', icon: LayoutDashboard, tag: 'Overview' },
    { label: 'Career Guidance', path: '/career-guide', icon: Brain, tag: 'Discovery' },
    { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText, tag: 'ATS Check' },
    { label: 'Career Growth Path', path: '/career-growth', icon: Sparkles, tag: 'Roadmap' },
    { label: 'Career Health Score', path: '/career-health', icon: Heart, tag: 'Metrics' },
    { label: 'Course Catalog', path: '/courses', icon: BookOpen, tag: 'Curriculum' },
    { label: 'Skill Gap Engine', path: '/skill-gaps', icon: TrendingUp, tag: 'Diagnostics' },
    { label: 'Assessments', path: '/assessments', icon: CheckSquare, tag: 'MCQs' },
    { label: 'My Certificates', path: '/certificates', icon: Award, tag: 'Credentials' }
  ];

  const trainerNavItems = [
    { label: 'Trainer Overview', path: '/trainer', icon: LayoutDashboard, tag: 'Overview' },
    { label: 'Skill Gap Radar', path: '/trainer/radar', icon: Target, tag: 'Demand' },
    { label: '1:1 Mentorship', path: '/trainer/sessions', icon: Calendar, tag: 'Sessions' },
    { label: 'Course Studio', path: '/trainer/courses', icon: BookOpen, tag: 'Curriculum' },
    { label: 'Trainer Library', path: '/trainer/library', icon: FolderGit2, tag: 'Drive Hub' },
    { label: 'Doubt Clinic', path: '/trainer/doubts', icon: MessageSquare, tag: 'Live' },
    { label: 'Capstone Reviews', path: '/trainer/reviews', icon: CheckSquare, tag: 'Rubrics' },
    { label: 'Cohort Analytics', path: '/trainer/analytics', icon: TrendingUp, tag: 'Feedback' }
  ];

  const adminNavItems = [
    { label: 'Admin Command', path: '/admin', icon: ShieldCheck, tag: 'Overview' },
    { label: 'Student Analytics', path: '/admin/students', icon: GraduationCap, tag: 'Cohorts' },
    { label: 'Trainer Governance', path: '/admin/trainers', icon: Award, tag: 'Accredited' },
    { label: 'Jobs Pipeline', path: '/admin/jobs', icon: Briefcase, tag: 'Corporate' },
    { label: 'Internships Hub', path: '/admin/internships', icon: Building2, tag: 'Drives' },
    { label: 'Course Audit', path: '/admin/courses', icon: BookOpen, tag: 'Curriculum' },
    { label: 'User Directory', path: '/admin/users', icon: Users, tag: 'Approvals' },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell, tag: 'Broadcast' },
    { label: 'Security & Supabase', path: '/admin/security', icon: Lock, tag: 'RBAC' }
  ];

  const activeRole: UserRole = location.pathname.startsWith('/trainer')
    ? 'trainer'
    : location.pathname.startsWith('/admin')
      ? 'admin'
      : role;

  const navItems = activeRole === 'admin' ? adminNavItems : activeRole === 'trainer' ? trainerNavItems : traineeNavItems;

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/main');
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'trainer') navigate('/trainer');
    else if (newRole === 'admin') navigate('/admin');
    else navigate('/main');
  };

  const sidebarNavContent = (
    <div className="flex flex-col h-full justify-between p-3.5 space-y-4">
      
      {/* Top: Logo & Role Pill */}
      <div className="space-y-3.5">
        <Link 
          to={role === 'trainer' ? '/trainer' : role === 'admin' ? '/admin' : '/main'} 
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none">
                Capacity Connect
              </span>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              PS 26075 Platform
            </span>
          </div>
        </Link>

        {/* Role Identity / Switcher */}
        {activeRole === 'trainee' ? (
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">{t('Student Portal', 'Student Portal')}</span>
            </div>
            <Badge variant="outline" className="bg-white/80 dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-blue-200 text-[10px] font-bold">
              {t('Trainee', 'Trainee')}
            </Badge>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="uppercase text-[10px] tracking-wider text-slate-400">{t('Current Role', 'Current Role')}</span>
              <Badge className="bg-blue-600 text-white text-[9px] uppercase px-1.5 py-0 font-bold">
                {t(activeRole, activeRole)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(['trainer', 'admin'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  className={`py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                    activeRole === r
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t(r === 'trainer' ? 'Trainer' : 'Admin', r === 'trainer' ? 'Trainer' : 'Admin')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Left Side Features Navigation */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
            {t(activeRole + ' workspace', activeRole.toUpperCase() + ' WORKSPACE')}
          </span>
          <nav className="space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSmartActive = location.pathname === item.path ||
                (activeRole === 'trainer' && (
                  (item.path.includes('radar') && (location.pathname.includes('radar') || location.search.includes('tab=radar'))) ||
                  (item.path.includes('sessions') && (location.pathname.includes('sessions') || location.pathname.includes('trainees') || location.search.includes('tab=sessions'))) ||
                  (item.path.includes('courses') && (location.pathname.includes('courses') || location.search.includes('tab=courses'))) ||
                  (item.path.includes('library') && (location.pathname.includes('library') || location.pathname.includes('resources') || location.search.includes('tab=resources'))) ||
                  (item.path.includes('analytics') && (location.pathname.includes('analytics') || location.search.includes('tab=analytics'))) ||
                  (item.path === '/trainer' && location.pathname === '/trainer' && !location.search.includes('tab=') && location.pathname === '/trainer')
                ));
              const isActive = isSmartActive;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
                    <span className="truncate">{t(item.label, item.label)}</span>
                  </div>
                  {item.tag && (
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {t(item.tag, item.tag)}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & Language Toggle in Sidebar */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-1.5">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              {(user?.name || 'T')[0]}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate leading-none">
                {user?.name || 'Pavan Kumar'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">{t(activeRole, activeRole)}</span>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT LEFT SIDEBAR (FIXED 240px) - ONLY SHOWN IN AUTHENTICATED WORKSPACES, HIDDEN ON HOME/LANDING PAGE */}
      {!isLandingPage && (
        <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 fixed inset-y-0 left-0 z-30 shadow-2xs">
          {sidebarNavContent}
        </aside>
      )}

      {/* 2. TOP HEADER BAR */}
      <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
          
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-2.5 text-xs">
            
            {/* Mobile menu button (only in workspaces, not landing) */}
            {!isLandingPage && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-700 dark:text-slate-200 h-9 w-9 mr-1"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open Left Sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            {/* Back button */}
            {showBack && !isHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 px-3 py-1.5 h-8.5 rounded-xl border border-slate-200 dark:border-slate-700"
                title="Go back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Back</span>
              </Button>
            )}

            {/* Breadcrumb path */}
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-sm">
                <Link to="/main" className="hover:text-slate-900 dark:hover:text-white">
                  <Home className="w-3.5 h-3.5" />
                </Link>
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-slate-900 dark:hover:text-white truncate">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Capacity Connect
                  </span>
                </Link>
                {!isLandingPage && (
                  <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                    {activeRole} Mode
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right: User Menu & Role quick indicator */}
          <div className="flex items-center gap-3">
            {!isLandingPage && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <span className="capitalize text-slate-600 font-semibold">{activeRole} Workspace</span>
              </div>
            )}
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-xs"
              >
                Sign In
              </Button>
            )}
          </div>

        </div>
      </header>

      {/* 3. MOBILE SLIDE-OUT LEFT SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" 
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="flex justify-end p-2 border-b border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarNavContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
