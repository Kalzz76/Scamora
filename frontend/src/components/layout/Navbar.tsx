import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, Menu, X } from 'lucide-react';

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

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/laporan', label: 'Pemindaian Publik' },
    { path: '/panduan', label: 'Panduan' },
    { path: '/kuis', label: 'Tantangan AI' },
    { path: '/pengetahuan', label: 'Edukasi' },
    { path: '/komunitas', label: 'Komunitas' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isTransparent = isHome && !scrolled;

  return (
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
            scrolled ? 'h-16' : 'h-20 lg:h-24'
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
                  ? '' 
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
                    ? 'text-white' 
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

      {/* Mobile Dropdown with Smooth Slide/Fade */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-lg px-6 pt-3 pb-6 space-y-1 shadow-xl overflow-hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-teal-50 text-[#0D9488] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 mt-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenPrivacy();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition"
              >
                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                <span>Pernyataan Privasi &amp; Zero Retention</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
