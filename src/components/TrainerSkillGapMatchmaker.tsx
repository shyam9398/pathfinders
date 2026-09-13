import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  GraduationCap, 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Star, 
  Sparkles, 
  ArrowRight, 
  Video, 
  MessageSquare, 
  BookOpen, 
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { capacityStore } from '@/services/capacityStore';
import { TrainerProfile, CompetencyItem } from '@/types/capacityConnect';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TrainerSkillGapMatchmakerProps {
  initialSkillGap?: string;
  availableGaps?: CompetencyItem[];
  showAsCard?: boolean;
}

export const TrainerSkillGapMatchmaker: React.FC<TrainerSkillGapMatchmakerProps> = ({
  initialSkillGap,
  availableGaps = [],
  showAsCard = true
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Selected gap skill for matching
  const defaultGap = initialSkillGap || availableGaps[0]?.name || 'Data Structures';
  const [selectedSkill, setSelectedSkill] = useState<string>(defaultGap);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [bookingDate, setBookingDate] = useState('Tomorrow');
  const [bookingTime, setBookingTime] = useState('04:00 PM - 04:45 PM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Multi-Factor Matched Trainers
  const matchedTrainers = useMemo(() => {
    return capacityStore.matchTrainersForSkillGap(selectedSkill);
  }, [selectedSkill]);

  const handleOpenBooking = (trainer: TrainerProfile) => {
    setSelectedTrainer(trainer);
    setBookingNotes(`Need targeted remediation on ${selectedSkill} algorithms and real-world implementation.`);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;

    setIsSubmitting(true);
    setTimeout(() => {
      capacityStore.bookMentorshipSession({
        traineeId: user?.id || 'guest',
        traineeName: user?.name || 'Shyam Sundar',
        trainerId: selectedTrainer.id,
        trainerName: selectedTrainer.name,
        skillGap: selectedSkill,
        scheduledDate: bookingDate,
        timeSlot: bookingTime,
        status: 'confirmed',
        notes: bookingNotes
      });

      setIsSubmitting(false);
      setBookingModalOpen(false);
      toast.success(`1-on-1 Remediation Session confirmed with ${selectedTrainer.name} for ${bookingDate} at ${bookingTime}!`, {
        description: 'Meeting link has been added to your schedule and trainer notified.'
      });
    }, 400);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Quick Skill Gap Switcher */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              AI Competency Engine Matchmaker
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Match Certified Trainer for Your Skill Gap
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mt-0.5">
              Select any competency gap below to instantly match with top verified instructors who teach accredited courses and offer 1-on-1 remedial sessions.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Gap Target</span>
              <strong className="text-xs font-bold text-blue-600 block">{selectedSkill}</strong>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {matchedTrainers.length}
            </div>
          </div>
        </div>

        {/* Skill Gap Pills Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Click Gap to Recalculate Trainer Matches:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {(availableGaps.length > 0 ? availableGaps.map(g => g.name) : [
              'Data Structures',
              'OOP',
              'Python',
              'Java',
              'SQL',
              'Machine Learning',
              'React',
              'Cloud & DevOps'
            ]).map(skill => {
              const isSelected = selectedSkill.toLowerCase() === skill.toLowerCase();
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold ring-2 ring-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <Target className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Matched Trainers Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {matchedTrainers.map(({ trainer, matchScore, matchReasons }) => {
          const comp = trainer.competencies.find(c => c.name.toLowerCase().includes(selectedSkill.toLowerCase()) || selectedSkill.toLowerCase().includes(c.name.toLowerCase()));
          const proficiency = comp ? comp.proficiency : 88;

          return (
            <Card 
              key={trainer.id}
              className="glass-card p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-400/80 dark:hover:border-blue-600 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between group overflow-hidden relative"
            >
              <div className="space-y-4">
                {/* Trainer Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {trainer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {trainer.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{trainer.qualification}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {trainer.rating}
                        </span>
                        <span>•</span>
                        <span>{trainer.yearsOfExperience}+ yrs exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Pill */}
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold px-2 py-0.5 shadow-xs shrink-0">
                    {matchScore}% Match
                  </Badge>
                </div>

                {/* Verified Competency Meter */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Verified Competency in {selectedSkill}:
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

                {/* Match Reasons */}
                <div className="space-y-1.5">
                  {matchReasons.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-2">
                <Button
                  size="sm"
                  onClick={() => handleOpenBooking(trainer)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-8.5 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book 1:1 Remediation Session</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/courses')}
                    className="rounded-xl text-[11px] font-semibold h-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <BookOpen className="w-3 h-3 mr-1 text-slate-400" />
                    Courses ({trainer.coursesCount})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.info(`Chat request sent to ${trainer.name}`, {
                        description: `Topic: Resolving ${selectedSkill} skill gap.`
                      });
                    }}
                    className="rounded-xl text-[11px] font-semibold h-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <MessageSquare className="w-3 h-3 mr-1 text-slate-400" />
                    Message
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. 1-on-1 Remediation Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                Personalized 1-on-1 Mentorship
              </Badge>
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Schedule Remediation Session with {selectedTrainer?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              One-on-one focused coaching to resolve your identified gap in <strong>{selectedSkill}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmBooking} className="space-y-4 pt-2">
            
            {/* Preferred Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Date
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Today', 'Tomorrow', 'This Saturday'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBookingDate(d)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      bookingDate === d
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-300 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Available Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['11:00 AM - 11:45 AM', '02:30 PM - 03:15 PM', '04:00 PM - 04:45 PM', '06:30 PM - 07:15 PM'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBookingTime(t)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                      bookingTime === t
                        ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-300 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Note / Doubts */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Specific Topic / Problem Focus
              </label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Describe the questions or algorithms you need help with..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-blue-600"
                rows={3}
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Session will be conducted live via integrated Google Meet with screen sharing.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setBookingModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-4"
              >
                {isSubmitting ? 'Booking Session...' : 'Confirm Mentorship Session'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default TrainerSkillGapMatchmaker;
