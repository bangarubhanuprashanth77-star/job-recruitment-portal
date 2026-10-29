import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import CompaniesList from './pages/CompaniesList';
import CompanyDetail from './pages/CompanyDetail';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import NotFound from './pages/NotFound';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import CandidateResumes from './pages/candidate/CandidateResumes';
import CandidateApplications from './pages/candidate/CandidateApplications';
import SavedJobs from './pages/candidate/SavedJobs';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import JobForm from './pages/recruiter/JobForm';
import JobApplicants from './pages/recruiter/JobApplicants';
import CompanyProfile from './pages/recruiter/CompanyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/companies" element={<CompaniesList />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />

              {/* Job Seeker Protected Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker']}>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resumes"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker']}>
                    <CandidateResumes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker']}>
                    <CandidateApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker']}>
                    <SavedJobs />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <ManageJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <JobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <JobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/applicants"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <JobApplicants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/company"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCompanies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
