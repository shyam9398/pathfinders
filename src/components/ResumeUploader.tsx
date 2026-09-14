import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { analyzeResumeLocally } from '@/utils/resumeAnalyzer';

interface ResumeUploaderProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onAnalysisComplete
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consent, setConsent] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Use the FileParser utility for proper file extraction
  const extractTextFromFile = async (file: File): Promise<string> => {
    // Dynamically import FileParser to avoid SSR issues
    const { FileParser } = await import('@/utils/fileParser');
    
    // Validate file first
    const validation = FileParser.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid file');
    }
    
    // Parse and extract text from the file
    const extractedText = await FileParser.parseFile(file);
    
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Could not extract enough text from the file. Please ensure your resume has readable text content.');
    }
    
    return extractedText;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!consent) {
      toast({
        title: t('upload.consentRequired'),
        description: t('upload.consentDescription'),
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError('');

    try {
      // Progress: File reading (25%)
      setProgress(25);
      
      console.log('[ResumeUploader] Starting file extraction for:', file.name);
      
      let resumeText: string;
      try {
        resumeText = await extractTextFromFile(file);
        console.log('[ResumeUploader] DEBUG - Parsed resume length:', resumeText.length, 'characters');
        console.log('[ResumeUploader] DEBUG - First 200 chars:', resumeText.substring(0, 200));
      } catch (extractError) {
        console.error('[ResumeUploader] Extraction failed:', extractError);
        throw new Error(`Failed to extract text from file: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`);
      }
      
      // Progress: Text extracted (50%)
      setProgress(50);
      
      // Validate extracted text length
      if (resumeText.trim().length < 50) {
        throw new Error(`Resume text too short (${resumeText.length} characters). Please ensure your resume file contains readable text content, not just images.`);
      }
      
      console.log('[ResumeUploader] Sending to AI for analysis, text length:', resumeText.length);
      
      // Build language-specific system prompt
      const languagePrompts: Record<string, string> = {
        en: 'Analyze this resume and provide detailed, personalized feedback in English.',
        hi: 'इस रिज्यूमे का विश्लेषण करें और हिंदी में विस्तृत, व्यक्तिगत प्रतिक्रिया दें।',
        te: 'ఈ రెజ్యూమేను విశ్లేషించండి మరియు తెలుగులో వివరమైన, వ్యక్తిగత అభిప్రాయాన్ని అందించండి।'
      };
      
      // Call Supabase edge function for analysis, with automatic fallback to smart local analysis
      let analysisData: any = null;
      let explanation: string = '';
      let rawResponse: string = '';

      try {
        console.log('[ResumeUploader] Attempting edge function analyze-resume...');
        const { data, error: apiError } = await supabase.functions.invoke('analyze-resume', {
          body: {
            resumeText: resumeText.trim(),
            targetRole: 'General career guidance',
            language: language,
            userId: user?.id,
            systemPrompt: languagePrompts[language] || languagePrompts.en
          }
        });

        if (apiError || data?.error || !data?.analysis) {
          console.warn('[ResumeUploader] Edge Function unavailable or returned error, switching to smart local resume analyzer:', apiError || data?.error);
          const localResult = analyzeResumeLocally(resumeText, language, 'General career guidance');
          analysisData = localResult.analysis;
          explanation = localResult.explanation;
          rawResponse = localResult.rawResponse;
        } else {
          analysisData = data.analysis;
          explanation = data.explanation || '';
          rawResponse = data.rawResponse || '';
        }
      } catch (invokeErr) {
        console.warn('[ResumeUploader] Invoke exception, falling back to smart local resume analyzer:', invokeErr);
        const localResult = analyzeResumeLocally(resumeText, language, 'General career guidance');
        analysisData = localResult.analysis;
        explanation = localResult.explanation;
        rawResponse = localResult.rawResponse;
      }

      // Progress: Analysis complete (100%)
      setProgress(100);

      const analysisResult = {
        structuredData: analysisData || {},
        localizedText: explanation || analysisData?.explanation || '',
        originalResponse: rawResponse || '',
        skills_analysis: analysisData?.skills_analysis || {
          technical_skills: analysisData?.skills || ['JavaScript', 'HTML/CSS', 'Python', 'SQL', 'Git & GitHub'],
          soft_skills: analysisData?.soft_skills || ['Problem Solving', 'Team Collaboration']
        }
      };

      setAnalysis(analysisResult);
      onAnalysisComplete?.(analysisResult);

      toast({
        title: t('upload.success'),
        description: t('upload.analysisComplete')
      });

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : t('upload.error'));
      toast({
        title: t('upload.error'),
        description: err instanceof Error ? err.message : t('upload.errorDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [consent, user, language, t, onAnalysisComplete]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
        handleFileUpload(file);
      } else {
        setError(t('upload.invalidFileType'));
      }
    }
  }, [handleFileUpload, t]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="glass-card shadow-xs border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              {t('upload.title', 'Upload Resume for ATS Scan')}
            </CardTitle>
            <span className="text-xs text-slate-500">Max size: 10MB</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Consent Checkbox */}
          <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              className="rounded-md data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label
              htmlFor="consent"
              className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            >
              {t('upload.consentText', 'I consent to my resume being processed by AI for career analysis.')}
            </label>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
              consent
                ? 'border-blue-300 hover:border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 cursor-pointer'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => {
              if (consent && !isUploading) {
                document.getElementById('resume-upload')?.click();
              }
            }}
          >
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${consent ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400' : 'bg-slate-100 text-slate-400'}`}>
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('upload.dragDrop', 'Drag and drop your resume here, or browse')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t('upload.supportedFormats', 'Supported formats: PDF, DOCX, DOC, TXT')}
            </p>

            <div className="flex justify-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">PDF</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">DOCX</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">TXT</span>
            </div>
            
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={!consent}
            />
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('resume-upload')?.click();
              }}
              disabled={!consent || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('upload.processing', 'Analyzing resume...')}
                </>
              ) : (
                t('upload.selectFile', 'Select File from Computer')
              )}
            </Button>
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <div className="flex justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
                <span>{progress < 50 ? 'Reading file content...' : progress < 100 ? 'Running AI ATS Analysis...' : 'Finalizing report...'}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-blue-100 dark:bg-blue-900" />
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 text-xs">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {analysis && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 text-xs py-3">
              <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
              <AlertDescription className="font-medium">
                {t('upload.analysisComplete', 'Resume analysis completed successfully')} — ATS Score: {analysis.structuredData?.atsScore || 'N/A'}%
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};