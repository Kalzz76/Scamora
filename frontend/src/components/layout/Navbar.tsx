import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Home, 
  Globe, 
  Compass, 
  Gamepad2, 
  GraduationCap, 
  Users, 
  ChevronRight 
} from 'lucide-react';

interface NavbarProps {
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPrivacy }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Track window scroll to create smooth responsive sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  // Desktop navigation links
  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/laporan', label: 'Pemindaian Publik' },
    { path: '/panduan', label: 'Panduan' },
    { path: '/kuis', label: 'Tantangan AI' },
    { path: '/pengetahuan', label: 'Edukasi' },
    { path: '/komunitas', label: 'Komunitas' },
  ];

  // Mobile categorized navigation groups (Konsep 2)
  const menuGroups = [
    {
      title: 'Modul Pemeriksaan',
      items: [
        { path: '/', label: 'Beranda', icon: Home, badge: null },
        { path: '/laporan', label: 'Pemindaian Publik', icon: Globe, badge: 'Live' },
      ],
    },
    {
      title: 'Edukasi & Dukungan',
      items: [
        { path: '/panduan', label: 'Panduan', icon: Compass, badge: null },
        { path: '/kuis', label: 'Tantangan AI', icon: Gamepad2, badge: 'Kuis' },
        { path: '/pengetahuan', label: 'Edukasi', icon: GraduationCap, badge: null },
        { path: '/komunitas', label: 'Komunitas', icon: Users, badge: null },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200' 
          : 'bg-white/85 backdrop-blur-md border-b border-slate-200/70'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`relative flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-16 sm:h-20'}`}>
          
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 z-10 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#1E293B] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all">
              <ShieldCheck className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#0F172A] leading-none">
                Scamora
              </span>
              <span className="text-[10px] text-slate-500 tracking-tight font-medium hidden sm:inline mt-1">
                Protect. Reason. Prevent.
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Bar (Clean & Pure Text, Dead-Center via absolute) */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 text-xs xl:text-sm font-semibold whitespace-nowrap absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-1.5 whitespace-nowrap transition-colors ${
                    active
                      ? 'text-[#0D9488] font-bold'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0D9488] rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Only Mobile Menu Toggle (lg:hidden) */}
          <div className="flex items-center lg:hidden z-10">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              type="button"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-700 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown with Categorized Sections (Konsep 2) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-b border-slate-200/90 bg-white/98 backdrop-blur-xl px-4 sm:px-6 pt-3 pb-5 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4"
          >
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <div className="px-2 mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    {group.title}
                  </span>
                  {groupIdx === 0 && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Online</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    const IconComponent = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                          active
                            ? 'bg-teal-50/90 text-[#0D9488] font-bold border border-teal-200/70 shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={`w-4.5 h-4.5 shrink-0 ${
                              active ? 'text-[#0D9488]' : 'text-slate-400'
                            }`}
                          />
                          <span className="text-sm font-semibold">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span
                              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md leading-none ${
                                active
                                  ? 'bg-[#0D9488] text-white'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              active ? 'text-[#0D9488]' : 'text-slate-300'
                            }`}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom Security Card & Privacy Modal Trigger */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenPrivacy();
                }}
                type="button"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-semibold cursor-pointer transition border border-slate-200/60"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                  <span>Pernyataan Privasi &amp; Zero Retention</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">&rarr;</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
