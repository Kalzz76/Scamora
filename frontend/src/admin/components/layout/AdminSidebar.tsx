import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  ClipboardList,
  ExternalLink,
  User,
} from 'lucide-react';

interface AdminSidebarProps {
  reportCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ reportCount = 1 }) => {
  const [accountOpen, setAccountOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard Utama', icon: LayoutDashboard },
    { to: '/admin/engine', label: 'AI Engine & Crawler', icon: Cpu, badge: 'Active' },
    { to: '/admin/knowledge', label: 'Pusat Pengetahuan', icon: BookOpen },
    { to: '/admin/quiz', label: 'Guardian Challenge', icon: HelpCircle },
    { to: '/admin/moderation', label: 'Moderasi Komunitas', icon: ShieldCheck, badgeCount: reportCount },
    { to: '/admin/audit-logs', label: 'Log Audit & Telemetri', icon: ClipboardList },
  ];

  return (
    <aside className="w-[74px] fixed top-[64px] left-0 h-[calc(100vh-64px)] z-40 flex flex-col justify-between items-center py-6 pl-3 select-none pointer-events-auto bg-transparent">
      {/* 1. DOCK MENU AKSES KONTEN: Diketengahkan secara vertikal (my-auto) */}
      <div className="w-[56px] glass-panel-dark rounded-3xl py-3 px-1.5 flex flex-col items-center my-auto shadow-xl">
        <nav className="flex flex-col items-center gap-3 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `w-11 h-11 rounded-2xl flex items-center justify-center relative group transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#476072] text-white shadow-xs border border-white/20'
                      : 'text-[#EEEEEE]/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {/* Active Indicator Bar on Left */}
                <span className="absolute left-0 w-1 h-5 bg-[#548CA8] rounded-r-full opacity-0 group-[.active]:opacity-100 transition-opacity" />

                {/* Icon */}
                <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />

                {/* Badge Dot / Notification Count */}
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#548CA8] text-white font-mono text-[9px] font-black flex items-center justify-center ring-2 ring-[#334257]">
                    {item.badgeCount}
                  </span>
                ) : item.badge ? (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#334257]" />
                ) : null}

                {/* Hover Flyout Tooltip with Menu Text */}
                <div className="absolute left-full ml-3 px-3.5 py-2 rounded-xl bg-[#242F3E] text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0 transition-all duration-150 pointer-events-none z-50 flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#548CA8]/30 text-[#EEEEEE] font-mono text-[9px] font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeCount && item.badgeCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#548CA8] text-white font-mono text-[9px]">
                      {item.badgeCount} baru
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 2. DOCK BAWAH TERPISAH: Buka Web Publik & Akun (dengan gap) */}
      <div className="w-[56px] glass-panel-dark rounded-3xl py-3 px-1.5 flex flex-col items-center gap-2.5 shadow-xl">
        {/* Tombol Kembali ke Web Publik */}
        <Link
          to="/"
          className="w-11 h-11 rounded-2xl text-[#EEEEEE]/70 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all duration-200 relative group cursor-pointer"
          title="Kembali ke Web Publik Scamora"
        >
          <ExternalLink className="w-5 h-5 text-[#548CA8]" />
          <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#242F3E] text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0 transition-all duration-150 pointer-events-none z-50 flex items-center gap-1.5">
            <span>Kembali ke Web Publik Scamora</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </Link>

        {/* Divider pemisah */}
        <div className="w-6 h-px bg-white/20 my-0.5" />

        {/* Avatar Akun Pengguna */}
        <div className="relative group cursor-pointer">
          <button
            type="button"
            onClick={() => setAccountOpen(!accountOpen)}
            className="w-10 h-10 rounded-2xl bg-[#476072] hover:bg-[#548CA8] border border-white/20 flex items-center justify-center font-bold text-xs text-white shadow-xs transition-transform duration-200 group-hover:scale-105 cursor-pointer relative"
            title="Akun Administrator"
          >
            SA
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#334257]" />
          </button>

          {/* Hover Flyout for Account Info */}
          <div className="absolute left-full ml-3 bottom-0 px-3.5 py-2.5 rounded-2xl bg-[#242F3E] text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 pointer-events-none">
            <div className="flex items-center gap-2 pb-1 border-b border-white/10">
              <User className="w-3.5 h-3.5 text-[#548CA8]" />
              <span>Super Administrator</span>
              <span className="text-[9px] font-mono bg-[#548CA8] px-1.5 py-0.2 rounded-full text-white">Root</span>
            </div>
            <div className="text-[11px] text-[#CBDCE5] font-mono pt-1">admin@scamora.id</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
