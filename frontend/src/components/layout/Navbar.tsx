import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Globe, 
  Compass, 
  Gamepad2, 
  GraduationCap, 
  Users,
  LogIn,
  User,
  ShieldCheck
} from 'lucide-react';
import { adminAuth } from '../../admin/services/adminAuth';

interface NavbarProps {
  onOpenPrivacy?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(adminAuth.getUser());
  const isAuth = !!currentUser;
  const isHome = location.pathname === '/' && !scrolled;

  useEffect(() => {
    setCurrentUser(adminAuth.getUser());
  }, [location.pathname]);

  // Track window scroll to create smooth responsive sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop navigation links - Dynamic based on Auth state
  const navLinks = isAuth
    ? [
        { path: '/', label: 'Beranda' },
        { path: '/laporan', label: 'Pemindaian Publik' },
        { path: '/panduan', label: 'Panduan' },
        { path: '/kuis', label: 'Tantangan AI' },
        { path: '/pengetahuan', label: 'Edukasi' },
        { path: '/komunitas', label: 'Komunitas' },
      ]
    : [
        { path: '/', label: 'Beranda' },
        { path: '/laporan', label: 'Pemindaian Publik' },
        { path: '/panduan', label: 'Panduan' },
      ];

  // Mobile Bottom Navigation Links (thumb-friendly access everywhere)
  const bottomNavLinks = isAuth
    ? [
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/laporan', label: 'Publik', icon: Globe },
        { path: '/kuis', label: 'Tantangan', icon: Gamepad2 },
        { path: '/pengetahuan', label: 'Edukasi', icon: GraduationCap },
        { path: '/komunitas', label: 'Komunitas', icon: Users },
        { path: '/profil', label: 'Profil', icon: User },
      ]
    : [
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/laporan', label: 'Publik', icon: Globe },
        { path: '/panduan', label: 'Panduan', icon: Compass },
        { path: '/login', label: 'Masuk', icon: LogIn },
      ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isTransparent = location.pathname === '/' && !scrolled;

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
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profil"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-2xs font-mono"
                    title="Profil & Pengaturan Akun"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>@{currentUser.username}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 uppercase font-black">
                      {currentUser.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </Link>

                  {currentUser.role === 'admin' && (
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
                      window.location.href = '/#/';
                      window.location.reload();
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Keluar dari Akun"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/register"
                    className="text-xs text-[#475569] hover:text-[#0f9b8a] font-semibold px-2.5 py-1.5 rounded-lg hover:bg-stone-100/70 transition cursor-pointer"
                  >
                    Daftar
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold transition shadow-xs hover:shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Header: Clean auth status / quick access */}
            <div className="flex items-center lg:hidden z-10">
              {currentUser ? (
                <Link
                  to="/profil"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono"
                  title="Profil Saya"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[90px]">@{currentUser.username}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f9b8a] text-white text-xs font-bold shadow-xs"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>

          </div>
        </div>
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
