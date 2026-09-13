import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Brain, FileText, TrendingUp, BarChart3 } from 'lucide-react';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string) => {
    return (name || 'User')
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-blue-500 transition-all p-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 glass-card shadow-lg p-1.5" align="end" forceMount>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 mb-1">
          <div className="flex flex-col space-y-0.5 leading-none overflow-hidden">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{user.name || 'Student'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/main')} className="cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/career-guide')} className="cursor-pointer">
          <Brain className="mr-2 h-4 w-4 text-emerald-600" />
          <span>Career Guide</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/resume-analyzer')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4 text-cyan-600" />
          <span>Resume Analyzer</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate('/career-growth')} className="cursor-pointer">
          <TrendingUp className="mr-2 h-4 w-4 text-indigo-600" />
          <span>Growth Path</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
          <BarChart3 className="mr-2 h-4 w-4 text-purple-600" />
          <span>Detailed Analytics</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth.signOut', 'Sign Out')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;