import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Award, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate } from '@/types/capacityConnect';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates] = useState<Certificate[]>(() => 
    capacityStore.getCertificates(user?.id || 'guest')
  );
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // If no certificate yet, provide a sample certified credential demonstration
  const displayCerts: Certificate[] = certificates.length > 0 ? certificates : [
    {
      id: 'demo-cert-1',
      certificateCode: 'CC-JV9482-2026',
      traineeId: user?.id || 'guest',
      traineeName: user?.name || 'Pavan Kumar',
      courseId: 'course-1',
      courseTitle: 'Enterprise Java & Data Structures Architecture',
      trainerName: 'Priya Narayanan',
      issuedDate: 'September 12, 2026',
      scorePercent: 96,
      competenciesAchieved: ['Enterprise Java', 'Data Structures', 'OOP Architecture', 'Algorithm Optimization'],
      verificationUrl: 'https://capacityconnect.edu/verify/CC-JV9482-2026'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Certificates & Credentials' }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Verified Capacity Credentials
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Certificates & Achievements
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Cryptographically verifiable certificates issued upon satisfying course requirements and passing diagnostic assessments.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900">
              <ShieldCheck className="w-4 h-4" />
              <span>Tamper-Proof Verification</span>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayCerts.map((cert) => (
            <Card 
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className="glass-card p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between shadow-2xs group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 border-slate-200">
                    {cert.certificateCode}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {cert.courseTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Certified Instructor: <strong>{cert.trainerName}</strong></p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Issued: {cert.issuedDate}</span>
                  <span className="font-bold text-emerald-600">Final Score: {cert.scorePercent}%</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Competencies Achieved:</span>
                  <div className="flex flex-wrap gap-1">
                    {cert.competenciesAchieved.map((comp, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
                        ✓ {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <span className="text-xs text-blue-600 font-semibold group-hover:underline">
                  View Full Certificate
                </span>
                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </main>

      {/* Certificate Viewer Modal */}
      <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {selectedCert && (
            <div className="space-y-6 text-center border-4 border-double border-slate-200 dark:border-slate-800 p-8 rounded-xl bg-slate-50/50 dark:bg-slate-950/50">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md">
                <Award className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Certificate of Competency Achievement
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  PathFinders — PS 26075
                </h2>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">This certifies that</p>
                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {selectedCert.traineeName}
                </h3>
                <p className="text-xs text-slate-500">
                  has demonstrated verified proficiency and completed all practical modules in
                </p>
                <h4 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                  {selectedCert.courseTitle}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 max-w-sm mx-auto pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="block text-slate-400">Instructor</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedCert.trainerName}</strong>
                </div>
                <div>
                  <span className="block text-slate-400">Issue Date</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedCert.issuedDate}</strong>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-mono">
                Verification ID: {selectedCert.certificateCode} • Authenticated via PathFinders Engine
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
