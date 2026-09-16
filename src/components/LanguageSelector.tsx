import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/types';
import { Globe, Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface LanguageSelectorProps {
  isOpen: boolean;
  onComplete: () => void;
  showAsModal?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isOpen,
  onComplete,
  showAsModal = true
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  const languages = [
    {
      code: 'en' as Language,
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      tagline: 'Standard Technical Curriculum & Global Industry Standards',
      region: 'International'
    },
    {
      code: 'hi' as Language,
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      tagline: 'भारत की राष्ट्रभाषा • पूरी तरह हिंदी में सीखें और आगे बढ़ें',
      region: 'भारत (India)'
    },
    {
      code: 'te' as Language,
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳',
      tagline: 'ఆంధ్రప్రదేశ్ & తెలంగాణ • మాతృభాషలో సులభంగా అర్థం చేసుకోండి',
      region: 'ఆంధ్ర & తెలంగాణ'
    }
  ];

  const handleLanguageSelect = async (lang: Language) => {
    setSelectedLang(lang);
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pf_lang_selected', 'true');
      localStorage.setItem('pf_initial_lang_selected', 'true');
      sessionStorage.setItem('pf_session_lang_selected', 'true');
    }
    // Small timeout for smooth animation transition
    setTimeout(() => {
      onComplete();
    }, 150);
  };

  const content = (
    <div className="space-y-6 max-w-lg mx-auto w-full">
      {/* Header with platform badge */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5" />
          <span>PathFinders — Language Preference</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          Choose Your Language
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 font-medium space-y-1">
          <p className="text-slate-200">भाषा चुनें • మీ ప్రాధాన్య భాషను ఎంచుకోండి</p>
          <p className="text-slate-400 text-xs">
            Every module, guide, and AI recommendation will immediately adapt to your choice.
          </p>
        </div>
      </div>

      {/* Language Selection Cards */}
      <div className="grid gap-3.5">
        {languages.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <Card
              key={lang.code}
              id={`lang-card-${lang.code}`}
              className={`p-4 sm:p-5 cursor-pointer transition-all duration-200 rounded-2xl relative overflow-hidden group ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40 hover:bg-slate-850'
              }`}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    {lang.flag}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-blue-400 transition-colors">
                        {lang.nativeName}
                      </h3>
                      {lang.name !== lang.nativeName && (
                        <span className="text-xs text-slate-400 font-medium">({lang.name})</span>
                      )}
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-slate-700 text-slate-400">
                        {lang.region}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">
                      {lang.tagline}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-in zoom-in-75 duration-150">
                      <Check className="w-4.5 h-4.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-slate-700 text-slate-500 flex items-center justify-center group-hover:border-blue-500/50 group-hover:text-blue-400 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Multilingual Auto-Persistence</span>
        </div>
        <span>Can be changed anytime in Settings</span>
      </div>
    </div>
  );

  if (!showAsModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background glow aesthetics */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onComplete(); }}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-lg p-6 sm:p-8 rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Change Language</DialogTitle>
          <DialogDescription>Select your preferred platform language</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelector;