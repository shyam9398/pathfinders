import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Award, 
  CheckSquare, 
  Clock, 
  Download, 
  Star, 
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { useAuth } from '@/contexts/AuthContext';
import { Course, CourseEnrollment, CourseModule, Assessment } from '@/types/capacityConnect';
import { toast } from 'sonner';

export default function CourseLearningView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);

  // Assessment state
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; passed: boolean; gain: number } | null>(null);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const allCourses = capacityStore.getCourses();
    const found = allCourses.find(c => c.id === id) || allCourses[0];
    setCourse(found);
    if (found) {
      const enroll = capacityStore.enrollInCourse(user?.id || 'guest', found.id);
      setEnrollment(enroll);
      setActiveModule(found.modules[0] || null);

      // Check if module has assessment
      if (found.modules[0]?.assessmentId) {
        const assess = capacityStore.getAssessments().find(a => a.id === found.modules[0].assessmentId);
        setActiveAssessment(assess || null);
      }
    }
  }, [id, user]);

  const handleSelectModule = (mod: CourseModule) => {
    setActiveModule(mod);
    if (mod.assessmentId) {
      const assess = capacityStore.getAssessments().find(a => a.id === mod.assessmentId);
      setActiveAssessment(assess || null);
    } else {
      setActiveAssessment(null);
    }
  };

  const handleCompleteModule = (modId: string) => {
    if (!course) return;
    const updated = capacityStore.updateModuleProgress(user?.id || 'guest', course.id, modId);
    if (updated) {
      setEnrollment(updated);
      toast.success('Module marked as completed!');
      if (updated.progressPercent >= 100) {
        toast.success('🎉 Course Completed! Certificate has been generated.');
      }
    }
  };

  const handleSubmitAssessment = () => {
    if (!activeAssessment) return;
    let correctCount = 0;
    activeAssessment.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / activeAssessment.questions.length) * 100);
    const passed = percent >= activeAssessment.passingScorePercent;
    const gain = passed ? 8 : 2;

    capacityStore.recordAttempt({
      id: `attempt-${Date.now()}`,
      assessmentId: activeAssessment.id,
      assessmentTitle: activeAssessment.title,
      traineeId: user?.id || 'guest',
      traineeName: user?.name || 'Trainee',
      answers: Object.values(selectedAnswers),
      score: correctCount,
      totalQuestions: activeAssessment.questions.length,
      scorePercent: percent,
      isPassed: passed,
      attemptedAt: new Date().toISOString(),
      competencyUpdated: activeAssessment.competencyCovered,
      competencyGain: gain
    });

    setAssessmentResult({ score: percent, passed, gain });

    if (passed && activeModule) {
      handleCompleteModule(activeModule.id);
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    capacityStore.submitFeedback({
      id: `fb-${Date.now()}`,
      courseId: course.id,
      traineeId: user?.id || 'guest',
      traineeName: user?.name || 'Trainee',
      courseRating: feedbackRating,
      trainerRating: feedbackRating,
      contentRating: feedbackRating,
      feedbackText: feedbackText || 'Great instructional clarity and practical insights.',
      submittedAt: new Date().toISOString()
    });
    setFeedbackSubmitted(true);
    toast.success('Thank you! Your course feedback has been submitted.');
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-xs text-slate-500">Loading course curriculum...</p>
      </div>
    );
  }

  const isCompleted = enrollment && enrollment.progressPercent >= 100;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Courses', href: '/courses' },
          { label: course.title }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Top Header with Progress */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/courses')}
              className="rounded-xl border-slate-200 dark:border-slate-800 h-9 px-3 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              All Courses
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                {course.title}
              </h1>
              <p className="text-xs text-slate-500">Instructor: <strong>{course.trainerName}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Course Progress</span>
              <strong className="text-sm font-black text-blue-600">{enrollment?.progressPercent || 0}%</strong>
            </div>
            {isCompleted && (
              <Button 
                onClick={() => navigate('/certificates')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 px-3.5"
              >
                <Award className="w-3.5 h-3.5 mr-1" />
                View Certificate
              </Button>
            )}
          </div>
        </div>

        {/* Learning Player & Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Player & Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Embedded Video Player */}
            <Card className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="relative aspect-video bg-slate-900 w-full flex items-center justify-center">
                {activeModule?.videoUrl ? (
                  <iframe
                    src={activeModule.videoUrl}
                    title={activeModule.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-2 p-6">
                    <PlayCircle className="w-12 h-12 mx-auto text-blue-500" />
                    <p className="text-sm font-semibold">Video lecture ready</p>
                  </div>
                )}
              </div>

              {/* Module Details & Action Bar */}
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {activeModule?.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estimated duration: {activeModule?.durationMinutes || 45} mins
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeModule?.assessmentId && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAnswers({});
                          setAssessmentResult(null);
                          setAssessmentModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 px-3.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5 mr-1" />
                        Take Module Assessment
                      </Button>
                    )}

                    {activeModule && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteModule(activeModule.id)}
                        className={`rounded-xl h-9 text-xs font-semibold ${
                          enrollment?.completedModuleIds.includes(activeModule.id)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {enrollment?.completedModuleIds.includes(activeModule.id) ? 'Completed' : 'Mark Complete'}
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeModule?.description}
                </p>

                {/* Downloads and Reading Material */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Study Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModule?.presentationUrl && (
                      <a 
                        href={activeModule.presentationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Download Presentation Slides (.pdf)
                      </a>
                    )}
                    {activeModule?.pdfUrl && (
                      <a 
                        href={activeModule.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        Download Architecture Handbook
                      </a>
                    )}
                  </div>
                </div>

                {activeModule?.notes && (
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                    <strong>Trainer Note:</strong> {activeModule.notes}
                  </div>
                )}
              </div>
            </Card>

            {/* Course Feedback Form */}
            <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Provide Training & Content Feedback
              </h3>
              {feedbackSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your feedback has been recorded for the trainer and academic admin.
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share feedback on instructional pace, clarity, and assessment relevance..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Submit Course Feedback
                    </Button>
                  </div>
                </form>
              )}
            </Card>

          </div>

          {/* Curriculum Modules Checklist Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Course Modules</span>
                <span className="text-xs text-slate-500 font-normal">{course.modules.length} lessons</span>
              </h3>

              <div className="space-y-2">
                {course.modules.map((mod, idx) => {
                  const isSelected = activeModule?.id === mod.id;
                  const isDone = enrollment?.completedModuleIds.includes(mod.id);

                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleSelectModule(mod)}
                      className={`w-full text-left p-3.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-300 text-blue-900 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-200 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <PlayCircle className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold block leading-snug">{mod.title}</span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>{mod.durationMinutes} mins</span>
                          {mod.assessmentId && (
                            <span className="text-blue-600 font-semibold">• Quiz Included</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Trainer Profile Card */}
            <Card className="glass-card p-5 border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Instructor</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  {course.trainerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{course.trainerName}</h4>
                  <p className="text-[11px] text-slate-400">{course.trainerExperience}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Expert in {course.subject}. Rating: ★ {course.rating}/5.0 based on student reviews.
              </p>
            </Card>

          </div>

        </div>

      </main>

      {/* Module Assessment Modal */}
      <Dialog open={assessmentModalOpen} onOpenChange={setAssessmentModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
          {activeAssessment && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    Competency: {activeAssessment.competencyCovered}
                  </Badge>
                  <span className="text-xs text-slate-400">• Passing: {activeAssessment.passingScorePercent}%</span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeAssessment.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Passing this assessment updates your verified competency score in {activeAssessment.competencyCovered}.
                </DialogDescription>
              </DialogHeader>

              {/* Assessment Result Banner */}
              {assessmentResult && (
                <div className={`p-4 rounded-xl text-xs space-y-1 ${
                  assessmentResult.passed
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                }`}>
                  <strong className="block text-sm">
                    {assessmentResult.passed ? '🎉 Assessment Passed!' : 'Need Review — Did not meet passing threshold'}
                  </strong>
                  <p>Your Score: <strong>{assessmentResult.score}%</strong></p>
                  {assessmentResult.passed && (
                    <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      +{assessmentResult.gain}% competency increase in {activeAssessment.competencyCovered}!
                    </p>
                  )}
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4 pt-2">
                {activeAssessment.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedAnswers[qIdx] === optIdx;
                        return (
                          <button
                            type="button"
                            key={optIdx}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                              isChosen
                                ? 'bg-blue-600 text-white font-medium shadow-2xs'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAssessmentModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmitAssessment}
                  disabled={Object.keys(selectedAnswers).length < activeAssessment.questions.length}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-5"
                >
                  Submit Answers
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
