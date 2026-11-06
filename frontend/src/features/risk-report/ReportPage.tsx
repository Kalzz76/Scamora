import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Layers,
  PlusCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { directoryService, type ScannedDomain } from '../../services/directoryService';

export const ReportPage: React.FC = () => {
  const [domains, setDomains] = useState<ScannedDomain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'high' | 'review' | 'low'>('all');
  const [stats, setStats] = useState({ totalDomains: 1248, highRiskPercent: 31, checksToday: 86 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportInput, setReportInput] = useState('');
  const [reportCategory, setReportCategory] = useState('Phishing Perbankan');
  const [reportNotes, setReportNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setDomains(directoryService.getDomains());
    setStats(directoryService.getStats());
  }, []);

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

  const filteredDomains = domains.filter((d) => {
    const matchesSearch = d.domain.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesCategory = filterCategory === 'all' || d.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryStyles = {
    high: {
      bar: '#D92D20',
      badge: 'bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B]',
      text: 'Risiko Tinggi',
      dot: 'bg-[#D92D20]',
    },
    review: {
      bar: '#F79009',
      badge: 'bg-[#FEF0C7] text-[#93370D] border border-[#FDB022]',
      text: 'Perlu Ditinjau',
      dot: 'bg-[#F79009]',
    },
    low: {
      bar: '#12B76A',
      badge: 'bg-[#DCFAE6] text-[#067647] border border-[#75E0A7]',
      text: 'Rendah',
      dot: 'bg-[#12B76A]',
    },
  };

  return (
    <div className="flex flex-col w-full bg-[#F5F3EE] text-[#14130F] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1120px] mx-auto w-full space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEAE0] text-xs font-bold text-[#14130F]">
              <Layers className="w-3.5 h-3.5 text-[#14130F]" />
              <span>DIREKTORI PEMINDAIAN PUBLIK</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-[#14130F] tracking-tight">
              Pemindaian Publik
            </h1>
            <p className="text-base sm:text-lg text-[#5B5850] max-w-2xl leading-relaxed">
              Daftar domain yang telah diperiksa oleh pengguna lain, lengkap dengan frekuensi pengecekan dan persentase indikasi risikonya.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#14130F] hover:bg-[#2A2721] text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Laporkan Domain Baru</span>
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold font-mono text-[#706C62] uppercase tracking-wider">
              Total Domain Diperiksa
            </span>
            <div className="font-display font-black text-3xl sm:text-4xl text-[#14130F] mt-2">
              {stats.totalDomains.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold font-mono text-[#706C62] uppercase tracking-wider">
              Indikasi Risiko Tinggi
            </span>
            <div className="font-display font-black text-3xl sm:text-4xl text-[#B42318] mt-2">
              {stats.highRiskPercent}%
            </div>
          </div>

          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold font-mono text-[#706C62] uppercase tracking-wider">
              Pemeriksaan Hari Ini
            </span>
            <div className="font-display font-black text-3xl sm:text-4xl text-[#067647] mt-2">
              {stats.checksToday}
            </div>
          </div>
        </div>

        {/* MAIN TABLE CONTAINER */}
        <div className="bg-white border border-[#E4E0D6] rounded-2xl overflow-hidden shadow-xs">
          
          {/* TOOLBAR: SEARCH & FILTER CHIPS */}
          <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#EEEAE0]">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C887B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama domain (contoh: bca, xyz, login)..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#D5D0C3] bg-white text-sm text-[#14130F] placeholder:text-[#8C887B] focus:outline-2 focus:outline-[#14130F] focus:outline-offset-1 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-[#14130F] text-white'
                    : 'bg-[#FAF8F5] text-[#5B5850] hover:bg-[#EEEAE0] border border-[#EAE6DC]'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('high')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === 'high'
                    ? 'bg-[#14130F] text-white'
                    : 'bg-[#FAF8F5] text-[#B42318] hover:bg-[#FEE4E2] border border-[#FDA29B]'
                }`}
              >
                Risiko Tinggi
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('review')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === 'review'
                    ? 'bg-[#14130F] text-white'
                    : 'bg-[#FAF8F5] text-[#93370D] hover:bg-[#FEF0C7] border border-[#FDB022]'
                }`}
              >
                Perlu Ditinjau
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('low')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === 'low'
                    ? 'bg-[#14130F] text-white'
                    : 'bg-[#FAF8F5] text-[#067647] hover:bg-[#DCFAE6] border border-[#75E0A7]'
                }`}
              >
                Rendah
              </button>
            </div>
          </div>

          {/* MOBILE VIEW: DEDICATED RESPONSIVE CARD LIST (md:hidden) */}
          <div className="md:hidden divide-y divide-[#F0ECE3]">
            {filteredDomains.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-[#706C62]">
                Tidak ada domain yang cocok dengan pencarian kata kunci "{searchQuery}".
              </div>
            ) : (
              filteredDomains.map((item, idx) => {
                const style = categoryStyles[item.category] || categoryStyles.review;
                return (
                  <div key={idx} className="p-4 space-y-3 hover:bg-[#FAF8F4] transition-colors">
                    {/* Top Row: Domain & Category Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-mono font-bold text-sm text-[#14130F] block truncate">
                          {item.domain}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#706C62] mt-0.5">
                          <span>Diperiksa {item.count}&times;</span>
                          <span>&bull;</span>
                          <span>{item.lastChecked}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] shrink-0 ${style.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        <span>{style.text}</span>
                      </span>
                    </div>

                    {/* Middle Row: Progress Bar & Risk Percentage */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#EAE6DC] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.riskPercent}%`,
                            backgroundColor: style.bar,
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-[#14130F] tabular-nums shrink-0">
                        {item.riskPercent}% Bahaya
                      </span>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/', { state: { prefillUrl: `http://${item.domain}` } });
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#14130F] hover:text-white text-[#14130F] border border-[#D5D0C3] font-semibold text-xs transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Periksa Domain Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP VIEW: FULL 6-COLUMN TABLE (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F4] border-b border-[#E4E0D6] text-[11px] font-bold font-mono uppercase text-[#767165] tracking-wider">
                  <th className="py-3.5 px-5">Domain</th>
                  <th className="py-3.5 px-4">Diperiksa</th>
                  <th className="py-3.5 px-5">Tingkat Risiko (% Bahaya)</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Terakhir</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE3]">
                {filteredDomains.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[#706C62]">
                      Tidak ada domain yang cocok dengan pencarian kata kunci "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredDomains.map((item, idx) => {
                    const style = categoryStyles[item.category] || categoryStyles.review;
                    return (
                      <tr key={idx} className="hover:bg-[#FAF8F4] transition-colors group">
                        
                        {/* Domain Column */}
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-sm text-[#14130F]">
                            {item.domain}
                          </span>
                        </td>

                        {/* Frequency Column */}
                        <td className="py-4 px-4 font-mono font-semibold text-[#5B5850]">
                          {item.count}&times;
                        </td>

                        {/* Risk Percentage Bar Column */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[140px] h-2 bg-[#EAE6DC] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${item.riskPercent}%`,
                                  backgroundColor: style.bar,
                                }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs text-[#14130F] tabular-nums">
                              {item.riskPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Category Badge Column */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <span>{style.text}</span>
                          </span>
                        </td>

                        {/* Last Checked Column */}
                        <td className="py-4 px-4 text-[#706C62] font-mono text-[11px]">
                          {item.lastChecked}
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/', { state: { prefillUrl: `http://${item.domain}` } });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF8F5] group-hover:bg-[#14130F] group-hover:text-white text-[#14130F] border border-[#D5D0C3] group-hover:border-[#14130F] font-semibold text-xs transition-all cursor-pointer"
                          >
                            <span>Periksa</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER NOTICE */}
          <div className="p-4 bg-[#FAF8F4] border-t border-[#E4E0D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#706C62]">
            <span>
              💡 Data di atas bersifat anonim dan dihimpun dari partisipasi pemindaian komunitas Scamora.
            </span>
            <Link
              to="/"
              className="text-[#14130F] font-bold hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Periksa Tautan Lain di Beranda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* MODAL LAPORAN KOMUNITAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#14130F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4E0D6] shadow-xl max-w-md w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#8C887B] hover:text-[#14130F] p-1.5 rounded-full hover:bg-[#F5F3EE] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#B42318] mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>LAPORKAN PENIPUAN BARU</span>
            </div>
            <h2 className="text-xl font-bold font-display text-[#14130F] mb-1.5">
              Laporkan ke Komunitas
            </h2>
            <p className="text-xs text-[#5B5850] leading-relaxed mb-5">
              Bantu lindungi pengguna lain dengan melaporkan domain atau tautan mencurigakan yang baru saja Anda temui.
            </p>

            <form onSubmit={handleManualReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#14130F] block mb-1">
                  Alamat Tautan / Domain:
                </label>
                <input
                  type="text"
                  required
                  value={reportInput}
                  onChange={(e) => setReportInput(e.target.value)}
                  placeholder="contoh: bank-palsu-login.xyz atau bit.ly/..."
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D0C3] text-sm focus:outline-2 focus:outline-[#14130F]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#14130F] block mb-1">
                  Jenis Modus:
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5D0C3] text-xs bg-white focus:outline-2 focus:outline-[#14130F]"
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
                <label className="font-semibold text-[#14130F] block mb-1">
                  Catatan Tambahan (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Ceritakan singkat pesan atau indikasi yang mencurigakan..."
                  className="w-full p-2.5 rounded-xl border border-[#D5D0C3] text-xs resize-none focus:outline-2 focus:outline-[#14130F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#D5D0C3] text-[#5B5850] hover:bg-[#F5F3EE] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#14130F] hover:bg-[#2A2721] text-white font-semibold cursor-pointer shadow-2xs"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
