import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, Menu, X, Lock } from 'lucide-react';

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

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/url', label: 'Cek URL' },
    { path: '/chat', label: 'Analisis Chat' },
    { path: '/laporan', label: 'Laporan' },
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

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200' 
          : 'bg-white/80 backdrop-blur-md border-b border-slate-200/70'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`relative flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
          
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
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] xl:text-sm font-semibold whitespace-nowrap absolute left-1/2 -translate-x-1/2">
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
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition text-gray-700 cursor-pointer"
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
            className="lg:hidden border-b border-gray-200 bg-white px-6 pt-3 pb-6 space-y-1 shadow-xl overflow-hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#FDF0E9] text-[#E86A33] font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 mt-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenPrivacy();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#EAF2ED] text-[#143826] text-xs font-bold cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#143826]" />
                <span>Pernyataan Privasi &amp; Zero Retention</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
