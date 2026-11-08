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
  const isHome = location.pathname === '/';
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${isAdmin ? '' : 'bg-[#faf8f5] text-[#14161c]'}`}>
      <ScrollToTop />

      {/* Navigation Bar (Only for public website) */}
      {!isAdmin && <Navbar onOpenPrivacy={() => setPrivacyModalOpen(true)} />}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${isAdmin || isHome ? '' : 'pt-20 lg:pt-24'}`}>
        <Routes>
          {/* Public Routes with Page Transitions */}
          <Route path="/" element={<PublicPageWrapper><HomePage /></PublicPageWrapper>} />
          <Route path="/url" element={<Navigate to="/" replace />} />
          <Route path="/chat" element={<Navigate to="/" replace />} />
          <Route path="/laporan" element={<PublicPageWrapper><ReportPage /></PublicPageWrapper>} />
          <Route path="/direktori" element={<Navigate to="/laporan" replace />} />
          <Route path="/panduan" element={<PublicPageWrapper><PanduanPage /></PublicPageWrapper>} />
          <Route path="/kuis" element={<PublicPageWrapper><QuizPage /></PublicPageWrapper>} />
          <Route path="/pengetahuan" element={<PublicPageWrapper><KnowledgePage /></PublicPageWrapper>} />
          <Route path="/komunitas" element={<PublicPageWrapper><KomunitasPage /></PublicPageWrapper>} />

          {/* Admin Nested Routes: /admin/* handled by AdminApp */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Universal Footer & Privacy Modal (Only for public website) */}
      {!isAdmin && (
        <>
          <Footer onOpenPrivacy={() => setPrivacyModalOpen(true)} />
          <PrivacyModal
            isOpen={privacyModalOpen}
            onClose={() => setPrivacyModalOpen(false)}
          />
        </>
      )}

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
