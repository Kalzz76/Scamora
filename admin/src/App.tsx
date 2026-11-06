import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { AiEngineConfigPage } from './features/ai-engine/AiEngineConfigPage';
import { DemoScenariosPage } from './features/demo-scenarios/DemoScenariosPage';
import { KnowledgeBasePage } from './features/knowledge-base/KnowledgeBasePage';
import { QuizManagerPage } from './features/quiz-manager/QuizManagerPage';
import { ModerationQueuePage } from './features/moderation/ModerationQueuePage';
import { AuditLogsPage } from './features/audit-logs/AuditLogsPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel Uncaught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EEEEEE] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl border border-rose-200 shadow-xl space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-[#1A202C]">Terjadi Kendala Tampilan Admin</h2>
            <p className="text-xs text-[#5E6D7E]">
              {this.state.error?.message || 'Gagal memuat modul admin.'}
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-[#334257] hover:bg-[#476072] text-white text-xs font-semibold rounded-xl"
              >
                Reset Cache &amp; Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex text-[#1A202C] font-sans">
      {/* Mini Sidebar Navigation (Icons with hover tooltips) */}
      <AdminSidebar reportCount={1} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-white">
        {/* Top Header with Brand Name on Left & Account on Right */}
        <AdminHeader />

        <main className="flex-1 overflow-y-auto pb-12 bg-white">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/engine" element={<AiEngineConfigPage />} />
            <Route path="/presets" element={<DemoScenariosPage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/quiz" element={<QuizManagerPage />} />
            <Route path="/moderation" element={<ModerationQueuePage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            {/* Fallback */}
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AdminLayout />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
