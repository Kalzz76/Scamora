import { useState, useEffect } from 'react';
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
import { AdminLoginPage } from './features/admin-auth/AdminLoginPage';

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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col w-full"
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/url" element={<Navigate to="/" replace />} />
            <Route path="/chat" element={<Navigate to="/" replace />} />
            <Route path="/laporan" element={<ReportPage />} />
            <Route path="/direktori" element={<Navigate to="/laporan" replace />} />
            <Route path="/panduan" element={<PanduanPage />} />
            <Route path="/kuis" element={<QuizPage />} />
            <Route path="/pengetahuan" element={<KnowledgePage />} />
            <Route path="/komunitas" element={<KomunitasPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function MainContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <main className={`flex-1 flex flex-col ${isHome ? '' : 'pt-20 lg:pt-24'}`}>
      <AnimatedRoutes />
    </main>
  );
}

export function App() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#14161c]">
        
        {/* Navigation Bar */}
        <Navbar onOpenPrivacy={() => setPrivacyModalOpen(true)} />

        {/* Dynamic Route Content with Smooth Page Transitions */}
        <MainContent />

        {/* Universal Footer */}
        <Footer onOpenPrivacy={() => setPrivacyModalOpen(true)} />

        {/* Global Privacy Modal */}
        <PrivacyModal
          isOpen={privacyModalOpen}
          onClose={() => setPrivacyModalOpen(false)}
        />

        {/* High-Craft Stacked Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />

      </div>
    </HashRouter>
  );
}

export default App;
