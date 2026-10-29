import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StaffRegisterPage } from './pages/StaffRegisterPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { ComplaintManagementPage } from './pages/ComplaintManagementPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagementPage } from './pages/UserManagementPage';
import { CategoryManagementPage } from './pages/CategoryManagementPage';
import { InteractiveMapPage } from './pages/InteractiveMapPage';
import { AnalyticsReportsPage } from './pages/AnalyticsReportsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/staff" element={<StaffRegisterPage />} />
              <Route path="/staff-register" element={<StaffRegisterPage />} />
              <Route path="/map" element={<InteractiveMapPage />} />

              {/* Citizen Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
                    <ReportIssuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-complaints"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
                    <MyComplaintsPage />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated Complaint Details (Citizens, Staff, Admin) */}
              <Route
                path="/complaints/:id"
                element={
                  <ProtectedRoute>
                    <ComplaintDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Authority / Staff Protected Routes */}
              <Route
                path="/authority/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                    <AuthorityDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authority/complaints"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                    <ComplaintManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                    <AnalyticsReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Exclusive Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <CategoryManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated User Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
