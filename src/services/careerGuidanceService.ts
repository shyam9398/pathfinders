import { supabase } from '@/integrations/supabase/client';

export interface StoredCareerGuidanceAnalysis {
  id: string;
  userId: string;
  targetCareer: string;
  matchPercentage: number;
  skills: string[];
  interests: string[];
  goals: string;
  requiredSkills: string[];
  skillGaps: string[];
  recommendedTrainers: Array<{
    name: string;
    subject: string;
    experience: string;
    rating: number;
    matchPercentage: number;
  }>;
  createdAt: string;
}

const STORAGE_KEY = 'pf_career_guidance_history';

export const careerGuidanceService = {
  async getAnalyses(userId: string): Promise<StoredCareerGuidanceAnalysis[]> {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('career_guidance_analyses' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          targetCareer: row.recommended_careers?.[0] || 'Software Engineer',
          matchPercentage: row.career_scores?.[0] || 84,
          skills: row.skills || [],
          interests: row.interests || [],
          goals: row.goals || '',
          requiredSkills: row.required_skills || [],
          skillGaps: row.skill_gaps || [],
          recommendedTrainers: row.recommended_trainers || [],
          createdAt: row.created_at
        }));
      }
    } catch (e) {
      console.warn('Supabase guidance analyses fallback:', e);
    }

    // 2. Try LocalStorage
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // Default Seed Analyses (matching Requirement 6)
    const seed: StoredCareerGuidanceAnalysis[] = [
      {
        id: 'guidance-1',
        userId,
        targetCareer: 'Data Scientist & ML Engineer',
        matchPercentage: 82,
        skills: ['Python', 'Pandas', 'Statistics', 'SQL'],
        interests: ['Predictive Modeling', 'Machine Learning', 'Big Data'],
        goals: 'Become a lead Machine Learning Scientist at an AI product firm.',
        requiredSkills: ['Python', 'SQL', 'Deep Learning', 'Statistics', 'PyTorch'],
        skillGaps: ['Deep Learning', 'PyTorch', 'Distributed ML'],
        recommendedTrainers: [
          { name: 'Dr. Rakesh Sharma', subject: 'Machine Learning & AI', experience: '9 years', rating: 4.9, matchPercentage: 96 },
          { name: 'Priya Narayanan', subject: 'Database Systems & SQL', experience: '7 years', rating: 4.8, matchPercentage: 90 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'guidance-2',
        userId,
        targetCareer: 'Full-Stack Software Engineer',
        matchPercentage: 76,
        skills: ['Java', 'Spring Boot', 'Data Structures'],
        interests: ['Web Systems', 'Enterprise Architecture', 'Cloud APIs'],
        goals: 'Architect enterprise microservices with high resilience.',
        requiredSkills: ['Java', 'Docker', 'Kubernetes', 'System Design', 'React'],
        skillGaps: ['Docker', 'Kubernetes', 'System Design'],
        recommendedTrainers: [
          { name: 'Priya Narayanan', subject: 'Java & Microservices', experience: '7 years', rating: 4.8, matchPercentage: 94 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ];

    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(seed));
    } catch (e) {}

    return seed;
  },

  async saveAnalysis(userId: string, data: {
    targetCareer: string;
    matchPercentage: number;
    skills: string[];
    interests: string[];
    goals: string;
    requiredSkills: string[];
    skillGaps: string[];
    recommendedTrainers: any[];
  }): Promise<StoredCareerGuidanceAnalysis> {
    const id = `cg-${Date.now()}`;
    const newRecord: StoredCareerGuidanceAnalysis = {
      id,
      userId,
      targetCareer: data.targetCareer,
      matchPercentage: data.matchPercentage,
      skills: data.skills,
      interests: data.interests,
      goals: data.goals,
      requiredSkills: data.requiredSkills,
      skillGaps: data.skillGaps,
      recommendedTrainers: data.recommendedTrainers,
      createdAt: new Date().toISOString()
    };

    // 1. Try Supabase
    try {
      await supabase.from('career_guidance_analyses' as any).insert({
        id,
        user_id: userId,
        input_data: { skills: data.skills, interests: data.interests, goals: data.goals },
        recommended_careers: [data.targetCareer],
        required_skills: data.requiredSkills,
        skill_gaps: data.skillGaps,
        recommended_trainers: data.recommendedTrainers
      });

      await supabase.from('career_recommendations' as any).insert({
        user_id: userId,
        analysis_id: id,
        career_name: data.targetCareer,
        match_percentage: data.matchPercentage,
        required_skills: data.requiredSkills,
        skill_gaps: data.skillGaps
      });
    } catch (e) {
      console.warn('Supabase guidance save fallback:', e);
    }

    // 2. Save in LocalStorage
    try {
      const existing = await this.getAnalyses(userId);
      const updated = [newRecord, ...existing.filter(item => item.id !== id)];
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    } catch (e) {}

    return newRecord;
  }
};
