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
  ChevronRight,
  User,
  LogIn
} from 'lucide-react';
import { adminAuth } from '../../admin/services/adminAuth';

interface NavbarProps {
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPrivacy }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

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

  // Mobile Bottom Navigation Links (thumb-friendly access everywhere)
  const bottomNavLinks = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/laporan', label: 'Publik', icon: Globe },
    { path: '/panduan', label: 'Panduan', icon: Compass },
    { path: '/kuis', label: 'Tantangan', icon: Gamepad2 },
    { path: '/pengetahuan', label: 'Edukasi', icon: GraduationCap },
    { path: '/komunitas', label: 'Komunitas', icon: Users },
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

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent 
            ? 'bg-transparent border-transparent' 
            : 'bg-[#faf8f5]/95 backdrop-blur-md shadow-xs border-b border-[#d9d6d0]'
        }`}
      >
      <div className={`w-full mx-auto transition-all duration-300 ${
        isTransparent 
          ? 'px-6 sm:px-10 lg:px-[calc(var(--u16)*6.5)]' 
          : 'max-w-[1440px] px-6 sm:px-10 lg:px-16'
      }`}>
        <div 
          style={{ height: isTransparent ? 'calc(var(--u16) * 6)' : undefined }}
          className={`relative flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-16 sm:h-20 lg:h-24'
          }`}
        >
          
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-[calc(var(--u16)*1.1)] shrink-0 z-10 group">
            <span 
              style={{
                width: isTransparent ? 'calc(var(--u16) * 2.9)' : '2.5rem',
                height: isTransparent ? 'calc(var(--u16) * 2.9)' : '2.5rem',
                borderRadius: isTransparent ? 'calc(var(--u16) * 0.7)' : '0.65rem',
              }}
              className={`flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105 p-1 bg-white ${
                isTransparent 
                  ? 'border border-slate-200/80 lg:border-transparent' 
                  : 'border border-slate-200'
              }`}
            >
              <img 
                src="/Logo.png" 
                alt="Scamora" 
                className="w-full h-full object-contain" 
              />
            </span>
            <div className="flex flex-col">
              <span 
                style={{
                  fontSize: isTransparent ? 'calc(var(--u16) * 1.65)' : '1.35rem',
                }}
                className={`font-bold tracking-tight leading-none transition-colors duration-300 font-['DM_Sans',sans-serif] ${
                  isTransparent 
                    ? 'text-[#14161c] lg:text-white' 
                    : 'text-[#14161c]'
                }`}
              >
                Scamora
              </span>
            </div>
          </Link>

          {/* Right: Desktop Navigation Bar */}
          <nav 
            aria-label="Navigasi utama" 
            style={{ 
              gap: 'calc(var(--u16) * 2.4)', 
              fontSize: 'calc(var(--u16) * 1.05)' 
            }}
            className="hidden lg:flex items-center font-semibold whitespace-nowrap"
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-1.5 whitespace-nowrap transition-colors duration-150 border-b-[calc(var(--u16)*0.2)] ${
                    active
                      ? 'text-[#0f9b8a] border-[#0f9b8a] font-bold'
                      : 'text-[#475569] border-transparent hover:text-[#0f9b8a]'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Account / Auth Status Button */}
          <div className="hidden lg:flex items-center gap-2.5 z-10">
            {adminAuth.getUser() ? (
              <div className="flex items-center gap-2">
                <Link
                  to={adminAuth.getUser()?.role === 'admin' ? '/admin' : '/'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-2xs font-mono"
                  title="Status Akun Pengguna"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>@{adminAuth.getUser()?.username}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 uppercase font-black">
                    {adminAuth.getUser()?.role === 'admin' ? 'Admin' : 'Verified'}
                  </span>
                </Link>

                {adminAuth.getUser()?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs"
                  >
                    Panel Admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    adminAuth.clearSession();
                    window.location.reload();
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Keluar dari Akun"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold transition shadow-xs hover:shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
            )}
          </div>

          {/* Right: Mobile Menu Toggle (lg:hidden) */}
          <div className="flex items-center lg:hidden z-10">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              type="button"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                isTransparent 
                  ? 'bg-white/90 text-[#14161c] hover:bg-white' 
                  : 'bg-stone-200/80 text-[#14161c] hover:bg-stone-300/80'
              }`}
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

            {/* User Account / Auth Entry Mobile */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to={adminAuth.getUser() ? (adminAuth.getUser()?.role === 'admin' ? '/admin' : '/') : '/login'}
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-bold transition border border-emerald-200/80 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {adminAuth.getUser()
                      ? `Akun: @${adminAuth.getUser()?.username}`
                      : 'Masuk / Daftar Akun'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  {adminAuth.getUser() ? (adminAuth.getUser()?.role === 'admin' ? 'Admin' : 'Verified') : 'Masuk'}
                </span>
              </Link>

              {adminAuth.getUser() && (
                <div className="flex items-center gap-2 px-1">
                  {adminAuth.getUser()?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center py-2 rounded-xl bg-[#334257] text-white text-xs font-bold transition"
                    >
                      Buka Panel Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      adminAuth.clearSession();
                      setMobileOpen(false);
                      window.location.reload();
                    }}
                    className="flex-1 text-center py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                  >
                    Keluar Sesi
                  </button>
                </div>
              )}
            </div>

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

    {/* Mobile Ergonomic Bottom Bar (Accessible anywhere on the page) */}
    <nav 
      aria-label="Navigasi cepat mobile" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-t border-[#d9d6d0] px-1 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around"
    >
      {bottomNavLinks.map((link) => {
        const active = isActive(link.path);
        const IconComponent = link.icon;
        return (
          <Link
            key={link.path}
            to={link.path}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-w-[48px] flex-1 ${
              active
                ? 'text-[#0f9b8a] font-bold'
                : 'text-[#64748b] hover:text-[#0f9b8a]'
            }`}
          >
            <span className={`p-1 rounded-xl transition-all ${
              active ? 'bg-teal-100/70 text-[#0f9b8a]' : 'text-[#64748b]'
            }`}>
              <IconComponent className="w-4.5 h-4.5" />
            </span>
            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  </>
  );
};
