import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Search, 
  Clock, 
  GraduationCap, 
  PlayCircle, 
  CheckCircle2, 
  Sparkles, 
  Star,
  Users,
  ArrowRight,
  Filter,
  Check,
  Plus,
  Upload,
  Layers
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types/capacityConnect';
import { toast } from 'sonner';

export default function CoursesCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>(() => capacityStore.getCourses());
  const [enrollments, setEnrollments] = useState(() => capacityStore.getEnrollments(user?.id || 'guest'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Upload Course Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState<'Technology' | 'Data Science' | 'Management' | 'Cloud & DevOps' | 'Core Engineering'>('Technology');
  const [courseSubject, setCourseSubject] = useState('');
  const [courseDifficulty, setCourseDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [courseDuration, setCourseDuration] = useState('8 weeks (32 hours)');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseSkills, setCourseSkills] = useState('');
  const [courseOutcomes, setCourseOutcomes] = useState('');
  const [module1Title, setModule1Title] = useState('');
  const [module1Desc, setModule1Desc] = useState('');
  const [module2Title, setModule2Title] = useState('');
  const [module2Desc, setModule2Desc] = useState('');

  useEffect(() => {
    const handleCoursesChanged = () => {
      setCourses(capacityStore.getCourses());
    };
    window.addEventListener('capacity_connect_courses_changed', handleCoursesChanged);
    return () => window.removeEventListener('capacity_connect_courses_changed', handleCoursesChanged);
  }, []);

  const categories = ['All', 'Technology', 'Data Science', 'Management'];

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.trainerName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  const handleEnroll = (course: Course, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const enrolled = capacityStore.enrollInCourse(user?.id || 'guest', course.id);
    setEnrollments(capacityStore.getEnrollments(user?.id || 'guest'));
    toast.success(`Successfully enrolled in ${course.title}!`);
    navigate(`/courses/${course.id}/learn`);
  };

  const handleUploadCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      toast.error('Please provide a course title.');
      return;
    }

    const trainerName = user?.name || 'Dr. Priya Narayanan';
    const trainerId = user?.id?.startsWith('trainer') ? user.id : 'trainer-2';

    const competencies = courseSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => ({ name, minLevel: 60 }));

    const outcomes = courseOutcomes
      .split('\n')
      .map(o => o.trim())
      .filter(Boolean);

    const modules = [
      {
        id: `mod-${Date.now()}-1`,
        title: module1Title.trim() || 'Foundations & Architecture',
        description: module1Desc.trim() || 'Core architectural patterns and deep fundamentals walkthrough.',
        durationMinutes: 90
      },
      ...(module2Title.trim() ? [{
        id: `mod-${Date.now()}-2`,
        title: module2Title.trim(),
        description: module2Desc.trim() || 'Applied enterprise lab implementation and testing.',
        durationMinutes: 120
      }] : [])
    ];

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: courseTitle.trim(),
      description: courseDescription.trim() || 'Industry-aligned technical training curriculum structured to close verified competency gaps.',
      category: courseCategory,
      subject: courseSubject.trim() || 'Software Engineering',
      difficulty: courseDifficulty,
      duration: courseDuration.trim() || '8 weeks (32 hours)',
      trainerId,
      trainerName,
      trainerExperience: '8+ Years Industry Practice',
      rating: 4.9,
      enrolledCount: 0,
      requiredCompetencies: competencies.length > 0 ? competencies : [{ name: 'Problem Solving', minLevel: 60 }],
      learningOutcomes: outcomes.length > 0 ? outcomes : [
        'Master real-world production engineering patterns',
        'Bridge diagnostic skill gaps with hands-on practice',
        'Build and ship certified portfolio capstones'
      ],
      thumbnailUrl: '',
      status: 'published',
      modules: modules.length > 0 ? modules : [
        { id: `mod-${Date.now()}-1`, title: 'Core Curriculum Module', description: 'Curriculum fundamentals', durationMinutes: 60 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    capacityStore.addCourse(newCourse);
    setCourses(capacityStore.getCourses());
    toast.success(`Course "${newCourse.title}" successfully uploaded and published!`);
    setUploadModalOpen(false);

    // Reset Form
    setCourseTitle('');
    setCourseSubject('');
    setCourseDescription('');
    setCourseSkills('');
    setCourseOutcomes('');
    setModule1Title('');
    setModule1Desc('');
    setModule2Title('');
    setModule2Desc('');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Courses Catalog' }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Catalog Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Accredited Curriculum Directory
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Capacity-Building Courses
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Explore structured courses taught by certified enterprise and academic trainers.
              </p>
            </div>

            {/* Actions: Search Input & Upload Course Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  placeholder="Search courses, skills, trainers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs rounded-xl h-10 border-slate-200 dark:border-slate-800"
                />
              </div>

              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10 px-4 flex items-center justify-center gap-2 shrink-0 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Upload Course
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-2">Categories:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isEnrolled = enrollments.some(e => e.courseId === course.id);

            return (
              <Card 
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3.5 p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                      {course.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Trainer: <strong>{course.trainerName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.duration} • {course.modules.length} Modules</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Target Competencies:</span>
                    <div className="flex flex-wrap gap-1">
                      {course.requiredCompetencies.map((comp, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200">
                          {comp.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {isEnrolled ? (
                    <Button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}/learn`); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={(e) => handleEnroll(course, e)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 shadow-xs"
                    >
                      Enroll in Course
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

      </main>

      {/* Course Detail Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {selectedCourse && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {selectedCourse.category}
                  </Badge>
                  <span className="text-xs text-slate-400">• {selectedCourse.duration}</span>
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCourse.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Instruction by {selectedCourse.trainerName} ({selectedCourse.trainerExperience})
                </DialogDescription>
              </DialogHeader>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedCourse.description}
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Learning Outcomes
                </h4>
                <div className="space-y-1.5">
                  {selectedCourse.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Modules Included ({selectedCourse.modules.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedCourse.modules.map((mod, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <strong className="block text-slate-900 dark:text-white">{mod.title}</strong>
                      <p className="text-slate-500 mt-0.5">{mod.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">
                  {selectedCourse.enrolledCount} Trainees enrolled
                </span>
                <Button 
                  onClick={() => handleEnroll(selectedCourse)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-6 h-9"
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Course Modal for Trainers */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 text-blue-700 dark:text-blue-300 text-xs font-semibold w-fit mb-1">
              <Upload className="w-3.5 h-3.5" />
              Trainer Course Authoring Studio
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Upload & Publish New Course
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Publish accredited curriculum modules. Courses are immediately added to the catalog and made available to trainees.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadCourse} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Enterprise Cloud Microservices with Go & Docker"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Technology">Technology</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Management">Management</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Core Engineering">Core Engineering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject / Tech Stack
                </label>
                <Input
                  placeholder="e.g. Golang, Kubernetes, Microservices"
                  value={courseSubject}
                  onChange={(e) => setCourseSubject(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Difficulty Level
                </label>
                <select
                  value={courseDifficulty}
                  onChange={(e) => setCourseDifficulty(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Duration & Workload
                </label>
                <Input
                  placeholder="e.g. 8 weeks (32 hours)"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Competencies (Comma-separated)
                </label>
                <Input
                  placeholder="e.g. Containerization, Cloud CI/CD, Event Driven Architecture"
                  value={courseSkills}
                  onChange={(e) => setCourseSkills(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Course Description & Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the learning goals, technical prerequisites, and outcomes..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-normal text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Learning Outcomes (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Master container lifecycle&#10;Implement resilient gRPC endpoints&#10;Deploy production Kubernetes clusters"
                  value={courseOutcomes}
                  onChange={(e) => setCourseOutcomes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-normal text-slate-900 dark:text-white"
                />
              </div>

              {/* Module 1 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 md:col-span-2 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Module 1: Foundations
                </span>
                <Input
                  placeholder="Module 1 Title (e.g. Architecture Overview & Setup)"
                  value={module1Title}
                  onChange={(e) => setModule1Title(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900"
                />
                <Input
                  placeholder="Module 1 Description"
                  value={module1Desc}
                  onChange={(e) => setModule1Desc(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900"
                />
              </div>

              {/* Module 2 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 md:col-span-2 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Module 2: Hands-on Implementation (Optional)
                </span>
                <Input
                  placeholder="Module 2 Title (e.g. Production Deployment & Benchmarking)"
                  value={module2Title}
                  onChange={(e) => setModule2Title(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900"
                />
                <Input
                  placeholder="Module 2 Description"
                  value={module2Desc}
                  onChange={(e) => setModule2Desc(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadModalOpen(false)}
                className="h-9 text-xs rounded-xl px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 text-xs rounded-xl px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Publish Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
