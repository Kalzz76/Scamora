import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { AdminBottomNav } from './components/layout/AdminBottomNav';
import { LoginPage } from './features/auth/LoginPage';
import { adminAuth } from './services/adminAuth';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { AiEngineConfigPage } from './features/ai-engine/AiEngineConfigPage';
import { KnowledgeBasePage } from './features/knowledge-base/KnowledgeBasePage';
import { QuizManagerPage } from './features/quiz-manager/QuizManagerPage';
import { ModerationQueuePage } from './features/moderation/ModerationQueuePage';
import { AuditLogsPage } from './features/audit-logs/AuditLogsPage';
import { UserManagementPage } from './features/user-management/UserManagementPage';
import adminBgLight from './assets/admin-bg.jpg';
import adminBgDark from './assets/admin-bg-dark.jpg';
import { ThemeProvider, useTheme } from './services/themeContext';

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
                className="px-4 py-2 bg-[#334257] hover:bg-[#476072] text-white text-xs font-semibold rounded-xl cursor-pointer"
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

const ProtectedRoute: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const isAuth = adminAuth.isAuthenticated();
  const user = adminAuth.getUser();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

const AdminLayout: React.FC = () => {
  const { isDark } = useTheme();
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-x-hidden text-[#1A202C] dark:text-[#F8FAFC]">
      {/* Blurred City Landscape Ambient Background (Day / Night depending on theme) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src={isDark ? adminBgDark : adminBgLight}
          alt="Admin Ambient Background"
          className={`w-full h-full object-cover filter blur-[8px] scale-105 transition-all duration-700 ${
            isDark ? 'opacity-90 brightness-95' : 'opacity-85 brightness-100'
          }`}
        />
        {/* Soft Translucent Frosted Glass Wash */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            isDark
              ? 'bg-[#0B0F17]/50 backdrop-blur-[2px]'
              : 'bg-white/45 backdrop-blur-[2px]'
          }`}
        />
      </div>

      {/* Top Header - Spans 100% Full Screen Width */}
      <AdminHeader
        reportCount={1}
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />

      {/* Workspace Body: Fixed Sidebar (Left on desktop, hidden on mobile) + Content (Right) */}
      <div className="flex-1 flex min-w-0 pt-[64px] relative z-10 bg-transparent">
        {/* Fixed Mini Sidebar (74px spacer only on md+ screens) */}
        <div className="hidden md:block w-[74px] shrink-0 relative z-40">
          <AdminSidebar reportCount={1} />
        </div>

        {/* Main Content Area: pb-24 on mobile to prevent overlap with bottom dock */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-12 bg-transparent">
          <Outlet />
        </main>
      </div>

      {/* Floating Bottom Navigation Bar (Mobile only) */}
      <AdminBottomNav
        reportCount={1}
        onOpenMenu={() => setMobileDrawerOpen(true)}
      />

      <Toaster position="top-right" richColors />
    </div>
  );
};

export const AdminApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Routes>
          <Route path="login" element={<Navigate to="/login" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="engine" element={<AiEngineConfigPage />} />
              <Route path="knowledge" element={<KnowledgeBasePage />} />
              <Route path="quiz" element={<QuizManagerPage />} />
              <Route path="moderation" element={<ModerationQueuePage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AdminApp;
