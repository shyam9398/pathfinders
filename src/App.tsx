// PathFinder App - Main entry point with authentication and language support
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppWrapper from "./components/AppWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CareerGuide from "./pages/CareerGuide";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import MainDashboard from "./pages/MainDashboard";
import { RoadmapPage } from "./pages/RoadmapPage";
import { CareerGrowthPath } from "./pages/CareerGrowthPath";
import NotFound from "./pages/NotFound";
import CareerHealthScore from "./components/CareerHealthScore";

// Capacity Connect Extensions
import CoursesCatalog from "./pages/CoursesCatalog";
import CourseLearningView from "./pages/CourseLearningView";
import SkillGapAnalysisPage from "./pages/SkillGapAnalysisPage";
import CertificatesPage from "./pages/CertificatesPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CareerUpdatesPage from "./pages/CareerUpdatesPage";
import TrainersDirectoryPage from "./pages/TrainersDirectoryPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

import { GlobalDOMTranslator } from "./components/GlobalDOMTranslator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <GlobalDOMTranslator />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppWrapper>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<Index />} />
                <Route path="/career-guide" element={
                  <ProtectedRoute>
                    <CareerGuide />
                  </ProtectedRoute>
                } />
                <Route path="/resume-analyzer" element={
                  <ProtectedRoute>
                    <ResumeAnalyzer />
                  </ProtectedRoute>
                } />
                <Route path="/main" element={
                  <ProtectedRoute>
                    <MainDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/courses" element={
                  <ProtectedRoute>
                    <CoursesCatalog />
                  </ProtectedRoute>
                } />
                <Route path="/courses/:id/learn" element={
                  <ProtectedRoute>
                    <CourseLearningView />
                  </ProtectedRoute>
                } />
                <Route path="/skill-gaps" element={
                  <ProtectedRoute>
                    <SkillGapAnalysisPage />
                  </ProtectedRoute>
                } />
                <Route path="/assessments" element={
                  <ProtectedRoute>
                    <AssessmentsPage />
                  </ProtectedRoute>
                } />
                <Route path="/certificates" element={
                  <ProtectedRoute>
                    <CertificatesPage />
                  </ProtectedRoute>
                } />
                <Route path="/trainer" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/radar" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/sessions" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/trainees" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/courses" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/library" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/resources" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/doubts" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/clinic" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/reviews" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/capstones" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/analytics" element={
                  <ProtectedRoute>
                    <TrainerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/students" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/trainers" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/jobs" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/internships" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/courses" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/announcements" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/security" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/career-growth" element={
                  <ProtectedRoute>
                    <CareerGrowthPath />
                  </ProtectedRoute>
                } />
                <Route path="/career-growth-path" element={
                  <ProtectedRoute>
                    <CareerGrowthPath />
                  </ProtectedRoute>
                } />
                <Route path="/career-health" element={
                  <ProtectedRoute>
                    <CareerHealthScore />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/career-updates" element={
                  <ProtectedRoute>
                    <CareerUpdatesPage />
                  </ProtectedRoute>
                } />
                <Route path="/trainers" element={
                  <ProtectedRoute>
                    <TrainersDirectoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/achievements" element={
                  <ProtectedRoute>
                    <AchievementsPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/roadmap" element={
                  <ProtectedRoute>
                    <RoadmapPage />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
