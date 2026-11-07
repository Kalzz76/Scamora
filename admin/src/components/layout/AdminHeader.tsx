import React, { useState } from 'react';
import {
  ChevronDown,
  LogOut,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';

export const AdminHeader: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentUser = adminAuth.getUser();

  const handleLogout = () => {
    toast.info('Sesi administrasi berhasil ditutup.');
    setDropdownOpen(false);
    adminAuth.logout();
  };

  return (
    <header className="bg-white border-b border-[#D8E0E7] sticky top-0 z-30 px-6 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* SISI KIRI: NAMA WEBSITE & BRANDING (TANPA LOGO ICON KIRI ATAS) */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-[#334257]">
              Scamora
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#548CA8] text-white font-mono uppercase tracking-wider">
              Admin
            </span>
          </div>
          <p className="text-[11px] text-[#476072] font-medium leading-none mt-0.5">
            Command &amp; Control Center
          </p>
        </div>
      </div>

      {/* SISI KANAN: TEMPAT AKUN DAN NAMA AKUN YANG LOGIN BERADA */}
      <div className="flex items-center gap-3">
        {/* Quick notification bell */}
        <button
          type="button"
          onClick={() => toast.info('Tidak ada peringatan keamanan kritis baru.')}
          className="w-9 h-9 rounded-xl border border-[#D8E0E7] hover:bg-[#EEEEEE] text-[#476072] hover:text-[#334257] flex items-center justify-center transition relative cursor-pointer"
          title="Notifikasi Sistem"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#548CA8]" />
        </button>

        {/* User Account Capsule */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl border border-[#D8E0E7] hover:border-[#548CA8] bg-[#EEEEEE] hover:bg-white transition cursor-pointer"
          >
            {/* Avatar with Online Pulse */}
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-[#334257] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>

            {/* Name & Role Text */}
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#334257]">
                  {currentUser?.name || 'Super Administrator'}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[#548CA8]/15 text-[#334257] font-bold border border-[#548CA8]/30">
                  Online
                </span>
              </div>
              <span className="text-[10px] text-[#476072] block leading-tight font-mono">
                {currentUser?.username ? `${currentUser.username}@scamora.id` : 'admin@scamora.id'}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-[#476072] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#D8E0E7] shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-[#D8E0E7] space-y-1">
                <div className="text-xs font-bold text-[#334257]">Super Administrator</div>
                <div className="text-[11px] text-[#476072] font-mono">admin@scamora.id</div>
                <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#334257] bg-[#548CA8]/15 px-2 py-0.5 rounded-md border border-[#548CA8]/30">
                  <CheckCircle2 className="w-3 h-3 text-[#548CA8]" />
                  <span>Akses Penuh (Role: Lead Security Officer)</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <div className="px-3 py-2 text-xs text-[#476072] flex items-center justify-between">
                  <span>Protokol Keamanan:</span>
                  <span className="font-mono font-bold text-[#334257] text-[11px]">MIT-2026</span>
                </div>

                <div className="px-3 py-2 text-xs text-[#476072] flex items-center justify-between">
                  <span>Sesi Login:</span>
                  <span className="font-mono text-emerald-600 text-[11px] font-bold">Terotentikasi</span>
                </div>
              </div>

              <div className="border-t border-[#D8E0E7] pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
