import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ProfileFormProps {
  onComplete: (data: ProfileData) => void;
  onBack: () => void;
  initialData?: Partial<ProfileData> | null;
}

interface FieldError {
  fieldOfStudy?: string;
  interests?: string;
  goals?: string;
  skills?: string;
}

// Validation helper functions
const containsLetters = (text: string): boolean => {
  return /[a-zA-Z]/.test(text);
};

const isNonsenseInput = (text: string): boolean => {
  const trimmed = text.trim().toLowerCase();
  if (/(.)\1{4,}/i.test(trimmed)) return true;
  const keyboardPatterns = ['qwert', 'asdfg', 'zxcvb', 'qazws', 'poiuy', 'lkjhg', 'mnbvc'];
  if (keyboardPatterns.some(p => trimmed.includes(p))) return true;
  return false;
};

const validateEducationField = (value: string, t: (key: string, fallback?: string) => string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return t('validation.fieldRequired', 'This field is required');
  }
  if (!containsLetters(trimmed) || isNonsenseInput(trimmed)) {
    return t('validation.educationInvalid', 'Please enter a valid education background (e.g., BTech CSE, BSc, Diploma, etc.)');
  }
  return undefined;
};

const validateDescriptiveField = (value: string, t: (key: string, fallback?: string) => string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return t('validation.fieldRequired', 'This field is required');
  }
  if (!containsLetters(trimmed) || isNonsenseInput(trimmed)) {
    return t('validation.descriptiveInvalid', 'Please describe this in a clear and meaningful way, not just a random word');
  }
  return undefined;
};

export const ProfileForm = ({ onComplete, onBack, initialData }: ProfileFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileData>({
    name: initialData?.name || '',
    age: initialData?.age || '',
    country: initialData?.country || '',
    educationLevel: initialData?.educationLevel || '',
    fieldOfStudy: initialData?.fieldOfStudy || '',
    specialization: initialData?.specialization || '',
    currentYear: initialData?.currentYear || '',
    certifications: initialData?.certifications || '',
    skills: initialData?.skills || '',
    interests: initialData?.interests || '',
    workEnvironment: initialData?.workEnvironment || '',
    goals: initialData?.goals || '',
    careerTransition: initialData?.careerTransition || '',
    studyOrJob: initialData?.studyOrJob || '',
    locationPreference: initialData?.locationPreference || '',
    companyType: initialData?.companyType || '',
    financialSupport: initialData?.financialSupport || '',
    resumeText: initialData?.resumeText || ''
  });
  
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateField = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FieldError]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FieldError) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = field === 'fieldOfStudy' 
      ? validateEducationField(formData[field], t)
      : validateDescriptiveField(formData[field], t);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAllFields = (): boolean => {
    const fieldOfStudyError = validateEducationField(formData.fieldOfStudy, t);
    const interestsError = validateDescriptiveField(formData.interests, t);
    const goalsError = validateDescriptiveField(formData.goals, t);
    const skillsError = validateDescriptiveField(formData.skills, t);
    
    const newErrors: FieldError = {
      fieldOfStudy: fieldOfStudyError,
      interests: interestsError,
      goals: goalsError,
      skills: skillsError,
    };
    
    setErrors(newErrors);
    setTouched({
      fieldOfStudy: true,
      interests: true,
      goals: true,
      skills: true,
    });
    
    return !fieldOfStudyError && !interestsError && !goalsError && !skillsError;
  };

  const handleSubmit = () => {
    if (!validateAllFields()) {
      toast({
        title: t('validation.formError', 'Form has errors'),
        description: t('validation.pleaseFixErrors', 'Please fix the errors before submitting'),
        variant: 'destructive',
      });
      return;
    }
    onComplete(formData);
  };

  const isFormValid = formData.fieldOfStudy.trim().length >= 1 && 
                      containsLetters(formData.fieldOfStudy) &&
                      formData.interests.trim().length >= 1 &&
                      containsLetters(formData.interests) &&
                      formData.goals.trim().length >= 1 &&
                      containsLetters(formData.goals) &&
                      formData.skills.trim().length >= 1 &&
                      containsLetters(formData.skills);

  const renderFieldError = (field: keyof FieldError) => {
    if (touched[field] && errors[field]) {
      return (
        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errors[field]}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* Step Indicator Card */}
        <Card className="glass-card shadow-xs border-slate-200 dark:border-slate-800">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Step 2 of 3</span>
              <span className="text-xs text-slate-500 font-medium">Quick 4-Question Assessment</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('simpleForm.title', 'Career Profile Questionnaire')}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
              {t('simpleForm.subtitle', 'Provide your background so our AI engine can calculate optimal role matches and learning trajectories.')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Questionnaire Form */}
        <Card className="glass-card shadow-xs border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-8 space-y-6">
            
            {/* Education Background */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fieldOfStudy" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t('simpleForm.educationBackground', 'Education Background')} <span className="text-red-500">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">Degree, major, or current study</span>
              </div>
              <Textarea
                id="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                onBlur={() => handleBlur('fieldOfStudy')}
                placeholder={t('simpleForm.educationPlaceholder', 'e.g., 3rd Year B.Tech in Computer Science, or Diploma in Web Development')}
                className={`rounded-xl text-sm border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 ${touched.fieldOfStudy && errors.fieldOfStudy ? 'border-red-500' : ''}`}
                rows={2}
              />
              {renderFieldError('fieldOfStudy')}
            </div>

            {/* Subjects/Areas Enjoyed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="interests" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t('simpleForm.subjectsEnjoyed', 'Subjects or Areas You Enjoy')} <span className="text-red-500">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">Topics you find exciting</span>
              </div>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => updateField('interests', e.target.value)}
                onBlur={() => handleBlur('interests')}
                placeholder={t('simpleForm.subjectsPlaceholder', 'e.g., Problem solving, algorithms, building mobile apps, data visualization, UI design')}
                className={`rounded-xl text-sm border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 ${touched.interests && errors.interests ? 'border-red-500' : ''}`}
                rows={2}
              />
              {renderFieldError('interests')}
            </div>

            {/* Career Goals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="goals" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t('simpleForm.goals', 'Short & Long Term Goals')} <span className="text-red-500">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">Where you want to be</span>
              </div>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => updateField('goals', e.target.value)}
                onBlur={() => handleBlur('goals')}
                placeholder={t('simpleForm.goalsPlaceholder', 'e.g., Secure a Software Engineer internship this summer, then work as a full-stack developer at a tech company')}
                className={`rounded-xl text-sm border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 ${touched.goals && errors.goals ? 'border-red-500' : ''}`}
                rows={2}
              />
              {renderFieldError('goals')}
            </div>

            {/* Current Skills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="skills" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t('simpleForm.skills', 'Current Technical & Soft Skills')} <span className="text-red-500">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">Tools, languages, frameworks</span>
              </div>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                onBlur={() => handleBlur('skills')}
                placeholder={t('simpleForm.skillsPlaceholder', 'e.g., Python, JavaScript, React, SQL, Git, communication, problem solving')}
                className={`rounded-xl text-sm border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 ${touched.skills && errors.skills ? 'border-red-500' : ''}`}
                rows={2}
              />
              {renderFieldError('skills')}
            </div>

          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium px-5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back', 'Back to Overview')}
          </Button>
          
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span>{t('simpleForm.getRecommendations', 'Generate Career Matches')}</span>
          </Button>
        </div>
    </div>
  );
};