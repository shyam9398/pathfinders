export type UserRole = 'trainee' | 'trainer' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface TraineeProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  degree?: string;
  institution?: string;
  qualification?: string;
  graduationYear?: string;
  workExperience?: string;
  currentRole?: string;
  careerInterests: string[];
  learningInterests: string[];
  skills: { name: string; level: number; category?: string }[]; // level: 0-100%
  certifications: { name: string; issuer: string; date: string; verificationCode?: string }[];
  projects: { title: string; description: string; technologies: string[] }[];
  careerGoals: string;
  overallCompetencyScore: number;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  qualification: string;
  yearsOfExperience: number;
  specialization: string;
  bio: string;
  competencies: { name: string; proficiency: number }[]; // 0-100%
  subjects: string[];
  certifications: string[];
  rating: number; // e.g. 4.8 / 5.0
  totalStudentsTaught: number;
  coursesCount: number;
  avatarUrl?: string;
}

export interface CompetencyItem {
  id: string;
  name: string;
  category: 'Technical' | 'Domain' | 'Soft Skills' | 'Tools';
  currentLevel: number; // 0-100%
  requiredLevel: number; // 0-100%
  gap: number; // requiredLevel - currentLevel
  priority: 'High' | 'Medium' | 'Low';
  recommendedCourseId?: string;
  recommendedCourseTitle?: string;
  suitableTrainerId?: string;
  suitableTrainerName?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl?: string;
  presentationUrl?: string;
  pdfUrl?: string;
  notes?: string;
  assessmentId?: string;
  isCompleted?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Technology' | 'Data Science' | 'Management' | 'Cloud & DevOps' | 'Core Engineering';
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  trainerId: string;
  trainerName: string;
  trainerExperience?: string;
  rating: number;
  enrolledCount: number;
  requiredCompetencies: { name: string; minLevel: number }[];
  learningOutcomes: string[];
  thumbnailUrl: string;
  status: 'published' | 'draft' | 'archived';
  modules: CourseModule[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  traineeId: string;
  progressPercent: number;
  status: 'active' | 'completed' | 'dropped';
  currentModuleId: string;
  completedModuleIds: string[];
  enrolledAt: string;
  lastAccessedAt: string;
  certificateId?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface Assessment {
  id: string;
  courseId?: string;
  courseTitle?: string;
  subject: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScorePercent: number;
  questions: AssessmentQuestion[];
  deadline?: string;
  competencyCovered: string;
  status: 'published' | 'draft' | 'closed';
  createdAt: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  traineeId: string;
  traineeName: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  scorePercent: number;
  isPassed: boolean;
  attemptedAt: string;
  competencyUpdated: string;
  competencyGain: number; // e.g. +7%
}

export interface Certificate {
  id: string;
  certificateCode: string;
  traineeId: string;
  traineeName: string;
  courseId: string;
  courseTitle: string;
  trainerName: string;
  issuedDate: string;
  scorePercent: number;
  competenciesAchieved: string[];
  verificationUrl: string;
}

export interface TrainerResource {
  id: string;
  trainerId: string;
  title: string;
  type: 'lecture_video' | 'presentation' | 'pdf' | 'study_material';
  fileUrl: string;
  driveUrl?: string;
  fileSizeMb: number;
  subject: string;
  courseId?: string;
  uploadedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'achievement' | 'new_content';
  audience: 'all' | 'trainees' | 'trainers';
  publishedBy: string;
  publishedAt: string;
}

export interface CourseFeedback {
  id: string;
  courseId: string;
  traineeId: string;
  traineeName: string;
  courseRating: number; // 1-5
  trainerRating: number; // 1-5
  contentRating: number; // 1-5
  feedbackText: string;
  submittedAt: string;
}

export interface MentorshipSession {
  id: string;
  traineeId: string;
  traineeName: string;
  trainerId: string;
  trainerName: string;
  skillGap: string;
  scheduledDate: string;
  timeSlot: string;
  status: 'confirmed' | 'pending' | 'completed';
  notes?: string;
  meetingLink?: string;
  bookedAt: string;
}

export interface SkillGapDemand {
  id: string;
  skillName: string;
  category: string;
  traineeCount: number;
  averageGapPercent: number;
  urgency: 'Critical' | 'Moderate' | 'Standard';
  topCourseRecommendation: string;
}

export interface TrainerWorkshop {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  targetSkillGap: string;
  date: string;
  time: string;
  registeredCount: number;
  maxSeats: number;
  meetUrl: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  ctcPackage: string;
  type: 'Full-time' | 'Remote' | 'Hybrid';
  requiredSkills: string[];
  minEligibilityScore: number;
  openings: number;
  applicantsCount: number;
  shortlistedCount: number;
  status: 'active' | 'closed';
  postedDate: string;
}

export interface InternshipOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  ppoOpportunity: boolean;
  eligibleYears: string[];
  requiredSkills: string[];
  applicantsCount: number;
  openings: number;
  status: 'active' | 'closed';
  deadline: string;
}

export interface StudentCohortRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  degree: string;
  yearOfStudy: string;
  verifiedSkillsCount: number;
  diagnosedGaps: string[];
  readinessScore: number;
  assignedTrainer?: string;
  status: 'active' | 'placed' | 'needs_remediation';
}
