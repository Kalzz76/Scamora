import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  PlusCircle, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { directoryService, type ScannedDomain } from '../../services/directoryService';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<ScannedDomain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'newest' | 'oldest' | 'high' | 'review' | 'low'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({ totalDomains: 1248, highRiskPercent: 31, checksToday: 86 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportInput, setReportInput] = useState('');
  const [reportCategory, setReportCategory] = useState('Phishing Perbankan');
  const [reportNotes, setReportNotes] = useState('');

  useEffect(() => {
    setDomains(directoryService.getDomains());
    setStats(directoryService.getStats());
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  // Lock background body scroll and listen for Escape key when modal is open (Mobile touch proof)
  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsModalOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, scrollY);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen]);

  const handleManualReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportInput.trim()) {
      toast.error('Masukkan alamat tautan atau domain yang dilaporkan.');
      return;
    }

    directoryService.addManualReport(reportInput.trim(), reportCategory, reportNotes.trim());
    setDomains(directoryService.getDomains());
    setStats(directoryService.getStats());
    toast.success('Laporan berhasil dicatat ke Pemindaian Publik!');
    setReportInput('');
    setReportNotes('');
    setIsModalOpen(false);
  };

  const filteredDomains = [...domains]
    .filter((d) => {
      const matchesSearch = d.domain.toLowerCase().includes(searchQuery.trim().toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === 'high') return d.category === 'high' || d.riskPercent >= 60;
      if (activeFilter === 'review') return d.category === 'review' || (d.riskPercent >= 30 && d.riskPercent < 60);
      if (activeFilter === 'low') return d.category === 'low' || d.riskPercent < 30;
      return true;
    })
    .sort((a, b) => {
      if (activeFilter === 'oldest') {
        return (a.timestamp || 0) - (b.timestamp || 0);
      }
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

  const totalPages = Math.max(1, Math.ceil(filteredDomains.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDomains = filteredDomains.slice(startIndex, startIndex + itemsPerPage);

  const categoryStyles = {
    high: {
      bar: '#D92D20',
      badge: 'bg-[#FEE4E2] text-[#B42318]',
      text: 'Risiko Tinggi',
      dot: 'bg-[#D92D20]',
    },
    review: {
      bar: '#F79009',
      badge: 'bg-[#FEF0C7] text-[#93370D]',
      text: 'Perlu Ditinjau',
      dot: 'bg-[#F79009]',
    },
    low: {
      bar: '#12B76A',
      badge: 'bg-[#DCFAE6] text-[#067647]',
      text: 'Rendah',
      dot: 'bg-[#12B76A]',
    },
  };

  return (
    <div className="sec-enhanced sec-direktori flex flex-col w-full bg-[#faf8f5] text-[#14161c] min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-16">
      <div className="max-w-[1120px] mx-auto w-full space-y-6 sm:space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 pb-2">
          <div>
            <h1 className="sec-heading-bar font-display text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
              Pemindaian Publik
            </h1>
            <p className="text-sm sm:text-lg text-[#5B5850] mt-2 sm:mt-3 max-w-2xl leading-relaxed">
              Daftar domain yang telah diperiksa oleh pengguna lain, lengkap dengan frekuensi pengecekan dan persentase indikasi risikonya.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-[#14161C] hover:bg-[#2B2F3A] text-white font-['DM_Sans',sans-serif] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.18)] cursor-pointer w-full sm:w-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Laporkan Domain Baru</span>
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <div className="bg-white rounded-2xl sm:rounded-[22px] border border-[#E3E0DA] border-t-4 border-t-[#1d3f6e] p-4.5 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex sm:flex-col justify-between items-center sm:items-start hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all">
            <span className="text-xs sm:text-sm font-semibold text-[#5B5850]">
              Total Domain Diperiksa
            </span>
            <div className="font-display font-bold text-2xl sm:text-4xl text-[#14161C] sm:mt-2">
              {stats.totalDomains.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[22px] border border-[#E3E0DA] border-t-4 border-t-[#D92D20] p-4.5 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex sm:flex-col justify-between items-center sm:items-start hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all">
            <span className="text-xs sm:text-sm font-semibold text-[#5B5850]">
              Indikasi Risiko Tinggi
            </span>
            <div className="font-display font-bold text-2xl sm:text-4xl text-[#B42318] sm:mt-2">
              {stats.highRiskPercent}%
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[22px] border border-[#E3E0DA] border-t-4 border-t-[#0f9b8a] p-4.5 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex sm:flex-col justify-between items-center sm:items-start hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all">
            <span className="text-xs sm:text-sm font-semibold text-[#5B5850]">
              Pemeriksaan Hari Ini
            </span>
            <div className="font-display font-bold text-2xl sm:text-4xl text-[#0f9b8a] sm:mt-2">
              {stats.checksToday}
            </div>
          </div>
        </div>

        {/* MAIN TABLE CONTAINER */}
        <div className="bg-white border border-[#E3E0DA] rounded-2xl sm:rounded-[22px] overflow-hidden shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)]">
          
          {/* TOOLBAR: SEARCH & UNIFIED FILTER CHIPS */}
          <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 border-b border-[#EEEAE0]">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <Search className="w-4 h-4 text-[#14161C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari domain (contoh: bca, xyz, login)..."
                className="w-full h-10 sm:h-11 pl-11 pr-4 rounded-full border border-[#D5D0C3] bg-white text-xs sm:text-sm text-[#14161C] placeholder:text-[#8C887B] focus:outline-none focus:ring-2 focus:ring-[#14161c]/10 focus:border-[#14161c] transition-all font-['DM_Sans',sans-serif]"
              />
            </div>

            {/* Single Unified Filter Pill Group with Horizontal Swipe on Mobile */}
            <div className="w-full lg:w-auto overflow-x-auto pb-1 sm:pb-0 [-webkit-overflow-scrolling:touch]">
              <div className="inline-flex bg-[#eeece8] p-1 rounded-full gap-1 items-center whitespace-nowrap min-w-max" role="tablist">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`h-7 sm:h-8 px-3 sm:px-4 rounded-full text-xs transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-[#14161C] text-white font-bold shadow-xs'
                      : 'bg-transparent text-[#5B5850] hover:text-[#14161C] font-medium'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('newest')}
                  className={`h-7 sm:h-8 px-3 sm:px-4 rounded-full text-xs transition-all cursor-pointer ${
                    activeFilter === 'newest'
                      ? 'bg-[#14161C] text-white font-bold shadow-xs'
                      : 'bg-transparent text-[#5B5850] hover:text-[#14161C] font-medium'
                  }`}
                >
                  Terbaru
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('oldest')}
                  className={`h-7 sm:h-8 px-3 sm:px-4 rounded-full text-xs transition-all cursor-pointer ${
                    activeFilter === 'oldest'
                      ? 'bg-[#14161C] text-white font-bold shadow-xs'
                      : 'bg-transparent text-[#5B5850] hover:text-[#14161C] font-medium'
                  }`}
                >
                  Terlama
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('high')}
                  className={`h-7 sm:h-8 px-3 sm:px-4 rounded-full text-xs transition-all cursor-pointer ${
                    activeFilter === 'high'
                      ? 'bg-[#14161C] text-white font-bold shadow-xs'
                      : 'bg-transparent text-[#B42318] hover:text-[#B42318] font-medium'
                  }`}
                >
                  Risiko Tinggi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('review')}
                  className={`h-7 sm:h-8 px-3 sm:px-4 rounded-full text-xs transition-all cursor-pointer ${
                    activeFilter === 'review'
                      ? 'bg-[#14161C] text-white font-bold shadow-xs'
                      : 'bg-transparent text-[#93370D] hover:text-[#93370D] font-medium'
                  }`}
                >
                  Perlu Ditinjau
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('low')}
                  className={`h-7 sm:h-8 px-3 sm:px-4 rounded-full text-xs transition-all cursor-pointer ${
                    activeFilter === 'low'
                      ? 'bg-[#14161C] text-white font-bold shadow-xs'
                      : 'bg-transparent text-[#067647] hover:text-[#067647] font-medium'
                  }`}
                >
                  Rendah
                </button>
              </div>
            </div>

          </div>

          {/* MOBILE VIEW: DEDICATED RESPONSIVE CARD LIST (md:hidden) */}
          <div className="md:hidden divide-y divide-[#F0ECE3]">
            {filteredDomains.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-[#706C62]">
                Tidak ada domain yang cocok dengan pencarian kata kunci "{searchQuery}".
              </div>
            ) : (
              paginatedDomains.map((item, idx) => {
                const style = categoryStyles[item.category] || categoryStyles.review;
                return (
                  <div key={idx} className="p-4 space-y-2.5 hover:bg-[#FAF8F5] transition-colors">
                    {/* Top Row: Domain & Category Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/', { state: { prefillUrl: `http://${item.domain}` } });
                          }}
                          className="font-mono font-bold text-sm text-[#14161C] hover:text-[#1d3f6e] hover:underline block truncate text-left cursor-pointer"
                        >
                          {item.domain}
                        </button>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#706C62] mt-0.5">
                          <span>Diperiksa {item.count}&times;</span>
                          <span>&bull;</span>
                          <span>{item.lastChecked}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] shrink-0 ${style.badge}`}>
                        {style.text}
                      </span>
                    </div>

                    {/* Middle Row: Progress Bar & Risk Percentage */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#EEEAE0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.riskPercent}%`,
                            backgroundColor: style.bar,
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-[#14161C] tabular-nums shrink-0">
                        {item.riskPercent}% Bahaya
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP VIEW: FULL 5-COLUMN TABLE (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E3E0DA] text-[11px] font-bold font-mono uppercase text-[#767165] tracking-wider">
                  <th className="py-4 px-6">Domain</th>
                  <th className="py-4 px-4">Diperiksa</th>
                  <th className="py-4 px-5">Tingkat Risiko (% Bahaya)</th>
                  <th className="py-4 px-4">Kategori</th>
                  <th className="py-4 px-6 text-right">Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE3]">
                {filteredDomains.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#706C62]">
                      Tidak ada domain yang cocok dengan pencarian kata kunci "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedDomains.map((item, idx) => {
                    const style = categoryStyles[item.category] || categoryStyles.review;
                    return (
                      <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors group">
                        
                        {/* Domain Column */}
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/', { state: { prefillUrl: `http://${item.domain}` } });
                            }}
                            className="font-mono font-bold text-sm text-[#14161C] hover:text-[#1d3f6e] hover:underline cursor-pointer text-left transition-colors"
                          >
                            {item.domain}
                          </button>
                        </td>

                        {/* Frequency Column */}
                        <td className="py-4 px-4 font-mono font-semibold text-[#5B5850]">
                          {item.count}&times;
                        </td>

                        {/* Risk Percentage Bar Column */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[140px] h-2 bg-[#EEEAE0] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${item.riskPercent}%`,
                                  backgroundColor: style.bar,
                                }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs text-[#14161C] tabular-nums">
                              {item.riskPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Category Badge Column */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs ${style.badge}`}>
                            {style.text}
                          </span>
                        </td>

                        {/* Last Checked Column */}
                        <td className="py-4 px-6 text-right font-mono text-xs text-[#706C62]">
                          {item.lastChecked}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION BAR */}
          {filteredDomains.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#EEEAE0] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-[#5B5850]">
              <div className="font-medium text-center sm:text-left">
                Menampilkan <span className="font-bold text-[#14161C]">{startIndex + 1}</span>–<span className="font-bold text-[#14161C]">{Math.min(startIndex + itemsPerPage, filteredDomains.length)}</span> dari <span className="font-bold text-[#14161C]">{filteredDomains.length}</span> domain
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 rounded-full border border-[#D5D0C3] bg-white text-[#14161C] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  {/* Mobile Compact Page Indicator */}
                  <span className="sm:hidden font-mono font-semibold text-xs text-[#14161C]">
                    {currentPage} / {totalPages}
                  </span>

                  {/* Desktop Numbered Page Buttons */}
                  <div className="hidden sm:flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        totalPages > 7 &&
                        page !== 1 &&
                        page !== totalPages &&
                        Math.abs(page - currentPage) > 1
                      ) {
                        if (page === 2 || page === totalPages - 1) {
                          return <span key={page} className="px-1 text-[#8C887B]">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            currentPage === page
                              ? 'bg-[#14161C] text-white shadow-xs'
                              : 'text-[#5B5850] hover:bg-[#EEEAE0] hover:text-[#14161C]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 rounded-full border border-[#D5D0C3] bg-white text-[#14161C] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* MODAL LAPORAN KOMUNITAS (Mounted via portal to escape stacking context) */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999] bg-[#14161C]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E3E0DA] shadow-[0_24px_48px_-12px_rgba(20,22,28,0.35)] max-w-md w-full p-5 sm:p-7 relative my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain touch-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-report-title"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 text-[#8C887B] hover:text-[#14161C] p-1.5 rounded-full hover:bg-[#F5F3EE] transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#B42318] mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>LAPORKAN PENIPUAN BARU</span>
            </div>
            <h2 id="modal-report-title" className="text-lg sm:text-xl font-bold font-display text-[#14161C] mb-1">
              Laporkan ke Komunitas
            </h2>
            <p className="text-xs text-[#5B5850] leading-relaxed mb-4 sm:mb-5">
              Bantu lindungi pengguna lain dengan melaporkan domain atau tautan mencurigakan yang baru saja Anda temui.
            </p>

            <form onSubmit={handleManualReportSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#14161C] block mb-1">
                  Alamat Tautan / Domain:
                </label>
                <input
                  type="text"
                  required
                  value={reportInput}
                  onChange={(e) => setReportInput(e.target.value)}
                  placeholder="contoh: bank-palsu-login.xyz atau bit.ly/..."
                  className="w-full h-10 sm:h-11 px-3.5 rounded-xl border border-[#D5D0C3] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#14161c]/10 focus:border-[#14161c]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#14161C] block mb-1">
                  Jenis Modus:
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full h-10 sm:h-11 px-3.5 rounded-xl border border-[#D5D0C3] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#14161c]/10 focus:border-[#14161c]"
                >
                  <option value="Phishing Perbankan">Phishing Perbankan / Akun</option>
                  <option value="Undangan Pernikahan APK">Undangan Pernikahan APK</option>
                  <option value="Paket / Resi Tertahan">Paket / Resi Ekspedisi Palsu</option>
                  <option value="Hadiah / Undian">Hadiah / Undian Belanja Palsu</option>
                  <option value="Lowongan Kerja Palsu">Lowongan Kerja / Investasi Palsu</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#14161C] block mb-1">
                  Catatan Tambahan (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Ceritakan singkat pesan atau indikasi yang mencurigakan..."
                  className="w-full p-3 rounded-xl border border-[#D5D0C3] text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#14161c]/10 focus:border-[#14161c]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 sm:h-10 px-4 sm:px-5 rounded-full border border-[#D5D0C3] text-[#5B5850] hover:bg-[#F5F3EE] font-semibold cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 sm:h-10 px-5 sm:px-6 rounded-full bg-[#14161C] hover:bg-[#2A2721] text-white font-semibold cursor-pointer shadow-xs text-xs"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
