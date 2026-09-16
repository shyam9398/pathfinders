import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers,
  ArrowLeft, 
  LayoutDashboard, 
  Brain, 
  FileText, 
  Heart,
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
  ChevronLeft,
  Home,
  ShieldCheck, 
  FolderGit2, 
  Sparkles,
  Search,
  ExternalLink,
  Target,
  Calendar,
  Briefcase,
  Building2,
  Lock,
  MessageSquare,
  Trophy,
  User,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import UserMenu from '@/components/UserMenu';
import { LanguageToggle } from '@/components/LanguageToggle';
import { UserRole } from '@/types/capacityConnect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { user, role, setRole, signOut } = useAuth();
  const { t } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Persistent Collapsed/Expanded Sidebar State
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('pf_sidebar_collapsed') === 'true';
    if (saved) document.body.classList.add('sidebar-collapsed');
    return saved;
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('pf_sidebar_collapsed', String(next));
      if (next) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
      return next;
    });
  };

  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
  const isHome = isLandingPage || location.pathname === '/main';

  // 12 Required Sidebar Navigation Items for Trainee / Student
  const traineeNavItems = [
    { label: t('Dashboard', 'Dashboard'), path: '/main', icon: LayoutDashboard },
    { label: t('Career Guidance', 'Career Guidance'), path: '/career-guide', icon: Brain },
    { label: t('Resume Analyzer', 'Resume Analyzer'), path: '/resume-analyzer', icon: FileText },
    { label: t('Career Growth Path', 'Career Growth Path'), path: '/career-growth', icon: Rocket },
    { label: t('Career Health', 'Career Health'), path: '/career-health', icon: Heart },
    { label: t('Career Updates', 'Career Updates'), path: '/career-updates', icon: Sparkles },
    { label: t('Courses', 'Courses'), path: '/courses', icon: BookOpen },
    { label: t('Trainers', 'Trainers'), path: '/trainers', icon: Users },
    { label: t('Achievements', 'Achievements'), path: '/achievements', icon: Trophy },
    { label: t('Profile', 'Profile'), path: '/profile', icon: User },
    { label: t('Settings', 'Settings'), path: '/settings', icon: Settings },
  ];

  const trainerNavItems = [
    { label: t('Trainer Overview', 'Trainer Overview'), path: '/trainer', icon: LayoutDashboard },
    { label: t('Skill Gap Radar', 'Skill Gap Radar'), path: '/trainer/radar', icon: Target },
    { label: t('1:1 Mentorship', '1:1 Mentorship'), path: '/trainer/sessions', icon: Calendar },
    { label: t('Courses Studio', 'Courses Studio'), path: '/courses', icon: BookOpen },
    { label: t('Trainer Library', 'Trainer Library'), path: '/trainer/library', icon: FolderGit2 },
    { label: t('Cohort Trainees', 'Cohort Trainees'), path: '/trainer/trainees', icon: Users },
    { label: t('Doubt Clinic', 'Doubt Clinic'), path: '/trainer/doubts', icon: MessageSquare },
    { label: t('Cohort Analytics', 'Cohort Analytics'), path: '/trainer/analytics', icon: BarChart3 },
    { label: t('Profile', 'Profile'), path: '/profile', icon: User },
    { label: t('Settings', 'Settings'), path: '/settings', icon: Settings },
  ];

  const adminNavItems = [
    { label: t('Platform Analytics', 'Platform Analytics'), path: '/admin/analytics', icon: BarChart3 },
    { label: t('Admin Command', 'Admin Command'), path: '/admin', icon: ShieldCheck },
    { label: t('Trainer Governance', 'Trainer Governance'), path: '/admin/trainers', icon: Award },
    { label: t('User Directory', 'User Directory'), path: '/admin/users', icon: Users },
    { label: t('Courses Audit', 'Courses Audit'), path: '/courses', icon: BookOpen },
    { label: t('Skill Competency', 'Skill Competency'), path: '/skill-gaps', icon: TrendingUp },
    { label: t('Jobs Pipeline', 'Jobs Pipeline'), path: '/admin/jobs', icon: Briefcase },
    { label: t('Internships Hub', 'Internships Hub'), path: '/admin/internships', icon: Building2 },
    { label: t('Announcements', 'Announcements'), path: '/admin/announcements', icon: Bell },
    { label: t('Security & RBAC', 'Security & RBAC'), path: '/admin/security', icon: Lock },
    { label: t('Settings', 'Settings'), path: '/settings', icon: Settings },
  ];

  const isTrainerRoute = (location.pathname === '/trainer' || location.pathname.startsWith('/trainer/')) && location.pathname !== '/trainers';
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  const activeRole: UserRole = isTrainerRoute
    ? 'trainer'
    : isAdminRoute
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const sidebarNavContent = (
    <div className={`flex flex-col h-full justify-between transition-all duration-200 ${isCollapsed ? 'p-2' : 'p-3.5'}`}>
      
      {/* Top: Logo & Role Pill */}
      <div className="space-y-3.5">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1`}>
          <Link 
            to={role === 'trainer' ? '/trainer' : role === 'admin' ? '/admin' : '/main'} 
            className="flex items-center gap-2.5 rounded-xl hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none">
                  PathFinders
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  PS 26075 Platform
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-white hidden lg:flex"
              title={t('Collapse sidebar', 'Collapse sidebar')}
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            const linkNode = (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={100}>
                  <TooltipTrigger asChild>
                    {linkNode}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold text-xs bg-slate-900 text-white border-slate-800">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkNode;
          })}

          {/* Logout in Sidebar */}
          {isCollapsed ? (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center p-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold text-xs bg-rose-900 text-white border-rose-800">
                {t('Logout', 'Logout')}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{t('Logout', 'Logout')}</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer: Expand Toggle (when collapsed) & Profile/Language */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title={t('Expand sidebar', 'Expand sidebar')}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </Button>
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              {(user?.name || 'T')[0]}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                {(user?.name || 'T')[0]}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate leading-none">
                  {user?.name || 'Pavan Kumar'}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{activeRole}</span>
              </div>
            </div>
            <LanguageToggle />
          </div>
        )}
      </div>

    </div>
  );

  return (
    <TooltipProvider>
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR */}
      {!isLandingPage && (
        <aside 
          className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 fixed inset-y-0 left-0 z-30 shadow-2xs transition-all duration-200 ${
            isCollapsed ? 'w-18' : 'w-60'
          }`}
        >
          {sidebarNavContent}
        </aside>
      )}

      {/* 2. TOP HEADER BAR */}
      <header 
        className="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-2.5 text-xs">
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
              <div className="flex items-center gap-2.5">
                <Link to="/main" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                    PathFinders
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: TOP-RIGHT BACK BUTTON (Requirement 4) & User Menu */}
          <div className="flex items-center gap-2.5">
            
            {/* Top-Right Back Button: Consistent across every inner page */}
            {showBack && !isHome && (
              <Button
                id="top-right-back-button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700 px-3.5 h-9 rounded-xl font-bold text-xs shadow-2xs hover:border-blue-400 transition-all"
                title={t('Return to previous page', 'Return to previous page')}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('Back', 'Back')}</span>
              </Button>
            )}

            <LanguageToggle />

            {user ? (
              <UserMenu />
            ) : (
              <Button 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-xs"
              >
                {t('Sign In', 'Sign In')}
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
    </TooltipProvider>
  );
};

export default Navbar;
