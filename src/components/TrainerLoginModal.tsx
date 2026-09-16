import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, LogIn, AlertCircle, Eye, EyeOff, Clock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { capacityStore } from '@/services/capacityStore';
import { toast } from 'sonner';

interface TrainerLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenApplyModal?: () => void;
}

export const TrainerLoginModal: React.FC<TrainerLoginModalProps> = ({
  open,
  onOpenChange,
  onOpenApplyModal
}) => {
  const { setRole, loginAsTrainer } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(false);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both your username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = capacityStore.verifyTrainerLogin(username, password);

      if (!res.success) {
        if (res.status === 'pending') {
          setIsPending(true);
          setError(res.error || 'Your trainer application is pending admin approval.');
        } else {
          setError(res.error || 'Invalid credentials.');
        }
        return;
      }

      // Successful login
      setRole('trainer');
      loginAsTrainer({
        id: res.trainer?.id || 'trainer_user',
        email: res.trainer?.email || `${username}@pathfinder.org`,
        name: res.trainer?.name || username
      });
      toast.success(`Welcome back, Trainer ${res.trainer?.name || username}!`);
      onOpenChange(false);
      navigate('/trainer', { replace: true });
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <DialogHeader className="text-left space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 text-blue-700 dark:text-blue-300 text-xs font-semibold w-fit">
              <GraduationCap className="w-3.5 h-3.5" />
              Accredited Trainer Access
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              Trainer Portal Sign In
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Sign in with your approved username and password to enter the Trainer Workspace.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              isPending 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-200' 
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700 dark:text-rose-300'
            }`}>
              {isPending ? <Clock className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold">{isPending ? 'Approval Pending' : 'Authentication Notice'}</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Username or Email
              </Label>
              <Input
                required
                placeholder="e.g. rakesh.sharma or priya.narayanan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <Input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Pre-Approved Demo Trainers:</span>
            <p className="font-mono text-[10px]">Username: <strong>rakesh.sharma</strong> / Password: <strong>password123</strong></p>
            <p className="font-mono text-[10px]">Username: <strong>priya.narayanan</strong> / Password: <strong>password123</strong></p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Authenticating...' : 'Sign In as Trainer'}
          </Button>

          <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Not an accredited trainer yet?{' '}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenApplyModal?.();
                }}
                className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                Apply as Trainer
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default TrainerLoginModal;
