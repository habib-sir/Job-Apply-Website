import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { JobsPage } from './pages/public/JobsPage';
import { JobDetailsPage } from './pages/public/JobDetailsPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// User Pages
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { UserCVPage } from './pages/user/UserCVPage';
import { UserApplicationsPage } from './pages/user/UserApplicationsPage';
import { UserNotificationsPage } from './pages/user/UserNotificationsPage';
import { ApplyJobPage } from './pages/user/ApplyJobPage';
import { ApplicationPaymentPage } from './pages/user/ApplicationPaymentPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminJobsListPage } from './pages/admin/AdminJobsListPage';
import { AdminJobFormPage } from './pages/admin/AdminJobFormPage';
import { AdminExamsPage } from './pages/admin/AdminExamsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminPaymentSettingsPage } from './pages/admin/AdminPaymentSettingsPage';
import { AdminExportPage } from './pages/admin/AdminExportPage';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:slug" element={<JobDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Admin Login (Isolated) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected User Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/cv" element={<UserCVPage />} />
                <Route path="/apply/:jobId" element={<ApplyJobPage />} />
                <Route path="/apply/:jobId/payment" element={<ApplicationPaymentPage />} />
                <Route path="/applications/:status" element={<UserApplicationsPage />} />
                <Route path="/notifications" element={<UserNotificationsPage />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="jobs" element={<AdminJobsListPage />} />
                <Route path="jobs/new" element={<AdminJobFormPage />} />
                <Route path="jobs/edit/:id" element={<AdminJobFormPage />} />
                <Route path="exams" element={<AdminExamsPage />} />
                <Route path="applications/:step" element={<AdminApplicationsPage />} />
                <Route path="settings/payment" element={<AdminPaymentSettingsPage />} />
                <Route path="export" element={<AdminExportPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
