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
  const { language, isLoading: languageLoading } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Show choose language before home on initial session launch
    const sessionLangChosen = sessionStorage.getItem('pf_session_lang_selected');
    return !sessionLangChosen;
  });

  // Ensure all features and page navigations open at the top of the page
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      const scrollables = document.querySelectorAll(
        'main, [class*="overflow-y-auto"], [class*="overflow-auto"], #root'
      );
      scrollables.forEach((el) => {
        el.scrollTop = 0;
      });
    };

    scrollToTop();
    const frameId = requestAnimationFrame(scrollToTop);
    const timerId = setTimeout(scrollToTop, 60);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [location.pathname, location.search]);

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
  return <div key={"app-lang-" + language} className="contents">{children}</div>;
};

export default AppWrapper;