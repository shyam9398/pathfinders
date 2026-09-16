import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

interface AppWrapperProps {
  children: ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isLoading: languageLoading } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Show choose language before home on initial session launch
    const sessionLangChosen = sessionStorage.getItem('pf_session_lang_selected');
    return !sessionLangChosen;
  });

  const handleLanguageComplete = () => {
    setShowLanguageSelector(false);
    sessionStorage.setItem('pf_session_lang_selected', 'true');
    localStorage.setItem('pf_lang_selected', 'true');
    // Open Home page
    navigate('/main');
  };

  // Step 1: Show language selector if not selected yet
  if (showLanguageSelector) {
    return (
      <LanguageSelector
        isOpen={true}
        onComplete={handleLanguageComplete}
        showAsModal={false}
      />
    );
  }

  // Show loading if auth or language is still loading
  if (authLoading || languageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render main app
  return <>{children}</>;
};

export default AppWrapper;