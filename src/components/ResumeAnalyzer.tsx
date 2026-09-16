import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Loader2, Upload, X, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeResumeLocally } from '@/utils/resumeAnalyzer';

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
  shortTermGoals: string;
  longTermGoals: string;
  careerTransition: string;
  studyOrJob: string;
  locationPreference: string;
  companyType: string;
  financialSupport: string;
}

interface ResumeAnalyzerProps {
  profileData: ProfileData | null;
  onAnalysisComplete: (analysis: string) => void;
}

export const ResumeAnalyzer = ({ profileData, onAnalysisComplete }: ResumeAnalyzerProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    
    // Debug log
    console.log('[ResumeAnalyzer] DEBUG - Resume text length:', resumeText.trim().length, 'characters');
    
    if (resumeText.trim().length < 50) {
      onAnalysisComplete('❌ **Error:** Resume text is too short. Please provide more content for analysis.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    const startTime = Date.now();

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 98) return prev;
        const inc = prev < 40 
          ? Math.floor(Math.random() * 5) + 3 
          : prev < 75 
            ? Math.floor(Math.random() * 3) + 2 
            : Math.floor(Math.random() * 2) + 1;
        return Math.min(98, prev + inc);
      });
    }, 90);

    try {
      // Build language-specific system prompt
      const languagePrompts: Record<string, string> = {
        en: 'Analyze this resume and provide detailed, personalized feedback in English.',
        hi: 'इस रिज्यूमे का विश्लेषण करें और हिंदी में विस्तृत, व्यक्तिगत प्रतिक्रिया दें।',
        te: 'ఈ రెజ్యూమేను విశ్లేషించండి మరియు తెలుగులో వివరమైన, వ్యక్తిగత అభిప్రాయాన్ని అందించండి।'
      };
      
      const systemPrompt = languagePrompts[language] || languagePrompts.en;
      
      console.log('[ResumeAnalyzer] Calling edge function with resume of', resumeText.trim().length, 'characters');
      
      // Call the edge function with the actual resume text, with graceful smart fallback
      let analysis: any = null;
      let explanation: string = '';

      try {
        const { data, error } = await supabase.functions.invoke('analyze-resume', {
          body: {
            resumeText: resumeText.trim(),
            targetRole: profileData?.shortTermGoals || 'General career guidance',
            language: language,
            userId: user?.id,
            systemPrompt: systemPrompt
          }
        });

        if (error || data?.error || !data?.analysis) {
          console.warn('[ResumeAnalyzer] Edge function failed, using smart local analyzer:', error || data?.error);
          const local = analyzeResumeLocally(resumeText.trim(), language, profileData?.shortTermGoals || 'General career guidance');
          analysis = local.analysis;
          explanation = local.explanation;
        } else {
          analysis = data.analysis;
          explanation = data.explanation || '';
        }
      } catch (err) {
        console.warn('[ResumeAnalyzer] Exception calling edge function, using smart local analyzer:', err);
        const local = analyzeResumeLocally(resumeText.trim(), language, profileData?.shortTermGoals || 'General career guidance');
        analysis = local.analysis;
        explanation = local.explanation;
      }

      // Smooth progress pacing: ensure minimum elapsed time so user sees dynamic progress count up
      const elapsed = Date.now() - startTime;
      if (elapsed < 1400) {
        await new Promise(r => setTimeout(r, 1400 - elapsed));
      }

      clearInterval(interval);
      setAnalysisProgress(100);
      await new Promise(r => setTimeout(r, 800));

      // Format the analysis response
      if (analysis) {
        const formattedResponse = formatAnalysisResponse(analysis, language);
        onAnalysisComplete(formattedResponse);
      } else {
        onAnalysisComplete(explanation || '❌ No analysis received from AI.');
      }
    } catch (error) {
      clearInterval(interval);
      console.error('Resume analysis error:', error);
      onAnalysisComplete(`❌ **Error analyzing resume:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  // Format the AI analysis into a readable response
  const formatAnalysisResponse = (analysis: any, lang: string): string => {
    const headers = {
      en: {
        title: '📋 **Resume Analysis Results**',
        atsScore: '🤖 **ATS Compatibility Score**',
        jobMatch: '🎯 **Job Match Score**',
        keywordCoverage: '🔍 **Keyword Coverage**',
        careerHealth: '💼 **Career Health**',
        missingSkills: '⚠️ **Missing Skills**',
        quickFixes: '🔧 **Quick Fixes**',
        recommendations: '💡 **Recommendations**',
        summary: '📝 **Summary**'
      },
      hi: {
        title: '📋 **रिज्यूमे विश्लेषण परिणाम**',
        atsScore: '🤖 **ATS संगतता स्कोर**',
        jobMatch: '🎯 **नौकरी मिलान स्कोर**',
        keywordCoverage: '🔍 **कीवर्ड कवरेज**',
        careerHealth: '💼 **करियर स्वास्थ्य**',
        missingSkills: '⚠️ **लापता कौशल**',
        quickFixes: '🔧 **त्वरित सुधार**',
        recommendations: '💡 **सिफारिशें**',
        summary: '📝 **सारांश**'
      },
      te: {
        title: '📋 **రెజ్యూమే విశ్లేషణ ఫలితాలు**',
        atsScore: '🤖 **ATS అనుకూలత స్కోర్**',
        jobMatch: '🎯 **ఉద్యోగ సరిపోలిక స్కోర్**',
        keywordCoverage: '🔍 **కీవర్డ్ కవరేజ్**',
        careerHealth: '💼 **కెరీర్ ఆరోగ్యం**',
        missingSkills: '⚠️ **తప్పిపోయిన నైపుణ్యాలు**',
        quickFixes: '🔧 **త్వరిత పరిష్కారాలు**',
        recommendations: '💡 **సిఫార్సులు**',
        summary: '📝 **సారాంశం**'
      }
    };

    const h = headers[lang as keyof typeof headers] || headers.en;

    let response = `${h.title}\n\n`;
    response += `${h.atsScore}: **${analysis.atsScore || 0}/100**\n`;
    response += `${h.jobMatch}: **${analysis.jobMatchScore || 0}/100**\n`;
    response += `${h.keywordCoverage}: **${analysis.keywordCoverage || 0}/100**\n`;
    response += `${h.careerHealth}: **${analysis.careerHealth || 'N/A'}**\n\n`;

    if (analysis.missingSkills?.length > 0) {
      response += `${h.missingSkills}:\n`;
      analysis.missingSkills.forEach((skill: string) => {
        response += `- ${skill}\n`;
      });
      response += '\n';
    }

    if (analysis.quickFixes?.length > 0) {
      response += `${h.quickFixes}:\n`;
      analysis.quickFixes.forEach((fix: string) => {
        response += `- ${fix}\n`;
      });
      response += '\n';
    }

    if (analysis.recommendations?.length > 0) {
      response += `${h.recommendations}:\n`;
      analysis.recommendations.forEach((rec: string) => {
        response += `- ${rec}\n`;
      });
      response += '\n';
    }

    if (analysis.explanation) {
      response += `${h.summary}:\n${analysis.explanation}\n`;
    }

    return response;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Import FileParser dynamically to avoid issues with SSR
    const { FileParser } = await import('@/utils/fileParser');

    // Validate file
    const validation = FileParser.validateFile(file);
    if (!validation.isValid) {
      onAnalysisComplete(`❌ **File Upload Error:** ${validation.error}`);
      return;
    }

    setIsProcessingFile(true);
    setUploadedFile(file);

    try {
      const extractedText = await FileParser.parseFile(file);
      setResumeText(extractedText);
      onAnalysisComplete(`✅ **File processed successfully!** Resume content extracted from ${file.name}. You can now analyze it or edit the text if needed.`);
    } catch (error) {
      onAnalysisComplete(`❌ **File Processing Error:** ${error instanceof Error ? error.message : 'Failed to process file'}`);
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setResumeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <Card className="glass-card p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
        <h3 className="font-semibold">Resume Analyzer</h3>
      </div>

      <div className="space-y-4">
            <Alert>
          <AlertDescription className="text-sm">
            🚀 <strong>Advanced Resume Analyzer</strong> - Upload your resume in any format (PDF, DOC, DOCX, TXT, RTF, CSV, PPTX, XLSX) for comprehensive AI analysis including ATS scoring, skills matching, and personalized recommendations.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="text">Paste Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-[hsl(var(--glass-border-bright))] rounded-lg p-8 text-center hover:border-[hsl(var(--cyber-purple))] transition-colors">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload your resume</p>
                  <p className="text-xs text-muted-foreground">
                    ✨ Supported: PDF, DOC, DOCX, TXT, RTF, CSV, PPTX, XLSX (Max 15MB)
                  </p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf,.csv,.pptx,.xlsx"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                  className="mt-4 cursor-pointer file:cursor-pointer"
                />
              </div>
            ) : (
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-[hsl(var(--cyber-green))]" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isProcessingFile && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing file...</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Paste your resume content here:
              </label>
              <Textarea
                placeholder="Copy and paste your entire resume content here for comprehensive analysis..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px] glass-card"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {resumeText.trim() && (
          <div className="glass-card p-3 bg-[hsl(var(--cyber-green)/0.1)] border-[hsl(var(--cyber-green)/0.3)]">
            <p className="text-sm text-[hsl(var(--cyber-green))]">
              ✅ Resume content ready for analysis ({resumeText.length} characters)
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-900/60 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
                {analysisProgress < 40 ? 'Parsing document text & syntax...' : analysisProgress < 75 ? 'Calculating ATS keywords & job alignment...' : analysisProgress < 100 ? 'Synthesizing strengths & missing skills...' : 'Analysis Complete!'}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {analysisProgress}%
              </span>
            </div>
            <Progress value={analysisProgress} className="h-2.5 bg-slate-100 dark:bg-slate-800 transition-all duration-300 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-indigo-500" />
            
            <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-center font-medium">
              <div className={`p-1.5 rounded-lg transition-colors ${analysisProgress >= 30 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60' : 'bg-slate-50 text-slate-400 dark:bg-slate-800/40'}`}>
                Text Scanned
              </div>
              <div className={`p-1.5 rounded-lg transition-colors ${analysisProgress >= 70 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60' : 'bg-slate-50 text-slate-400 dark:bg-slate-800/40'}`}>
                ATS Scored
              </div>
              <div className={`p-1.5 rounded-lg transition-colors ${analysisProgress >= 100 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60' : 'bg-slate-50 text-slate-400 dark:bg-slate-800/40'}`}>
                Report Ready
              </div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleAnalyzeResume}
          disabled={!resumeText.trim() || isAnalyzing || isProcessingFile}
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Analyze Resume & Get Detailed Feedback
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};