import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle2, ShieldCheck } from 'lucide-react';

export const PanduanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tindakan' | 'checklist'>('tindakan');

  const [checklist, setChecklist] = useState([
    { id: 'c1', text: 'Periksa alamat pengirim (bukan nomor acak atau email domain gratisan seperti @gmail.com jika mengaku instansi).', checked: false },
    { id: 'c2', text: 'Periksa ejaan nama merek/domain (waspadai typosquatting seperti bca-klik.xyz bukan klikbca.com).', checked: false },
    { id: 'c3', text: 'Jangan pernah mentransfer uang dengan alasan biaya administrasi, deposit, atau jaminan pekerjaan.', checked: false },
    { id: 'c4', text: 'Jangan pernah memberikan kode OTP, PIN, atau kata sandi kepada siapa pun, termasuk petugas resmi.', checked: false },
    { id: 'c5', text: 'Jangan menginstal file berkas biner berekstensi .APK yang dikirim melalui WhatsApp.', checked: false },
    { id: 'c6', text: 'Lakukan verifikasi silang (cross-check) melalui nomor telepon resmi atau kanal media sosial centang biru.', checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = checklist.filter((c) => c.checked).length;

  return (
    <div className="flex flex-col w-full pb-16">
      
      {/* HEADER BANNER - Pomaii Deep Green Style */}
      <section className="w-full bg-[#143826] text-white py-12 border-b border-[#1D4E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pusat Mitigasi Keamanan Digital</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Panduan Tanggap Insiden &amp; Checklist Keamanan
          </h1>
          <p className="text-sm text-gray-200 max-w-3xl leading-relaxed">
            Langkah konkret yang wajib Anda lakukan saat berhadapan dengan indikasi penipuan daring sebelum terjadi kerugian finansial atau peretasan akun.
          </p>

          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('tindakan')}
              className={`btn-animate px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'tindakan'
                  ? 'bg-[#E86A33] text-white shadow-md shadow-orange-500/20'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              Langkah Tanggap Insiden
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`btn-animate px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'checklist'
                  ? 'bg-[#E86A33] text-white shadow-md shadow-orange-500/20'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <span>Checklist Cepat</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[#EAF2ED] text-[10px] font-mono">
                {completedCount}/6
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'tindakan' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-on-surface">Jika Telah Mengklik Tautan Mencurigakan</h3>
              <ul className="space-y-2 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                <li>Segera tutup jendela peramban (browser) dan jangan masukkan kredensial login atau kata sandi apa pun.</li>
                <li>Hapus riwayat penelusuran (browsing history) dan cache cookies peramban Anda.</li>
                <li>Ganti kata sandi akun perbankan dan email utama Anda dari perangkat lain yang aman.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-on-surface">Jika Telah Terlanjur Mengunduh .APK</h3>
              <ul className="space-y-2 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                <li>Segera aktifkan <strong>Airplane Mode</strong> (Mode Pesawat) agar aplikasi malware terputus dari server komando penyerang.</li>
                <li>Masuk ke Pengaturan Ponsel &rarr; Aplikasi &rarr; Cari aplikasi mencurigakan tanpa ikon jelas &rarr; Hapus / Uninstall.</li>
                <li>Hubungi call center resmi bank Anda untuk memblokir sementara akses mobile banking atau rekening.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-surface-container text-secondary flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-on-surface">Kanal Pelaporan Resmi Pemerintah</h3>
              <ul className="space-y-2 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                <li><strong>CekRekening.id (Komdigi):</strong> Laporkan rekening bank pelaku penipuan agar segera dibekukan.</li>
                <li><strong>AduanKonten.id (Komdigi):</strong> Laporkan situs phishing atau link tautan malware untuk pemblokiran DNS.</li>
                <li><strong>PatroliSiber.id (Polri):</strong> Buat laporan kepolisian atas tindak pidana kejahatan siber finansial.</li>
              </ul>
            </div>

          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Checklist Sebelum Mengklik atau Mentransfer</h3>
                  <p className="text-xs text-on-surface-variant">Centang setiap poin untuk memastikan keamanan transaksi Anda:</p>
                </div>
                <div className="text-right font-mono text-xs font-bold text-secondary">
                  {completedCount} / {checklist.length} Aman
                </div>
              </div>

              <div className="space-y-3">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    type="button"
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      item.checked
                        ? 'bg-surface-container border-secondary/40 text-on-surface shadow-2xs'
                        : 'bg-surface-container-low/40 border-surface-container text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-secondary shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-outline shrink-0" />
                      )}
                    </div>
                    <span className={`text-xs ${item.checked ? 'font-semibold line-through text-outline' : 'font-medium'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>

              {completedCount === checklist.length && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-800 text-xs font-medium animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Hebat! Anda telah memverifikasi seluruh perimeter keamanan sebelum melakukan tindakan.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
