import { supabase } from '@/integrations/supabase/client';

export interface StoredResume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string;
  extractedText?: string;
  atsScore: number;
  targetCareer: string;
  analysis: any;
  skills: string[];
  education: string[];
  experience: string[];
  projects: string[];
  certifications: string[];
  detectedSkillGaps: string[];
  recommendedCareers: string[];
  recommendedJobs: StoredJobRecommendation[];
  createdAt: string;
}

export interface StoredJobRecommendation {
  id: string;
  resumeId: string;
  jobTitle: string;
  company: string;
  matchPercentage: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  source: string;
  createdAt: string;
}

const STORAGE_KEY = 'pf_user_resumes';

export const resumeService = {
  // Get all resumes for a given user
  async getUserResumes(userId: string): Promise<StoredResume[]> {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('resumes' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          fileName: row.file_name,
          fileUrl: row.file_url,
          extractedText: row.extracted_text,
          atsScore: row.ats_score,
          targetCareer: row.recommended_careers?.[0] || 'Software Engineer',
          analysis: row.analysis,
          skills: row.skills || [],
          education: row.education || [],
          experience: row.experience || [],
          projects: row.projects || [],
          certifications: row.certifications || [],
          detectedSkillGaps: row.detected_skill_gaps || [],
          recommendedCareers: row.recommended_careers || [],
          recommendedJobs: row.recommended_jobs || [],
          createdAt: row.created_at
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch resumes fallback:', err);
    }

    // 2. Fallback to LocalStorage
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // Initial default seed resumes if completely empty
    const seed: StoredResume[] = [
      {
        id: 'seed-res-1',
        userId,
        fileName: 'Pavan_Kumar_Software_Engineer_Resume.pdf',
        atsScore: 84,
        targetCareer: 'Full-Stack Software Engineer',
        analysis: { overallScore: 84, feedback: 'Strong foundational backend skills with room for Docker and Cloud containerization experience.' },
        skills: ['Java', 'Spring Boot', 'SQL', 'Data Structures', 'REST APIs', 'Git'],
        education: ['B.Tech Computer Science & Engineering, JNTU (2025)'],
        experience: ['Software Engineering Intern - Cloud Systems (6 months)'],
        projects: ['High-Concurrency Task Queue', 'Real-Time E-Commerce Microservices'],
        certifications: ['Oracle Certified Java Associate'],
        detectedSkillGaps: ['Docker', 'Kubernetes', 'Redis Caching'],
        recommendedCareers: ['Full-Stack Software Engineer', 'Java Backend Architect', 'DevOps Specialist'],
        recommendedJobs: [
          {
            id: 'job-1',
            resumeId: 'seed-res-1',
            jobTitle: 'Junior Java Backend Developer',
            company: 'Infosys Enterprise Solutions',
            matchPercentage: 88,
            requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
            matchedSkills: ['Java', 'Spring Boot', 'PostgreSQL'],
            missingSkills: ['Docker'],
            source: 'PathFinder AI Job Engine',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          },
          {
            id: 'job-2',
            resumeId: 'seed-res-1',
            jobTitle: 'Associate Software Engineer',
            company: 'TCS Digital R&D',
            matchPercentage: 82,
            requiredSkills: ['Java', 'Data Structures', 'REST APIs', 'Kubernetes'],
            matchedSkills: ['Java', 'Data Structures', 'REST APIs'],
            missingSkills: ['Kubernetes'],
            source: 'PathFinder AI Job Engine',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'seed-res-2',
        userId,
        fileName: 'Pavan_Kumar_Data_Analyst_Resume.pdf',
        atsScore: 91,
        targetCareer: 'Data Analyst & BI Specialist',
        analysis: { overallScore: 91, feedback: 'Exceptional quantitative presentation, clean formatting, and high keyword coverage for data analytics.' },
        skills: ['Python', 'SQL', 'Pandas', 'Tableau', 'Statistics', 'Power BI'],
        education: ['B.Tech Computer Science & Engineering, JNTU (2025)'],
        experience: ['Business Intelligence Analyst Trainee'],
        projects: ['Predictive Sales Forecasting Model', 'Hospital Readmissions Dashboard'],
        certifications: ['Tableau Desktop Specialist'],
        detectedSkillGaps: ['Snowflake Data Warehouse', 'Airflow Pipelines'],
        recommendedCareers: ['Data Analyst', 'BI Engineer', 'Data Scientist'],
        recommendedJobs: [
          {
            id: 'job-3',
            resumeId: 'seed-res-2',
            jobTitle: 'Data Analyst — Operations Analytics',
            company: 'Wipro Analytics',
            matchPercentage: 92,
            requiredSkills: ['Python', 'SQL', 'Tableau', 'Statistics'],
            matchedSkills: ['Python', 'SQL', 'Tableau', 'Statistics'],
            missingSkills: [],
            source: 'PathFinder AI Job Engine',
            createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
      }
    ];

    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(seed));
    } catch (e) {}

    return seed;
  },

  // Store a newly scanned/analyzed resume
  async saveResume(userId: string, data: {
    fileName: string;
    fileUrl?: string;
    extractedText?: string;
    atsScore: number;
    targetCareer?: string;
    analysis: any;
    skills: string[];
    education?: string[];
    experience?: string[];
    projects?: string[];
    certifications?: string[];
    detectedSkillGaps?: string[];
  }): Promise<StoredResume> {
    const resumeId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const targetCareer = data.targetCareer || data.skills.includes('Python') ? 'Data Scientist / ML Engineer' : 'Full-Stack Software Engineer';

    // Generate AI Job Recommendations based on extracted skills
    const jobs: StoredJobRecommendation[] = [
      {
        id: `job-rec-${Date.now()}-1`,
        resumeId,
        jobTitle: `Junior ${targetCareer}`,
        company: 'Cognizant NextGen Tech',
        matchPercentage: Math.min(95, Math.max(70, data.atsScore + 4)),
        requiredSkills: data.skills.slice(0, 4),
        matchedSkills: data.skills.slice(0, 3),
        missingSkills: data.detectedSkillGaps?.slice(0, 2) || ['Docker', 'AWS'],
        source: 'PathFinder AI Job Engine',
        createdAt: new Date().toISOString()
      },
      {
        id: `job-rec-${Date.now()}-2`,
        resumeId,
        jobTitle: `${targetCareer} — Associate`,
        company: 'Capgemini Accelerate',
        matchPercentage: Math.min(92, Math.max(65, data.atsScore - 3)),
        requiredSkills: [...data.skills.slice(0, 3), 'System Design'],
        matchedSkills: data.skills.slice(0, 3),
        missingSkills: ['System Design'],
        source: 'PathFinder AI Job Engine',
        createdAt: new Date().toISOString()
      }
    ];

    const newRecord: StoredResume = {
      id: resumeId,
      userId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      extractedText: data.extractedText,
      atsScore: data.atsScore,
      targetCareer,
      analysis: data.analysis,
      skills: data.skills,
      education: data.education || ['B.Tech / Graduate'],
      experience: data.experience || ['Academic & Internship Projects'],
      projects: data.projects || ['Full-Stack Capacity Platform'],
      certifications: data.certifications || [],
      detectedSkillGaps: data.detectedSkillGaps || ['Cloud Architecture', 'Distributed Caching'],
      recommendedCareers: [targetCareer, 'Cloud Solutions Engineer'],
      recommendedJobs: jobs,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Supabase
    try {
      await supabase.from('resumes' as any).insert({
        id: resumeId,
        user_id: userId,
        file_name: data.fileName,
        file_url: data.fileUrl,
        extracted_text: data.extractedText,
        ats_score: data.atsScore,
        analysis: data.analysis,
        skills: data.skills,
        education: newRecord.education,
        experience: newRecord.experience,
        projects: newRecord.projects,
        certifications: newRecord.certifications,
        detected_skill_gaps: newRecord.detectedSkillGaps,
        recommended_careers: newRecord.recommendedCareers,
        recommended_jobs: jobs
      });
    } catch (err) {
      console.warn('Supabase resume save fallback:', err);
    }

    // 2. Save to LocalStorage
    try {
      const existing = await this.getUserResumes(userId);
      const updated = [newRecord, ...existing.filter(r => r.id !== resumeId)];
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    } catch (e) {}

    return newRecord;
  },

  // Delete resume with STRICT CASCADING of resume-derived data only (Requirement 7 & 19)
  async deleteResume(userId: string, resumeId: string): Promise<boolean> {
    // 1. Delete in Supabase (Cascades to job_recommendations and resume_derived recommendations)
    try {
      await supabase
        .from('resumes' as any)
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId);

      await supabase
        .from('job_recommendations' as any)
        .delete()
        .eq('resume_id', resumeId);
    } catch (err) {
      console.warn('Supabase resume delete fallback:', err);
    }

    // 2. Delete in LocalStorage
    try {
      const existing = await this.getUserResumes(userId);
      const filtered = existing.filter(r => r.id !== resumeId);
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  }
};
