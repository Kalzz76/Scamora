import React from 'react';

interface FooterProps {
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  return (
    <footer className="w-full bg-white/80 backdrop-blur-sm border-t border-slate-200/90 text-[#0F172A] mt-auto">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Main Footer Links Container */}
        <div className="pt-6 sm:pt-8 pb-5 sm:pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 text-left">
          
          {/* Brand Info & Social Media (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                <img src="/Logo.png" alt="Scamora" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-[#0F172A] block leading-none">
                  Scamora
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Explore. Reason. Prevent.
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-medium">
              Platform deteksi dini potensi ancaman digital mandiri berbasis kecerdasan buatan dan pemindaian heuristik cerdas untuk perlindungan masyarakat.
            </p>

            {/* Social Media Links (Follow Us) - Compact single-line on mobile */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="text-xs font-semibold text-slate-600 shrink-0">
                Follow Us:
              </span>
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a
                  href="#/pengetahuan"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0F172A] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="#/pengetahuan"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0F172A] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="#/pengetahuan"
                  aria-label="Twitter X"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0F172A] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="#/pengetahuan"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0F172A] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          {/* Links Section: Compact 2-column grid on mobile (grid-cols-2), 3-column on tablet/desktop (sm:grid-cols-3) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Col 1: Modul Deteksi */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Modul Deteksi
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs text-gray-500 font-medium">
                <li>
                  <a href="#/url" className="hover:text-[#0D9488] transition-colors">
                    Cek URL
                  </a>
                </li>
                <li>
                  <a href="#/chat" className="hover:text-[#0D9488] transition-colors">
                    Chat AI Detector
                  </a>
                </li>
                <li>
                  <a href="#/laporan" className="hover:text-[#0D9488] transition-colors">
                    Pemindaian Publik
                  </a>
                </li>
                <li>
                  <a href="#/kuis" className="hover:text-[#0D9488] transition-colors">
                    Tantangan Kuis
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 2: Dukungan */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Dukungan
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs text-gray-500 font-medium">
                <li>
                  <a href="#/panduan" className="hover:text-[#0D9488] transition-colors">
                    Panduan Tanggap
                  </a>
                </li>
                <li>
                  <a href="#/pengetahuan" className="hover:text-[#0D9488] transition-colors">
                    Pusat Edukasi
                  </a>
                </li>
                <li>
                  <a href="#/komunitas" className="hover:text-[#0D9488] transition-colors">
                    Forum Komunitas
                  </a>
                </li>
                <li>
                  <a href="#/panduan" className="hover:text-[#0D9488] transition-colors">
                    Kontak Bantuan
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Privasi & Etika (On mobile sits nicely in 2nd row with 2-col layout) */}
            <div className="col-span-2 sm:col-span-1 space-y-2.5 sm:space-y-3 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Privasi &amp; Etika
              </h4>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-2.5 text-xs text-gray-500 font-medium">
                <li>
                  <button 
                    onClick={onOpenPrivacy} 
                    type="button"
                    className="hover:text-[#0D9488] transition-colors text-left cursor-pointer"
                  >
                    Zero Data Retention
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onOpenPrivacy} 
                    type="button"
                    className="hover:text-[#0D9488] transition-colors text-left cursor-pointer"
                  >
                    Kebijakan Privasi
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onOpenPrivacy} 
                    type="button"
                    className="hover:text-[#0D9488] transition-colors text-left cursor-pointer"
                  >
                    Prinsip AI Beretika
                  </button>
                </li>
                <li>
                  <a href="#/pengetahuan" className="hover:text-[#0D9488] transition-colors">
                    Standar Keamanan
                  </a>
                </li>
                <li className="col-span-2 sm:col-span-1">
                  <a href="#/admin" className="hover:text-[#0D9488] transition-colors flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700">
                    <span>Portal Administrator</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">Petugas</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footnote & Copyright (Unified, No Awkward Gap) */}
        <div className="py-4 sm:py-5 border-t border-slate-200/80 text-center">
          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed max-w-4xl mx-auto">
            <strong className="font-semibold text-slate-500">Penafian:</strong> Analisis Scamora merupakan indikasi risiko berbasis AI &amp; aturan teknis heuristik untuk edukasi pencegahan, bukan pembuktian vonis hukum peradilan. <span className="mx-1.5 sm:mx-2 text-slate-300 font-normal">&bull;</span> <span className="font-mono text-slate-400">&copy; 2026 Scamora AI. All rights reserved.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
