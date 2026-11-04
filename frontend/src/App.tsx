import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PrivacyModal } from './components/common/PrivacyModal';
import { SimPanel } from './components/common/SimPanel';
import { HomePage } from './features/home/HomePage';
import { UrlCheckerPage } from './features/url-checker/UrlCheckerPage';
import { ChatDetectorPage } from './features/chat-detector/ChatDetectorPage';
import { ReportPage } from './features/risk-report/ReportPage';
import { PanduanPage } from './features/panduan/PanduanPage';
import { QuizPage } from './features/challenge/QuizPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import type { AnalysisResult } from './types/analysis';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

interface AnimatedRoutesProps {
  selectedDemoId: string | null;
  lastResult: AnalysisResult | null;
  handleAnalysisComplete: (result: AnalysisResult) => void;
  handleLoadDemo: (presetId: string) => void;
  onOpenPrivacy: () => void;
}

function AnimatedRoutes({
  selectedDemoId,
  lastResult,
  handleAnalysisComplete,
  handleLoadDemo,
  onOpenPrivacy,
}: AnimatedRoutesProps) {
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
            <Route path="/" element={<HomePage onLoadDemo={handleLoadDemo} />} />
            <Route
              path="/url"
              element={
                <UrlCheckerPage
                  initialPresetId={selectedDemoId}
                  onAnalysisComplete={handleAnalysisComplete}
                  onOpenPrivacy={onOpenPrivacy}
                />
              }
            />
            <Route
              path="/chat"
              element={
                <ChatDetectorPage
                  initialPresetId={selectedDemoId}
                  onAnalysisComplete={handleAnalysisComplete}
                  onOpenPrivacy={onOpenPrivacy}
                />
              }
            />
            <Route path="/laporan" element={<ReportPage result={lastResult} />} />
            <Route path="/panduan" element={<PanduanPage />} />
            <Route path="/kuis" element={<QuizPage />} />
            <Route path="/pengetahuan" element={<KnowledgePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export function App() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setLastResult(result);
  };

  const handleLoadDemo = (presetId: string) => {
    setSelectedDemoId(presetId);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        
        {/* Navigation Bar */}
        <Navbar onOpenPrivacy={() => setPrivacyModalOpen(true)} />

        {/* Dynamic Route Content with Smooth Page Transitions */}
        <main className="flex-1 flex flex-col">
          <AnimatedRoutes
            selectedDemoId={selectedDemoId}
            lastResult={lastResult}
            handleAnalysisComplete={handleAnalysisComplete}
            handleLoadDemo={handleLoadDemo}
            onOpenPrivacy={() => setPrivacyModalOpen(true)}
          />
        </main>

        {/* Universal Footer */}
        <Footer onOpenPrivacy={() => setPrivacyModalOpen(true)} />

        {/* Global Privacy Modal */}
        <PrivacyModal
          isOpen={privacyModalOpen}
          onClose={() => setPrivacyModalOpen(false)}
        />

        {/* Demo Simulation Controller for MIT-Week Jury */}
        <SimPanel />

        {/* High-Craft Stacked Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />

      </div>
    </HashRouter>
  );
}

export default App;
