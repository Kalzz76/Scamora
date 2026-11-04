import React, { useState } from 'react';
import { BookOpen, AlertTriangle, ShieldCheck, Search, ChevronRight } from 'lucide-react';

interface Article {
  id: string;
  category: string;
  title: string;
  summary: string;
  tactics: string[];
  prevention: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'apk-kurir',
    category: 'Malware Android',
    title: 'Modus Berkas .APK Kurir & Undangan Digital',
    summary: 'Pelaku mengirimkan tautan berkas biner .APK melalui WhatsApp dengan dalih surat undangan pernikahan atau foto resi paket tertahan.',
    tactics: [
      'Menyamarkan ekstensi aplikasi menjadi gambar atau dokumen (contoh: Surat_Undangan.apk).',
      'Meminta izin akses SMS (RECEIVE_SMS) saat diinstal untuk menyadap kode OTP perbankan.',
      'Menguras saldo tabungan melalui transfer otomatis tanpa disadari korban.',
    ],
    prevention: [
      'Jangan pernah menginstal file dari luar Google Play Store atau App Store resmi.',
      'Periksa format ekstensi berkas. Dokumen resmi tidak berakhiran .apk.',
      'Matikan opsi "Install unknown apps" pada pengaturan keamanan Android Anda.',
    ],
  },
  {
    id: 'task-scam',
    category: 'Rekayasa Sosial',
    title: 'Modus Lowongan Freelance Like & Subscribe Video',
    summary: 'Menawarkan komisi harian jutaan rupiah hanya dengan menyelesaikan misi menonton dan menyukai video YouTube/TikTok.',
    tactics: [
      'Memberikan imbalan kecil di awal (Rp 10.000 - Rp 50.000) untuk membangun rasa percaya.',
      'Memasukkan korban ke grup Telegram VIP dan mewajibkan deposit dana jutaan rupiah untuk "misi lanjutan".',
      'Memblokir kontak dan mengunci saldo korban saat deposit bernilai besar telah ditransfer.',
    ],
    prevention: [
      'Pekerjaan profesional resmi tidak pernah memungut biaya pendaftaran atau uang muka.',
      'Waspadai penawaran komisi fantastis yang tidak masuk akal untuk tugas sepele.',
      'Hindari ajakan berpindah ke grup Telegram tertutup dari nomor acak.',
    ],
  },
  {
    id: 'phishing-bank',
    category: 'Phishing & Domain',
    title: 'Modus Situs Tiruan Perbankan (Typosquatting)',
    summary: 'Membuat domain palsu yang sangat mirip dengan alamat internet banking bank ternama untuk mencuri user ID dan kata sandi.',
    tactics: [
      'Memanfaatkan kesalahan ketik (contoh: bca-klik.com, klik-bca-update.xyz).',
      'Menaruh nama bank di subdomain (contoh: bank-bca.update-akun-nasabah.top).',
      'Menampilkan formulir login yang identik dengan website resmi perbankan.',
    ],
    prevention: [
      'Ketik langsung alamat URL resmi bank Anda di peramban, jangan klik tautan dari pesan atau email.',
      'Periksa domain induk (apex domain) sebelum tanda slash pertama.',
      'Gunakan aplikasi mobile banking resmi daripada mengakses web login dari link tidak dikenal.',
    ],
  },
  {
    id: 'vishing-otp',
    category: 'Impersonasi',
    title: 'Modus Panggilan Mengaku Petugas Resmi (Vishing)',
    summary: 'Pelaku menelepon calon korban dengan nomor menyerupai call center untuk mengabarkan adanya transaksi mencurigakan dan meminta konfirmasi OTP.',
    tactics: [
      'Menciptakan kepanikan dengan menyatakan rekening diblokir atau ada transaksi ilegal ratusan juta.',
      'Menyebutkan identitas korban (nama, NIK, alamat) yang diperoleh dari kebocoran data untuk meyakinkan.',
      'Mendesak korban menyebutkan 6 digit angka SMS otentikasi demi "membatalkan transaksi".',
    ],
    prevention: [
      'Ingat prinsip mutlak: Pihak bank TIDAK AKAN PERNAH meminta kode OTP atau PIN Anda.',
      'Jika ragu, segera matikan telepon dan hubungi call center resmi bank yang tercantum di balik kartu debit/kredit Anda.',
      'Jangan pernah panik saat menerima intimidasi pemblokiran sepihak melalui telepon.',
    ],
  },
];

export const KnowledgePage: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article>(ARTICLES[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-16">
      
      {/* HEADER BANNER - Pomaii Deep Green Style */}
      <section className="w-full bg-[#143826] text-white py-12 border-b border-[#1D4E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#E86A33]" />
            <span>Scam Knowledge Center &bull; P1 Edukasi Publik</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Pusat Pengetahuan Modus Kejahatan Siber
          </h1>
          <p className="text-sm text-gray-200 max-w-3xl leading-relaxed">
            Kumpulan ensiklopedia taktik penipuan digital terkini yang sering beredar di Indonesia beserta cara pencegahan teknisnya.
          </p>

          <div className="max-w-md pt-2">
            <div className="relative flex items-center bg-white/10 backdrop-blur rounded-full border border-white/20 px-4 py-2.5 shadow-sm">
              <Search className="w-4 h-4 text-[#E86A33] mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari modus (contoh: APK, Lowongan, Bank)..."
                className="w-full bg-transparent text-xs text-white placeholder:text-white/60 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Article List Navigation */}
          <div className="lg:col-span-5 space-y-2.5">
            {filtered.map((art) => {
              const isSelected = selectedArticle.id === art.id;
              return (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  type="button"
                  className={`w-full p-4 rounded-2xl border text-left transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-surface-container border-secondary shadow-xs scale-[1.01]'
                      : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-secondary font-bold">
                      {art.category}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-secondary translate-x-1' : 'text-outline'}`} />
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">{art.title}</h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Article Detail View */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-6">
              
              <div className="space-y-2 border-b border-surface-container pb-4">
                <span className="px-2.5 py-1 rounded bg-secondary-fixed text-secondary font-mono text-[11px] font-bold">
                  {selectedArticle.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface">
                  {selectedArticle.title}
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {selectedArticle.summary}
                </p>
              </div>

              {/* Taktik Penipuan */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-error" />
                  <h3 className="text-sm font-bold text-on-surface font-mono uppercase">
                    Taktik &amp; Karakteristik Modus:
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedArticle.tactics.map((tac, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-error-container text-error text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        !
                      </span>
                      <span className="leading-relaxed">{tac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Langkah Mitigasi */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-on-surface font-mono uppercase">
                    Langkah Pencegahan &amp; Mitigasi:
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedArticle.prevention.map((prev, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-relaxed font-medium">{prev}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

