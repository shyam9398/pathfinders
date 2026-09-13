import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { ProfileForm } from './ProfileForm';
import { CareerAnalyzer } from './CareerAnalyzer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  name: string;
  age: string;
  country: string;
  educationLevel: string;
  fieldOfStudy: string;
  specialization: string;
  currentYear: string;
  certifications: string;
  skills: string;
  interests: string;
  workEnvironment: string;
  goals: string;
  careerTransition: string;
  studyOrJob: string;
  locationPreference: string;
  companyType: string;
  financialSupport: string;
  resumeText?: string;
}

export const CareerGuidePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'hero' | 'form' | 'analyzer'>('hero');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Attempt to load existing user profile from Supabase on mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) {
        setInitialLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('career_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error) {
          const loaded: ProfileData = {
            name: data.name || '',
            age: data.age || '',
            country: data.country || '',
            educationLevel: data.education_level || '',
            fieldOfStudy: data.field_of_study || '',
            specialization: data.specialization || '',
            currentYear: data.current_year || '',
            certifications: data.certifications || '',
            skills: data.skills || '',
            interests: data.interests || '',
            workEnvironment: data.work_environment || '',
            goals: data.short_term_goals || data.long_term_goals || '',
            careerTransition: data.career_transition || '',
            studyOrJob: data.study_or_job || '',
            locationPreference: data.location_preference || '',
            companyType: data.company_type || '',
            financialSupport: data.financial_support || '',
          };
          setProfileData(loaded);
          // If the profile has at least skills or education, go directly to analyzer
          if (loaded.skills || loaded.fieldOfStudy) {
            setCurrentView('analyzer');
          }
        }
      } catch (err) {
        console.error('Error fetching profile in CareerGuidePage:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingProfile();
  }, [user]);

  const handleStartChat = () => {
    setCurrentView('form');
  };

  const handleFormComplete = (data: ProfileData) => {
    setProfileData(data);
    setCurrentView('analyzer');
  };

  const handleBackToHome = () => {
    setCurrentView('hero');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your Career Guide...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'hero') {
    return <HeroSection onStartChat={handleStartChat} />;
  }

  if (currentView === 'form') {
    return (
      <ProfileForm 
        initialData={profileData} 
        onComplete={handleFormComplete} 
        onBack={profileData ? () => setCurrentView('analyzer') : handleBackToHome} 
      />
    );
  }

  if (currentView === 'analyzer' && profileData) {
    return (
      <CareerAnalyzer 
        profileData={profileData} 
        onBack={handleBackToHome}
        onEditProfile={() => setCurrentView('form')}
      />
    );
  }

  return <HeroSection onStartChat={handleStartChat} />;
};