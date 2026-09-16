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
  Settings,
  LogOut,
  Sparkles,
  Code
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import UserMenu from '@/components/UserMenu';
import { LanguageToggle } from '@/components/LanguageToggle';
import { UserRole } from '@/types/capacityConnect';

interface AppLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showBack = true,
  backTo,
  breadcrumbs
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, setRole, signOut } = useAuth();
  const { t } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isHome = location.pathname === '/' || location.pathname === '/main';

  // Role-specific Navigation Items placed on the LEFT SIDEBAR
  const traineeNavItems = [
    { label: 'Trainee Hub', path: '/main', icon: LayoutDashboard, tag: 'Dashboard' },
    { label: 'Course Catalog', path: '/courses', icon: BookOpen, tag: 'Curriculum' },
    { label: 'AI Career Guide', path: '/career-guide', icon: Brain, tag: 'Discovery' },
    { label: 'Skill Gap Engine', path: '/skill-gaps', icon: TrendingUp, tag: 'Diagnostics' },
    { label: 'Assessments', path: '/assessments', icon: CheckSquare, tag: 'MCQs' },
    { label: 'My Certificates', path: '/certificates', icon: Award, tag: 'Credentials' },
    { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText, tag: 'Extraction' },
    { label: 'Growth Path', path: '/career-growth', icon: Sparkles, tag: 'Milestones' }
  ];

  const trainerNavItems = [
    { label: 'Trainer Dashboard', path: '/trainer', icon: LayoutDashboard, tag: 'Overview' },
    { label: 'Courses Directory', path: '/courses', icon: BookOpen, tag: 'Curriculum' },
    { label: 'Capstone & PR Code Review Arena', path: '/trainer/capstones', icon: Code, tag: 'Reviews' },
    { label: 'Trainer Library', path: '/trainer/library', icon: FolderGit2, tag: 'Materials' },
    { label: 'Assessments', path: '/assessments', icon: CheckSquare, tag: 'Questionnaires' },
    { label: 'Issued Certificates', path: '/certificates', icon: Award, tag: 'Credentials' }
  ];

  const adminNavItems = [
    { label: 'Admin Overview', path: '/admin', icon: ShieldCheck, tag: 'Governance' },
    { label: 'Course Catalog', path: '/courses', icon: BookOpen, tag: 'Curriculum' },
    { label: 'Competency Mapping', path: '/skill-gaps', icon: TrendingUp, tag: 'Insights' },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell, tag: 'Broadcast' },
  ];

  const navItems = role === 'admin' ? adminNavItems : role === 'trainer' ? trainerNavItems : traineeNavItems;

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

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 space-y-4">
      
      {/* Brand Logo & Role Selector */}
      <div className="space-y-4">
        <Link 
          to={role === 'trainer' ? '/trainer' : role === 'admin' ? '/admin' : '/main'} 
          className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight leading-none">
                PathFinders
              </span>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              PS 26075 Platform
            </span>
          </div>
        </Link>

        {/* Role Identity / Switcher */}
        {role === 'trainee' ? (
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Student Portal</span>
            </div>
            <Badge variant="outline" className="bg-white/80 dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-blue-200 text-[10px] font-bold">
              Trainee
            </Badge>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span>ACTIVE ROLE</span>
              <Badge className="bg-blue-600 text-white text-[9px] uppercase px-1.5 py-0 font-bold">
                {role}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(['trainer', 'admin'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  className={`py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                    role === r
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r === 'trainer' ? 'Trainer' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Links in Sidebar */}
        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
            {role.toUpperCase()} NAVIGATION
          </span>
          <nav className="space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Info & Footer in Sidebar */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              {(user?.name || 'T')[0]}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate leading-none">
                {user?.name || 'Pavan Kumar'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">{role}</span>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col md:flex-row">
      
      {/* 1. DESKTOP LEFT SIDEBAR (FIXED 260px) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 fixed inset-y-0 left-0 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* 2. MOBILE TOP BAR & SLIDE-OUT SIDEBAR */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="text-slate-700 dark:text-slate-200"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">PathFinders</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] capitalize">
            {role}
          </Badge>
          <LanguageToggle />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA (OFFSET BY SIDEBAR ON DESKTOP) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Subtle Breadcrumb & Action Top Header */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {showBack && !isHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 px-2.5 text-slate-500 hover:text-slate-900 mr-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            )}

            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="flex items-center gap-1.5 text-slate-500">
                <Link to="/main" className="hover:text-slate-900 dark:hover:text-white">
                  <Home className="w-3.5 h-3.5" />
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-slate-900 dark:hover:text-white">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                PS 26075 — PathFinders
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </header>

        {/* Page Children Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AppLayout;
