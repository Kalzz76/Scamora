import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PrivacyModal } from './components/common/PrivacyModal';
import { HomePage } from './features/home/HomePage';
import { ReportPage } from './features/risk-report/ReportPage';
import { PanduanPage } from './features/panduan/PanduanPage';
import { QuizPage } from './features/challenge/QuizPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import { KomunitasPage } from './features/community/KomunitasPage';
import { UserDashboardPage } from './features/dashboard/UserDashboardPage';
import { UserProfilePage } from './features/profile/UserProfilePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './admin/features/auth/LoginPage';
import { AdminApp } from './admin/AdminApp';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

function PublicPageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function MainApp() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/masuk' || location.pathname === '/daftar';
  const isKomunitas = location.pathname === '/komunitas';
  const isHome = location.pathname === '/';
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${isAdmin ? '' : isKomunitas ? 'bg-[#faf8f5] text-[#14161c] h-screen overflow-hidden' : 'bg-[#faf8f5] text-[#14161c] pb-16 lg:pb-0'}`}>
      <ScrollToTop />

      {/* Navigation Bar (Only for public website, excluded on /admin and auth pages) */}
      {!isAdmin && !isAuthRoute && <Navbar onOpenPrivacy={() => setPrivacyModalOpen(true)} />}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${isAdmin || isHome || isAuthRoute ? '' : isKomunitas ? 'pt-16 sm:pt-20 h-[calc(100vh-64px)] overflow-hidden' : 'pt-16 sm:pt-20 lg:pt-24'}`}>
        <Routes>
          {/* Public Routes with Page Transitions */}
          <Route path="/" element={<PublicPageWrapper><HomePage /></PublicPageWrapper>} />
          <Route path="/url" element={<Navigate to="/" replace />} />
          <Route path="/chat" element={<Navigate to="/" replace />} />
          <Route path="/laporan" element={<PublicPageWrapper><ReportPage /></PublicPageWrapper>} />
          <Route path="/direktori" element={<Navigate to="/laporan" replace />} />
          <Route path="/panduan" element={<PublicPageWrapper><PanduanPage /></PublicPageWrapper>} />

          {/* Protected Routes for Authenticated Users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute featureName="Dashboard Pengguna">
                <PublicPageWrapper><UserDashboardPage /></PublicPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute featureName="Profil Pengguna">
                <PublicPageWrapper><UserProfilePage /></PublicPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kuis"
            element={
              <ProtectedRoute featureName="Tantangan AI">
                <PublicPageWrapper><QuizPage /></PublicPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengetahuan"
            element={
              <ProtectedRoute featureName="Pusat Edukasi">
                <PublicPageWrapper><KnowledgePage /></PublicPageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/komunitas"
            element={
              <ProtectedRoute featureName="Komunitas Warga">
                <PublicPageWrapper><KomunitasPage /></PublicPageWrapper>
              </ProtectedRoute>
            }
          />

          {/* Unified Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/masuk" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/daftar" element={<Navigate to="/register" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* Admin Nested Routes: /admin/* handled by AdminApp */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Universal Footer & Privacy Modal (Footer excluded on /admin, auth pages, and full-screen /komunitas) */}
      {!isAdmin && !isAuthRoute && !isKomunitas && (
        <Footer onOpenPrivacy={() => setPrivacyModalOpen(true)} />
      )}
      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      {/* High-Craft Stacked Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
}

export default App;
