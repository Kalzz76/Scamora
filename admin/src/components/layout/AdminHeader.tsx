import React, { useState } from 'react';
import {
  ChevronDown,
  LogOut,
  Bell,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';
import { useTheme } from '../../services/themeContext';

export const AdminHeader: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentUser = adminAuth.getUser();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    toast.info('Sesi administrasi berhasil ditutup.');
    setDropdownOpen(false);
    adminAuth.logout();
  };

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 h-[64px] bg-transparent pointer-events-none px-4 sm:px-6 flex items-center justify-between">
      {/* SISI KIRI: PULAU BRANDING KONTEN (DARK GLASS FLOATING ISLAND SESUAI SIDEBAR) */}
      <div className="glass-panel-dark rounded-2xl px-4 py-2 flex items-center gap-3 pointer-events-auto shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-tight text-white">
              Scamora
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#548CA8] text-white font-mono uppercase tracking-wider shadow-xs">
              Admin
            </span>
          </div>
          <p className="text-[10px] text-[#CBDCE5] font-medium leading-none mt-0.5 font-mono">
            Command &amp; Control Center
          </p>
        </div>
      </div>

      {/* SISI TENGAH: KOSONG TOTAL (TRANSPARAN SEPERTI PADA AREA KOSONG SIDEBAR) */}

      {/* SISI KANAN: PULAU AKUN & NOTIFIKASI KONTEN (DARK GLASS FLOATING DOCK) */}
      <div className="glass-panel-dark rounded-2xl p-1.5 flex items-center gap-2 pointer-events-auto shadow-xl">
        {/* Toggle Theme: Light / Dark Mode */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl border border-white/10 hover:border-white/20 bg-white/10 hover:bg-white/20 text-[#EEEEEE] flex items-center justify-center transition relative cursor-pointer"
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
          className="w-8 h-8 rounded-xl border border-white/10 hover:border-white/20 bg-white/10 hover:bg-white/20 text-[#EEEEEE] flex items-center justify-center transition relative cursor-pointer"
          title="Notifikasi Sistem"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#548CA8]" />
        </button>

        {/* User Account Capsule */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-xl border border-white/10 hover:border-[#548CA8] bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            {/* Avatar with Online Pulse */}
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-[#476072] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs border border-white/20">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#334257]"></span>
            </div>

            {/* Name & Role Text */}
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {currentUser?.name || 'Super Administrator'}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[#548CA8] text-white font-bold">
                  Online
                </span>
              </div>
              <span className="text-[10px] text-[#CBDCE5] block leading-tight font-mono">
                {currentUser?.username ? `${currentUser.username}@scamora.id` : 'admin@scamora.id'}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-[#CBDCE5] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-dark shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100 border border-white/15">
              <div className="p-3 border-b border-white/10 space-y-1">
                <div className="text-xs font-bold text-white">Super Administrator</div>
                <div className="text-[11px] text-[#CBDCE5] font-mono">admin@scamora.id</div>
                <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#EEEEEE] bg-[#548CA8]/30 px-2 py-0.5 rounded-md border border-[#548CA8]/50">
                  <CheckCircle2 className="w-3 h-3 text-[#548CA8]" />
                  <span>Akses Penuh (Role: Lead Security Officer)</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <div className="px-3 py-2 text-xs text-[#CBDCE5] flex items-center justify-between">
                  <span>Protokol Keamanan:</span>
                  <span className="font-mono font-bold text-white text-[11px]">MIT-2026</span>
                </div>

                <div className="px-3 py-2 text-xs text-[#CBDCE5] flex items-center justify-between">
                  <span>Sesi Login:</span>
                  <span className="font-mono text-emerald-400 text-[11px] font-bold">Terotentikasi</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Kunci Sesi Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
