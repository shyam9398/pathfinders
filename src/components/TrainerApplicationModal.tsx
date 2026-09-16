import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Upload, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { capacityStore } from '@/services/capacityStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainerApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const TrainerApplicationModal: React.FC<TrainerApplicationModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Full Stack Web Development',
    experience: '3-5 Years',
    username: '',
    password: '',
    confirmPassword: '',
    qualification: 'B.Tech / M.Tech Computer Science'
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectsList = [
    'Full Stack Web Development (React, Node.js)',
    'Artificial Intelligence & Machine Learning (Python, PyTorch)',
    'Cloud Computing & DevOps (AWS, Docker, K8s)',
    'Data Science & Big Data Engineering (SQL, Spark)',
    'Core Java & Distributed Systems Architecture',
    'Mobile Application Development (Flutter, React Native)',
    'Cybersecurity & Network Defense'
  ];

  const experienceList = [
    '1-2 Years (Associate Trainer)',
    '3-5 Years (Specialist Trainer)',
    '5-8 Years (Senior Trainer / Mentor)',
    '8+ Years (Principal Trainer / Architect)'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.username.trim() || !formData.password.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const applicationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        resumeName: resumeFile ? resumeFile.name : 'Uploaded_Resume.pdf',
        subject: formData.subject,
        experience: formData.experience,
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        qualification: formData.qualification
      };

      capacityStore.submitTrainerApplication(applicationData);

      // Save applicant state locally so AuthPage immediately locks login inputs and shows "Your request is processing"
      localStorage.setItem('pathfinders_trainer_applicant', JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim().toLowerCase(),
        status: 'pending'
      }));

      // Also persist to Supabase
      try {
        supabase.from('trainer_applications').insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject,
          experience: formData.experience,
          username: formData.username.trim().toLowerCase(),
          qualification: formData.qualification,
          status: 'pending'
        }]).then(({ error }) => {
          if (error) console.log('Supabase sync note:', error.message);
        });
      } catch (err) {
        console.log('Supabase sync catch:', err);
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Trainer application submitted successfully! Sent to Admin for review.');
      onSuccess?.();
    }, 600);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Full Stack Web Development',
      experience: '3-5 Years',
      username: '',
      password: '',
      confirmPassword: '',
      qualification: 'B.Tech / M.Tech Computer Science'
    });
    setResumeFile(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        
        {isSubmitted ? (
          <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Application Sent for Admin Approval!
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>! Your application to join Pathfinders as an accredited trainer for <strong>{formData.subject}</strong> has been routed to the Platform Administrator.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant Name:</span>
                <strong className="text-slate-800 dark:text-slate-200">{formData.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject / Domain:</span>
                <strong className="text-slate-800 dark:text-slate-200">{formData.subject}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Username:</span>
                <strong className="text-blue-600 dark:text-blue-400">{formData.username.toLowerCase()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                  Pending Admin Approval
                </Badge>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Once approved by Admin, you will be able to log in with your chosen username and password to access all trainer tools.
            </p>

            <Button
              onClick={handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-10 shadow-xs"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader className="text-left space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 text-blue-700 dark:text-blue-300 text-xs font-semibold w-fit">
                <GraduationCap className="w-3.5 h-3.5" />
                Trainer Accreditation Portal
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Apply to Become a Pathfinders Trainer
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Submit your profile and credentials. Upon administrator approval, your account will be activated with full trainer workspace access.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Dr. Anand Kulkarni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="email"
                  placeholder="anand@institution.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phone Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Qualification */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Qualification / Highest Degree
                </Label>
                <Input
                  placeholder="e.g. M.Tech / Ph.D. / B.Tech"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Subject / Domain Trainer */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Which Subject / Domain do you Train? <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
                >
                  {subjectsList.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Training / Industry Experience <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
                >
                  {experienceList.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Resume Upload */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload Resume / Curriculum Vitae (PDF/Word) <span className="text-rose-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-4 text-center transition-colors">
                  <input
                    type="file"
                    id="trainer-resume-input"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="trainer-resume-input" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {resumeFile ? resumeFile.name : 'Click to select Resume file (PDF, DOCX)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB selected` : 'Max size 10MB • Evaluated during Admin review'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Desired Username */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Desired Username <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. anand.trainer"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                  className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800 font-mono"
                />
                <span className="text-[10px] text-slate-400">Used for signing in once approved.</span>
              </div>

              {/* Desired Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Desired Password <span className="text-rose-500">*</span>
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
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your desired password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="rounded-xl h-10 text-xs border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-10 text-xs font-semibold px-4 border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-semibold px-6 shadow-xs"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application to Admin'}
              </Button>
            </div>
          </form>
        )}

      </DialogContent>
    </Dialog>
  );
};
export default TrainerApplicationModal;
