import React, { useState, useMemo } from 'react';
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
  Check
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types/capacityConnect';
import { toast } from 'sonner';

export default function CoursesCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses] = useState<Course[]>(() => capacityStore.getCourses());
  const [enrollments, setEnrollments] = useState(() => capacityStore.getEnrollments(user?.id || 'guest'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                placeholder="Search courses, skills, trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs rounded-xl h-10 border-slate-200 dark:border-slate-800"
              />
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

    </div>
  );
}
