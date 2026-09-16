-- ============================================================================
-- PATHFINDER PLATFORM (PS 26075): COMPREHENSIVE SUPABASE DATABASE SCHEMA
-- ============================================================================
-- All 28 required tables with proper foreign keys, cascading deletion rules,
-- Row Level Security (RLS) policies, and zero plaintext passwords.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. App Role Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('trainee', 'trainer', 'admin');
  END IF;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role public.app_role NOT NULL DEFAULT 'trainee',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Trainer Profiles Table
CREATE TABLE IF NOT EXISTS public.trainer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  qualification TEXT,
  bio TEXT,
  experience_years NUMERIC(4, 1) NOT NULL DEFAULT 0,
  subjects TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  resume_url TEXT,
  availability VARCHAR(100) DEFAULT 'Full-time',
  approval_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'Technology',
  level VARCHAR(50) NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
  trainer_id UUID REFERENCES public.trainer_profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  duration VARCHAR(100),
  rating NUMERIC(3, 2) DEFAULT 4.8,
  enrolled_count INT DEFAULT 0,
  skills_covered TEXT[] DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Course Enrollments Table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'dropped'
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- 6. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL DEFAULT 'Technical',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. User Skills Table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  level INT NOT NULL DEFAULT 1, -- 1-5 or 1-100
  source VARCHAR(50) NOT NULL DEFAULT 'self_reported', -- 'resume', 'assessment', 'self_reported'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- 8. Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  ats_score INT NOT NULL DEFAULT 0,
  analysis JSONB DEFAULT '{}',
  skills JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  detected_skill_gaps JSONB DEFAULT '[]',
  recommended_careers JSONB DEFAULT '[]',
  recommended_jobs JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Career Guidance Analyses Table
CREATE TABLE IF NOT EXISTS public.career_guidance_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  recommended_careers JSONB NOT NULL DEFAULT '[]',
  required_skills JSONB NOT NULL DEFAULT '[]',
  skill_gaps JSONB NOT NULL DEFAULT '[]',
  recommended_trainers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Career Recommendations Table
CREATE TABLE IF NOT EXISTS public.career_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.career_guidance_analyses(id) ON DELETE CASCADE,
  career_name VARCHAR(255) NOT NULL,
  match_percentage INT NOT NULL DEFAULT 0,
  required_skills JSONB NOT NULL DEFAULT '[]',
  skill_gaps JSONB NOT NULL DEFAULT '[]',
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Trainer Recommendations Table
CREATE TABLE IF NOT EXISTS public.trainer_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_gap VARCHAR(255) NOT NULL,
  trainer_id UUID REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  match_percentage INT NOT NULL DEFAULT 90,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Career Roadmaps Table
CREATE TABLE IF NOT EXISTS public.career_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  career_name VARCHAR(255) NOT NULL,
  roadmap_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Roadmap Tasks Table
CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES public.career_roadmaps(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  skill VARCHAR(100),
  due_date TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed'
  xp_reward INT NOT NULL DEFAULT 50,
  completed_at TIMESTAMPTZ
);

-- 14. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit_minutes INT DEFAULT 30,
  passing_score INT DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Assessment Questions Table
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INT NOT NULL DEFAULT 0,
  explanation TEXT
);

-- 16. Assessment Attempts Table
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Career Health Scores Table
CREATE TABLE IF NOT EXISTS public.career_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  overall_score INT NOT NULL DEFAULT 70,
  skill_score INT NOT NULL DEFAULT 70,
  learning_score INT NOT NULL DEFAULT 70,
  consistency_score INT NOT NULL DEFAULT 70,
  job_readiness_score INT NOT NULL DEFAULT 70,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) DEFAULT 'Remote / Hybrid',
  salary_range VARCHAR(100),
  description TEXT,
  required_skills JSONB NOT NULL DEFAULT '[]',
  source VARCHAR(100) DEFAULT 'PathFinder AI Index',
  url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Job Recommendations Table (Cascades upon resume deletion)
CREATE TABLE IF NOT EXISTS public.job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  match_percentage INT NOT NULL DEFAULT 85,
  matched_skills JSONB NOT NULL DEFAULT '[]',
  missing_skills JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Career Updates Table (Personalized by course/technology)
CREATE TABLE IF NOT EXISTS public.career_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  technology VARCHAR(100) NOT NULL DEFAULT 'Python', -- 'Python', 'Java', 'Data Science', 'Full Stack', etc.
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- 'challenge', 'hackathon', 'code_error', 'logic_fix', 'quiz', 'interview_qna', 'learning_tip'
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
  code_snippet TEXT,
  solution_snippet TEXT,
  quiz_options JSONB DEFAULT '[]',
  correct_option INT DEFAULT 0,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. User Update Progress Table
CREATE TABLE IF NOT EXISTS public.user_update_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  update_id UUID REFERENCES public.career_updates(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  score INT DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, update_id)
);

-- 22. Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium',
  xp_reward INT NOT NULL DEFAULT 100,
  starter_code TEXT,
  test_cases JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. Challenge Attempts Table
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'solved', -- 'solved', 'failed'
  score INT NOT NULL DEFAULT 100,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL DEFAULT 'Award',
  requirement_type VARCHAR(50) NOT NULL, -- 'course_completed', 'streak_days', 'challenges_solved', 'quiz_master', 'resume_ready'
  requirement_value INT NOT NULL DEFAULT 1
);

-- 25. User Badges Table (Only earned badges are stored here)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- 26. User Activity Table
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type VARCHAR(100) NOT NULL, -- 'course_lesson', 'assessment', 'challenge', 'resume_upload', 'career_guidance'
  reference_id UUID,
  xp_earned INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 27. Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INT NOT NULL DEFAULT 1,
  longest_streak INT NOT NULL DEFAULT 1,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 28. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'streak'
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 29. Admin Actions Table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'approve_trainer', 'reject_trainer', 'suspend_trainer', 'edit_trainer', 'delete_trainer'
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_guidance_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_update_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Helper to check admin role
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$;

-- RLS: Profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.check_is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.check_is_admin());

-- RLS: Resumes & Derived Data (Users own their resumes, deletion strictly cascades)
CREATE POLICY "Users own resumes" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own career guidance" ON public.career_guidance_analyses FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own career recommendations" ON public.career_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own job recommendations" ON public.job_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own roadmaps" ON public.career_roadmaps FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own health scores" ON public.career_health_scores FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own streaks" ON public.streaks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own badges" ON public.user_badges FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users own activity" ON public.user_activity FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS: Publicly Readable Catalogs
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT TO authenticated USING (status = 'published' OR public.check_is_admin());
CREATE POLICY "Anyone can view approved trainers" ON public.trainer_profiles FOR SELECT TO authenticated USING (approval_status = 'approved' OR auth.uid() = user_id OR public.check_is_admin());
CREATE POLICY "Admins can manage trainers" ON public.trainer_profiles FOR ALL TO authenticated USING (public.check_is_admin());
CREATE POLICY "Anyone can view career updates" ON public.career_updates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Anyone can view badges catalog" ON public.badges FOR SELECT TO authenticated USING (true);
