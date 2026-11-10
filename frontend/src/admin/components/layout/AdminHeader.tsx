import React, { useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  Bell,
  CheckCircle2,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  Cpu,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  ClipboardList,
  ExternalLink,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';
import { useTheme } from '../../services/themeContext';

interface AdminHeaderProps {
  reportCount?: number;
  mobileDrawerOpen?: boolean;
  setMobileDrawerOpen?: (open: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  reportCount = 1,
  mobileDrawerOpen,
  setMobileDrawerOpen,
}) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localDrawerOpen, setLocalDrawerOpen] = useState(false);
  const currentUser = adminAuth.getUser();
  const { isDark, toggleTheme } = useTheme();

  const isDrawerOpen = mobileDrawerOpen !== undefined ? mobileDrawerOpen : localDrawerOpen;
  const setIsDrawerOpen = setMobileDrawerOpen || setLocalDrawerOpen;

  const handleLogout = () => {
    toast.info('Sesi administrasi berhasil ditutup.');
    setDropdownOpen(false);
    setIsDrawerOpen(false);
    adminAuth.logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard Utama', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Manajemen Pengguna', icon: Users, badge: '2 Tingkat' },
    { to: '/admin/engine', label: 'AI Engine & Crawler', icon: Cpu, badge: 'Active' },
    { to: '/admin/knowledge', label: 'Pusat Pengetahuan', icon: BookOpen },
    { to: '/admin/quiz', label: 'Guardian Challenge', icon: HelpCircle },
    { to: '/admin/moderation', label: 'Moderasi Komunitas', icon: ShieldCheck, badgeCount: reportCount },
    { to: '/admin/audit-logs', label: 'Log Audit & Telemetri', icon: ClipboardList },
  ];

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-50 h-[50px] bg-transparent pointer-events-none px-2 sm:px-4 flex items-center justify-between">
        {/* SISI KIRI: PULAU BRANDING KONTEN & MOBILE DRAWER TRIGGER */}
        <div className="glass-panel-dark rounded-xl px-2 sm:px-3 py-1 flex items-center gap-1.5 sm:gap-2 pointer-events-auto shadow-lg group border border-white/20">
          {/* Hamburger Menu on Mobile */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Buka Navigasi Admin"
            aria-label="Buka Navigasi Admin"
          >
            <Menu className="w-3.5 h-3.5 text-cyan-300" />
          </button>

          <Link to="/admin" className="flex items-center gap-1.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Scamora
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#548CA8] text-white font-mono uppercase tracking-wider shadow-xs">
                  Admin
                </span>
              </div>
              <p className="text-[8px] text-slate-200 font-medium leading-none mt-0.5 font-mono hidden xs:block">
                Command &amp; Control Center
              </p>
            </div>
          </Link>
        </div>

        {/* SISI KANAN: PULAU AKUN & NOTIFIKASI KONTEN */}
        <div className="glass-panel-dark rounded-xl p-1 flex items-center gap-1 sm:gap-1.5 pointer-events-auto shadow-lg border border-white/20">
          {/* Toggle Theme: Light / Dark Mode */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-7 h-7 rounded-lg border border-white/10 hover:border-white/20 bg-white/10 hover:bg-white/20 text-[#EEEEEE] flex items-center justify-center transition relative cursor-pointer"
            title={isDark ? 'Beralih ke Mode Terang (Siang)' : 'Beralih ke Mode Gelap (Malam)'}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-200" />
            )}
          </button>

          {/* Quick notification bell */}
          <button
            type="button"
            onClick={() => toast.info('Tidak ada peringatan keamanan kritis baru.')}
            className="w-7 h-7 rounded-lg border border-white/10 hover:border-white/20 bg-white/10 hover:bg-white/20 text-[#EEEEEE] flex items-center justify-center transition relative cursor-pointer"
            title="Notifikasi Sistem"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#548CA8]" />
          </button>

          {/* User Account Capsule */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 p-0.5 sm:pr-2 rounded-lg border border-white/10 hover:border-[#548CA8] bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              {/* Avatar with Online Pulse */}
              <div className="relative">
                <div className="w-6 h-6 rounded-md bg-[#476072] text-white flex items-center justify-center font-bold text-[10px] font-mono shadow-xs border border-white/20">
                  SA
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-[#334257]" />
              </div>

              {/* Name & Role Text (hidden on small screens) */}
              <div className="text-left hidden md:block">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-white leading-tight">
                    {currentUser?.name || 'Super Administrator'}
                  </span>
                  <span className="text-[8px] font-mono px-1 py-0 rounded-xs bg-[#548CA8] text-white font-bold">
                    Online
                  </span>
                </div>
                <span className="text-[9px] text-slate-200 block leading-none font-mono">
                  {currentUser?.username ? `${currentUser.username}@scamora.id` : 'admin@scamora.id'}
                </span>
              </div>

              <ChevronDown className={`w-3 h-3 text-slate-200 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-dark shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100 border border-white/20">
                <div className="p-3 border-b border-white/10 space-y-1">
                  <div className="text-xs font-bold text-white">Super Administrator</div>
                  <div className="text-[11px] text-slate-200 font-mono">admin@scamora.id</div>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-white bg-[#548CA8]/35 px-2.5 py-1 rounded-lg border border-[#548CA8]/60 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span>Akses Penuh (Role: Lead Security Officer)</span>
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <div className="px-3 py-2 text-xs text-slate-200 flex items-center justify-between">
                    <span>Protokol Keamanan:</span>
                    <span className="font-mono font-bold text-white text-[11px]">MIT-2026</span>
                  </div>

                  <div className="px-3 py-2 text-xs text-slate-200 flex items-center justify-between">
                    <span>Sesi Login:</span>
                    <span className="font-mono text-emerald-400 text-[11px] font-bold">Terotentikasi</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-500/25 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Kunci Sesi Admin</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER MENU (RESPONSIVE FULL-FEATURED DRAWER)           */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Wash */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Slide-over Content Drawer */}
          <div className="relative w-[82vw] max-w-sm glass-panel-dark h-full p-5 flex flex-col justify-between overflow-y-auto z-10 border-r border-white/20 shadow-2xl animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#334257] text-white flex items-center justify-center font-black text-sm border border-white/20">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white text-base tracking-tight">Scamora</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#548CA8] text-white font-mono uppercase">
                        Admin
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-mono">Panel Manajemen Keamanan</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-200" />
                </button>
              </div>

              {/* Admin Profile Badge */}
              <div className="p-3 my-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Super Administrator</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono">admin@scamora.id</p>
                <div className="text-[10px] text-cyan-300 flex items-center gap-1 pt-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Level 1 Security Clearance
                </div>
              </div>

              {/* Navigation Menu List */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                  Menu Utama
                </span>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setIsDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-[#548CA8] text-white shadow-md'
                              : 'text-slate-200 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0 text-cyan-300" />
                          <span>{item.label}</span>
                        </div>
                        {item.badgeCount && item.badgeCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                            {item.badgeCount} baru
                          </span>
                        ) : item.badge ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono">
                            {item.badge}
                          </span>
                        ) : null}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                to="/"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#548CA8]" />
                  <span>Kembali ke Web Publik</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">scamora.id</span>
              </Link>

              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-medium transition border border-white/10 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
                  <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{isDark ? 'Dark' : 'Light'}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Kunci Sesi Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
