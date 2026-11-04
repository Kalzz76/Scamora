import React, { useState, useEffect, useRef } from 'react';
import { useInView, animate } from 'motion/react';
import { ShieldCheck, Zap, Activity, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

interface FooterProps {
  onOpenPrivacy: () => void;
}

interface CounterProps {
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({
  to,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, to, duration]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span ref={ref} className="tabular-nums font-bold">
      {prefix}{formatted}{suffix}
    </span>
  );
};

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Masukkan alamat email yang valid.');
      return;
    }
    setSubscribed(true);
    toast.success('Terima kasih! Anda telah terdaftar pada Buletin Keamanan Scamora.');
  };

  return (
    <footer className="w-full bg-white border-t border-gray-200 text-[#1A202C] mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Top Strip: Trust Stats & Follow Us (Exact Pomaii Style With Animated Counters) */}
        <div className="py-6 flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-gray-100 text-left">
          
          {/* Trust Metric Badges with Count-Up Animation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full lg:w-auto">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF2ED] text-[#143826] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#143826]" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs sm:text-sm font-bold text-gray-900">
                  <AnimatedCounter to={100} duration={1.5} suffix="% Zero Data" />
                </span>
                <span className="text-[11px] text-gray-400">Privasi Tanpa Retensi</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF2ED] text-[#143826] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-[#143826]" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs sm:text-sm font-bold text-gray-900">
                  <AnimatedCounter to={1.5} duration={1.4} decimals={1} prefix="<" suffix=" Detik" />
                </span>
                <span className="text-[11px] text-gray-400">Respon Analisis Cepat</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF2ED] text-[#143826] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-[#143826]" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs sm:text-sm font-bold text-gray-900">
                  <AnimatedCounter to={94.8} duration={1.8} decimals={1} suffix="% Akurasi" />
                </span>
                <span className="text-[11px] text-gray-400">Benchmark Evaluasi AI</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF2ED] text-[#143826] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#143826]" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs sm:text-sm font-bold text-gray-900">
                  <AnimatedCounter to={24} duration={1.2} suffix="/7 Siaga" />
                </span>
                <span className="text-[11px] text-gray-400">Akses Publik Mandiri</span>
              </div>
            </div>

          </div>

          {/* Follow Us / Social Circles */}
          <div className="flex items-center gap-3 self-center lg:self-auto shrink-0">
            <span className="text-xs font-semibold text-gray-600">Follow Us</span>
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <a
                href="#/pengetahuan"
                aria-label="Facebook"
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#143826] text-gray-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#/pengetahuan"
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#143826] text-gray-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
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
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#143826] text-gray-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#/pengetahuan"
                aria-label="YouTube"
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#143826] text-gray-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Main Footer Links Columns (Pomaii 5-Columns Layout) */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 text-left">
          
          {/* Brand Info (3.5 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#143826] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#E86A33]" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-[#143826] block leading-none">Scamora</span>
                <span className="text-[10px] text-gray-400 font-medium">Explore. Reason. Prevent.</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Platform deteksi dini potensi ancaman digital mandiri berbasis kecerdasan buatan dan pemindaian heuristik cerdas.
            </p>

            <p className="text-[11px] text-gray-400">
              Inovasi Deteksi Dini &bull; Cyber Intelligence
            </p>
          </div>

          {/* Col 1: Modul Deteksi (2 cols) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 tracking-wider">
              Modul Deteksi
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 font-medium">
              <li><a href="#/url" className="hover:text-[#E86A33] transition-colors">URL Checker</a></li>
              <li><a href="#/chat" className="hover:text-[#E86A33] transition-colors">Chat AI Detector</a></li>
              <li><a href="#/laporan" className="hover:text-[#E86A33] transition-colors">Telemetri Risiko</a></li>
              <li><a href="#/kuis" className="hover:text-[#E86A33] transition-colors">Tantangan Kuis</a></li>
            </ul>
          </div>

          {/* Col 2: Dukungan (2 cols) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 tracking-wider">
              Dukungan
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 font-medium">
              <li><a href="#/panduan" className="hover:text-[#E86A33] transition-colors">Panduan Tanggap</a></li>
              <li><a href="#/pengetahuan" className="hover:text-[#E86A33] transition-colors">Pusat Edukasi</a></li>
              <li><a href="#/panduan" className="hover:text-[#E86A33] transition-colors">Tanya Jawab (FAQ)</a></li>
              <li><a href="#/panduan" className="hover:text-[#E86A33] transition-colors">Kontak Bantuan</a></li>
            </ul>
          </div>

          {/* Col 3: Privasi & Etika (2 cols) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 tracking-wider">
              Privasi &amp; Etika
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 font-medium">
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-[#E86A33] transition-colors text-left">
                  Zero Data Retention
                </button>
              </li>
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-[#E86A33] transition-colors text-left">
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-[#E86A33] transition-colors text-left">
                  Prinsip AI Beretika
                </button>
              </li>
              <li>
                <a href="#/pengetahuan" className="hover:text-[#E86A33] transition-colors">
                  Standar Keamanan AI
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter (3.5 cols) */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 tracking-wider">
              Newsletter
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Dapatkan edukasi berkala seputar modus kejahatan siber terbaru.
            </p>

            {subscribed ? (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Email Anda telah terdaftar!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-hidden focus:border-[#143826] focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold rounded-lg transition shrink-0 shadow-2xs"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footnote & Copyright (Pomaii Centered Sleek Bottom) */}
        <div className="pt-6 pb-8 border-t border-gray-100 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-[11px] text-gray-400 leading-normal max-w-2xl">
            Penafian: Analisis Scamora merupakan indikasi risiko berbasis AI &amp; aturan teknis heuristik untuk edukasi pencegahan, bukan pembuktian vonis hukum peradilan.
          </p>
          <span className="text-xs text-gray-400 font-medium">
            &copy; 2026 Scamora AI. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
};
