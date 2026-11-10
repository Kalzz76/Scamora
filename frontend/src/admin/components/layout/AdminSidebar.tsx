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
  Users,
} from 'lucide-react';

interface AdminSidebarProps {
  reportCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ reportCount = 1 }) => {
  const [accountOpen, setAccountOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard Utama', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manajemen Pengguna', icon: Users, badge: '2 Tingkat' },
    { to: '/admin/engine', label: 'AI Engine & Crawler', icon: Cpu, badge: 'Active' },
    { to: '/admin/knowledge', label: 'Pusat Pengetahuan', icon: BookOpen },
    { to: '/admin/quiz', label: 'Guardian Challenge', icon: HelpCircle },
    { to: '/admin/moderation', label: 'Moderasi Komunitas', icon: ShieldCheck, badgeCount: reportCount },
    { to: '/admin/audit-logs', label: 'Log Audit & Telemetri', icon: ClipboardList },
  ];

  return (
    <aside className="w-[54px] fixed top-[50px] left-0 h-[calc(100vh-50px)] z-40 hidden md:flex flex-col justify-between items-center py-3 pl-2 select-none pointer-events-auto bg-transparent">
      {/* 1. DOCK MENU AKSES KONTEN: Diketengahkan secara vertikal (my-auto) */}
      <div className="w-[42px] glass-panel-dark rounded-2xl py-2 px-1 flex flex-col items-center my-auto shadow-lg">
        <nav className="flex flex-col items-center gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `w-8 h-8 rounded-xl flex items-center justify-center relative group transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#476072] text-white shadow-xs border border-white/20'
                      : 'text-[#EEEEEE]/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {/* Active Indicator Bar on Left */}
                <span className="absolute left-0 w-0.5 h-4 bg-[#548CA8] rounded-r-full opacity-0 group-[.active]:opacity-100 transition-opacity" />

                {/* Icon */}
                <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />

                {/* Badge Dot / Notification Count */}
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#548CA8] text-white font-mono text-[8px] font-black flex items-center justify-center ring-1 ring-[#334257]">
                    {item.badgeCount}
                  </span>
                ) : item.badge ? (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-[#334257]" />
                ) : null}

                {/* Hover Flyout Tooltip with Menu Text */}
                <div className="absolute left-full ml-2.5 px-3 py-1.5 rounded-lg bg-[#242F3E] text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0 transition-all duration-150 pointer-events-none z-50 flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#548CA8]/30 text-[#EEEEEE] font-mono text-[8px] font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeCount && item.badgeCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#548CA8] text-white font-mono text-[8px]">
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
      <div className="w-[42px] glass-panel-dark rounded-2xl py-2 px-1 flex flex-col items-center gap-1.5 shadow-lg">
        {/* Tombol Kembali ke Web Publik */}
        <Link
          to="/"
          className="w-8 h-8 rounded-xl text-[#EEEEEE]/70 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all duration-200 relative group cursor-pointer"
          title="Kembali ke Web Publik Scamora"
        >
          <ExternalLink className="w-4 h-4 text-[#548CA8]" />
          <div className="absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#242F3E] text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0 transition-all duration-150 pointer-events-none z-50 flex items-center gap-1.5">
            <span>Kembali ke Web Publik Scamora</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </div>
        </Link>

        {/* Divider pemisah */}
        <div className="w-5 h-px bg-white/20 my-0.5" />

        {/* Avatar Akun Pengguna */}
        <div className="relative group cursor-pointer">
          <button
            type="button"
            onClick={() => setAccountOpen(!accountOpen)}
            className="w-8 h-8 rounded-xl bg-[#476072] hover:bg-[#548CA8] border border-white/20 flex items-center justify-center font-bold text-[10px] text-white shadow-xs transition-transform duration-200 group-hover:scale-105 cursor-pointer relative"
            title="Akun Administrator"
          >
            SA
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#334257]" />
          </button>

          {/* Hover Flyout for Account Info */}
          <div className="absolute left-full ml-2.5 bottom-0 px-3 py-2 rounded-xl bg-[#242F3E] text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 pointer-events-none">
            <div className="flex items-center gap-2 pb-1 border-b border-white/10">
              <User className="w-3 h-3 text-[#548CA8]" />
              <span>Super Administrator</span>
              <span className="text-[8px] font-mono bg-[#548CA8] px-1 py-0.2 rounded-full text-white">Root</span>
            </div>
            <div className="text-[10px] text-[#CBDCE5] font-mono pt-1">admin@scamora.id</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
