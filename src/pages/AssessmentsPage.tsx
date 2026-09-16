import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  CheckSquare, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Filter,
  Search,
  Trophy,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { Assessment, AssessmentAttempt } from '@/types/capacityConnect';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { toast } from 'sonner';

export default function AssessmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assessments, setAssessments] = useState<Assessment[]>(() => capacityStore.getAssessments());
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>(() => capacityStore.getAttempts(user?.id || 'guest'));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Test Runner Modal State
  const [activeTest, setActiveTest] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<{
    scorePercent: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
  } | null>(null);

  // Sync assessments and attempts
  useEffect(() => {
    const handleSync = () => {
      setAssessments(capacityStore.getAssessments());
      setAttempts(capacityStore.getAttempts(user?.id || 'guest'));
    };
    window.addEventListener('capacity_connect_attempts_changed', handleSync);
    return () => window.removeEventListener('capacity_connect_attempts_changed', handleSync);
  }, [user]);

  // Countdown timer during test
  useEffect(() => {
    if (!activeTest || isTestSubmitted) return;
    if (timeRemainingSeconds <= 0) {
      handleSubmitTest();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTest, isTestSubmitted, timeRemainingSeconds]);

  // Start Test
  const handleStartTest = (assessment: Assessment) => {
    setActiveTest(assessment);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeRemainingSeconds(assessment.durationMinutes * 60);
    setIsTestSubmitted(false);
    setTestResult(null);
  };

  // Answer a question
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isTestSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  // Submit Test
  const handleSubmitTest = () => {
    if (!activeTest) return;

    let correct = 0;
    activeTest.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correct += 1;
      }
    });

    const total = activeTest.questions.length;
    const score = Math.round((correct / (total || 1)) * 100);
    const isPassed = score >= activeTest.passingScorePercent;

    // Record attempt
    capacityStore.recordAttempt({
      id: `attempt-${Date.now()}`,
      assessmentId: activeTest.id,
      traineeId: user?.id || 'guest',
      scorePercent: score,
      isPassed,
      completedAt: new Date().toISOString(),
      competencyUpdated: activeTest.competencyCovered,
      competencyGain: isPassed ? 15 : 5
    });

    setTestResult({
      scorePercent: score,
      passed: isPassed,
      correctCount: correct,
      totalCount: total
    });

    setIsTestSubmitted(true);

    if (isPassed) {
      toast.success(`Congratulations! You passed ${activeTest.title} with ${score}%!`, {
        description: `+15% competency verified in ${activeTest.competencyCovered}.`
      });
    } else {
      toast.error(`Score: ${score}%. Minimum required is ${activeTest.passingScorePercent}%.`, {
        description: 'Review the explanations below and practice before retaking.'
      });
    }
  };

  // Filtered assessments
  const filteredAssessments = assessments.filter(a => {
    const matchesCat = selectedCategory === 'All' || a.subject.toLowerCase().includes(selectedCategory.toLowerCase()) || a.competencyCovered.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery.trim() || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.competencyCovered.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Trainee Hub', href: '/main' },
          { label: 'Diagnostic Assessments' }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner with Animated Numbers in Increasing Order */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-blue-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              Accredited Competency Diagnostics
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Diagnostic Assessments & Skills Benchmarks
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Demonstrate mastery across Java, Python, SQL, and core algorithms. Pass timed MCQs to instantly upgrade your verified competency score and qualify for top hiring pipelines.
            </p>
          </div>

          {/* Animated Metrics in Increasing Order */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-center">
              <span className="text-[11px] font-bold text-blue-200 block uppercase">Available Tests</span>
              <strong className="text-2xl font-black text-white block mt-0.5">
                <AnimatedCounter target={assessments.length} />
              </strong>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-center">
              <span className="text-[11px] font-bold text-blue-200 block uppercase">Tests Passed</span>
              <strong className="text-2xl font-black text-white block mt-0.5">
                <AnimatedCounter target={attempts.filter(a => a.isPassed).length} />
              </strong>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-blue-200 block uppercase">Pass Benchmark</span>
              <strong className="text-2xl font-black text-emerald-300 block mt-0.5">
                <AnimatedCounter target={70} suffix="%" />
              </strong>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Data Structures', 'Machine Learning', 'SQL', 'Python'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 text-xs rounded-xl h-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((assessment) => {
            const attempt = attempts.find(at => at.assessmentId === assessment.id);
            const isPassed = attempt?.isPassed;

            return (
              <Card
                key={assessment.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-[11px] font-bold">
                      {assessment.subject}
                    </Badge>
                    {isPassed ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Passed ({attempt.scorePercent}%)
                      </Badge>
                    ) : attempt ? (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-bold">
                        Score: {attempt.scorePercent}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 text-[11px]">
                        Not Attempted
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {assessment.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {assessment.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{assessment.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{assessment.questions.length} MCQs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pass: {assessment.passingScorePercent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+{15}% Competency</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    onClick={() => handleStartTest(assessment)}
                    className={`w-full rounded-xl text-xs font-bold h-9 shadow-xs flex items-center justify-center gap-1.5 ${
                      isPassed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>{isPassed ? 'Retake Benchmark' : 'Start Diagnostic Assessment'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

      </main>

      {/* ================================================================ */}
      {/* INTERACTIVE MCQ TEST RUNNER MODAL                                 */}
      {/* ================================================================ */}
      <Dialog open={!!activeTest} onOpenChange={(open) => !open && !isTestSubmitted ? null : setActiveTest(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          {activeTest && (
            <div className="space-y-5">
              
              {/* Test Header with Countdown Timer */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeTest.title}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Question {currentQuestionIndex + 1} of {activeTest.questions.length}
                  </span>
                </div>

                {!isTestSubmitted ? (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                    timeRemainingSeconds < 120 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                  </div>
                ) : (
                  <Badge className={testResult?.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}>
                    {testResult?.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                  </Badge>
                )}
              </div>

              {/* Question Progress */}
              <Progress 
                value={((currentQuestionIndex + 1) / activeTest.questions.length) * 100} 
                className="h-1.5 bg-slate-100 dark:bg-slate-800" 
              />

              {!isTestSubmitted ? (
                /* Question & Options View */
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {activeTest.questions[currentQuestionIndex]?.question}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {activeTest.questions[currentQuestionIndex]?.options.map((opt, optIdx) => {
                      const qId = activeTest.questions[currentQuestionIndex].id;
                      const isSelected = userAnswers[qId] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(qId, optIdx)}
                          className={`w-full p-3.5 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-100 shadow-xs'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="rounded-xl text-xs h-9 px-3"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      Previous
                    </Button>

                    {currentQuestionIndex < activeTest.questions.length - 1 ? (
                      <Button
                        size="sm"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs h-9 px-4 font-bold"
                      >
                        Next
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleSubmitTest}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 px-5 font-extrabold shadow-xs"
                      >
                        Submit Test
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Test Completed / Result Breakdown View */
                <div className="space-y-4 py-2">
                  <div className={`p-5 rounded-2xl text-center space-y-2 border ${
                    testResult?.passed 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                  }`}>
                    <Trophy className={`w-10 h-10 mx-auto ${testResult?.passed ? 'text-emerald-600' : 'text-rose-600'}`} />
                    <h4 className="text-xl font-extrabold">
                      {testResult?.passed ? 'Diagnostic Assessment Passed!' : 'Benchmark Not Met'}
                    </h4>
                    <p className="text-xs max-w-sm mx-auto opacity-90">
                      {testResult?.passed 
                        ? `You answered ${testResult.correctCount} of ${testResult.totalCount} questions correctly, demonstrating verified competence.`
                        : `You answered ${testResult?.correctCount} of ${testResult?.totalCount} correctly. Minimum required passing score is ${activeTest.passingScorePercent}%.`}
                    </p>
                    <div className="text-3xl font-black pt-1">
                      {testResult?.scorePercent}%
                    </div>
                  </div>

                  {/* Question Explanations */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Question Explanations:</span>
                    {activeTest.questions.map((q, idx) => {
                      const userAns = userAnswers[q.id];
                      const isCorrect = userAns === q.correctAnswerIndex;

                      return (
                        <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-800 dark:text-slate-200">Q{idx + 1}: {q.question}</span>
                            <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Result Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartTest(activeTest)}
                      className="rounded-xl text-xs h-9"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Retake Test
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveTest(null);
                        if (testResult?.passed) {
                          navigate('/certificates');
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-4"
                    >
                      {testResult?.passed ? 'View Certificate' : 'Back to Diagnostics'}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
