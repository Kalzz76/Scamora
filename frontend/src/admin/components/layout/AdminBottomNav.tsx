import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Menu,
} from 'lucide-react';

interface AdminBottomNavProps {
  reportCount?: number;
  onOpenMenu: () => void;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  reportCount = 1,
  onOpenMenu,
}) => {
  const navTabs = [
    { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, end: true },
    { to: '/admin/engine', label: 'Engine', icon: Cpu, end: false },
    { to: '/admin/knowledge', label: 'Materi', icon: BookOpen, end: false },
    { to: '/admin/quiz', label: 'Tantangan', icon: HelpCircle, end: false },
    {
      to: '/admin/moderation',
      label: 'Moderasi',
      icon: ShieldCheck,
      end: false,
      badgeCount: reportCount,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Admin Mobile"
      className="md:hidden fixed bottom-2.5 inset-x-2.5 z-40 pointer-events-auto select-none"
    >
      <div className="glass-panel-dark rounded-2xl py-1.5 px-2 shadow-2xl flex items-center justify-around border border-white/20 backdrop-blur-xl">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-white font-bold bg-[#548CA8]/35 border border-[#548CA8]/50'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300 scale-110' : ''}`} />
                    {tab.badgeCount && tab.badgeCount > 0 ? (
                      <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#548CA8] text-white text-[8px] font-mono font-bold flex items-center justify-center ring-1 ring-[#334257]">
                        {tab.badgeCount}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[9px] font-mono tracking-tight mt-0.5 leading-none">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Menu / More Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Buka Menu Lengkap"
        >
          <Menu className="w-4 h-4 text-slate-300" />
          <span className="text-[9px] font-mono tracking-tight mt-0.5 leading-none">
            Lainnya
          </span>
        </button>
      </div>
    </nav>
  );
};
