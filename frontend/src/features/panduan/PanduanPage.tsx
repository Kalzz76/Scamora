import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Plane, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Clock, 
  PhoneCall, 
  FileText,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Globe,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { GuidebookIllustration } from '../../components/illustrations/Illustrations2D';
import { toast } from 'sonner';

interface TutorialStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  actionPoints: string[];
  proTip: string;
  mockupType: 'airplane' | 'permissions' | 'browser' | 'bank' | 'domain' | 'report';
}

interface Tutorial {
  id: string;
  category: 'apk' | 'phishing' | 'domain' | 'lapor';
  title: string;
  subtitle: string;
  badge: string;
  severity: 'DARURAT TINGGI' | 'RISIKO TINGGI' | 'PREVENTIF' | 'TINDAK LANJUT';
  severityColor: string;
  readTime: string;
  heroImage: string;
  overview: string;
  steps: TutorialStep[];
}

export const PanduanPage: React.FC = () => {
  const [activeTutorialId, setActiveTutorialId] = useState<string>('tutorial-apk');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showChecklistView, setShowChecklistView] = useState<boolean>(false);

  const [checklist, setChecklist] = useState([
    { id: 'c1', text: 'Periksa alamat pengirim (bukan nomor acak atau email domain gratisan seperti @gmail.com jika mengaku instansi).', checked: false },
    { id: 'c2', text: 'Periksa ejaan nama merek/domain (waspadai typosquatting seperti bca-klik.xyz bukan klikbca.com).', checked: false },
    { id: 'c3', text: 'Jangan pernah mentransfer uang dengan alasan biaya administrasi, deposit, atau jaminan pekerjaan.', checked: false },
    { id: 'c4', text: 'Jangan pernah memberikan kode OTP, PIN, atau kata sandi kepada siapa pun, termasuk petugas resmi.', checked: false },
    { id: 'c5', text: 'Jangan menginstal berkas biner berekstensi .APK yang dikirim melalui WhatsApp atau media sosial.', checked: false },
    { id: 'c6', text: 'Lakukan verifikasi silang (cross-check) melalui nomor telepon resmi atau kanal media sosial centang biru.', checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleCopyPhone = (num: string, label: string) => {
    navigator.clipboard.writeText(num);
    toast.success(`Nomor ${label} (${num}) berhasil disalin!`);
  };

  const completedCount = checklist.filter((c) => c.checked).length;

  const tutorials: Tutorial[] = [
    {
      id: 'tutorial-apk',
      category: 'apk',
      title: 'Protokol Isolasi Darurat Pasca Menginstal Berkas .APK',
      subtitle: 'Tindakan cepat memutus kendali spyware pencuri SMS & OTP perbankan.',
      badge: 'Darurat APK Malware',
      severity: 'DARURAT TINGGI',
      severityColor: 'bg-red-50 text-red-700 border-red-200',
      readTime: '3 Menit Respon Cepat',
      heroImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      overview: 'Berkas .APK penipuan (surat tilang, undangan pernikahan, resi kurir, atau tagihan PLN) mengandung malware Trojan perbankan yang membaca SMS dan meneruskan OTP secara otomatis ke pelaku.',
      steps: [
        {
          stepNumber: 1,
          title: 'Putuskan Koneksi Internet Seketika (Mode Pesawat)',
          subtitle: 'Langkah detik pertama untuk memutus server kendali (C2) pelaku.',
          description: 'Malware .APK membutuhkan internet untuk mengirimkan data sensitif dan SMS OTP Anda ke server penyerang. Mematikan sinyal menghentikan komunikasi ini seketika.',
          actionPoints: [
            'Tarik panel notifikasi dari atas layar ponsel Anda.',
            'Segera ketuk ikon "Mode Pesawat" (Airplane Mode) hingga aktif.',
            'Pastikan Wi-Fi, Bluetooth, dan Data Seluler benar-benar mati.',
            'Jika ponsel terkunci atau tidak merespon, lepas kartu SIM fisik dari slot ponsel.'
          ],
          proTip: 'Jangan matikan daya ponsel jika belum sempat menyalakan Mode Pesawat, karena sebagian malware auto-start saat perangkat reboot.',
          mockupType: 'airplane'
        },
        {
          stepNumber: 2,
          title: 'Cabut Izin Aksesibilitas & Akses Notifikasi SMS',
          subtitle: 'Melumpuhkan kemampuan aplikasi malware membaca layar dan kode rahasia.',
          description: 'Malware biasanya meminta izin "Accessibility Service" dan "BACA NOTIFIKASI/SMS" agar bisa mencuri OTP secara diam-diam di latar belakang.',
          actionPoints: [
            'Buka menu Pengaturan (Settings) → Aksesibilitas (Accessibility).',
            'Cari nama aplikasi mencurigakan (misal: "Layanan Update", "Kurir", "Surat Undangan").',
            'Matikan saklar izin aksesibilitas untuk aplikasi tersebut.',
            'Buka Pengaturan → Aplikasi → Akses Khusus → Akses Notifikasi, lalu matikan izin aplikasi tersebut.'
          ],
          proTip: 'Jika tombol izin tidak bisa ditekan, aplikasi memanfaatkan proteksi Device Admin. Masuk ke Pengaturan Keamanan → Device Administrators untuk menonaktifkannya terlebih dahulu.',
          mockupType: 'permissions'
        },
        {
          stepNumber: 3,
          title: 'Copot Pemasangan (Uninstall) Melalui Safe Mode',
          subtitle: 'Menghapus tuntas berkas berbahaya tanpa perlawanan dari malware.',
          description: 'Pada kondisi normal, malware sering kali menutup paksa menu saat Anda mencoba meng-uninstall-nya. Menjalankan ponsel di Safe Mode mencegah aplikasi pihak ketiga berjalan otomatis.',
          actionPoints: [
            'Nyalakan Safe Mode: Tekan dan tahan tombol Power → ketuk tahan tombol "Matikan Daya" → pilih OK Mulai Ulang ke Safe Mode.',
            'Setelah ponsel menyala dengan tulisan "Safe Mode" di pojok bawah, buka Pengaturan → Aplikasi.',
            'Cari aplikasi .APK penipuan (biasanya ikon default Android atau polos).',
            'Ketuk "Copot Pemasangan" (Uninstall) dan konfirmasi penghapusan.'
          ],
          proTip: 'Periksa folder "Download" pada File Manager dan hapus berkas mentah .apk yang telah Anda unduh agar tidak terklik kembali di kemudian hari.',
          mockupType: 'permissions'
        },
        {
          stepNumber: 4,
          title: 'Hubungi Call Center Bank Resmi & Bekukan Sementara Rekening',
          subtitle: 'Langkah pengamanan aset finansial melalui saluran resmi perbankan.',
          description: 'Gunakan ponsel terpisah milik kerabat yang bersih untuk menghubungi call center perbankan resmi Anda dan laporkan potensi kebocoran kredensial m-banking.',
          actionPoints: [
            'Gunakan telepon terpisah, hubungi call center bank resmi Anda (Halo BCA 1500888, Mandiri 14000, BRI 1500017, BNI 1500046).',
            'Minta petugas customer service untuk memblokir sementara rekening dan akses mobile banking/debit Anda.',
            'Ganti kata sandi email utama, akun marketplace, dan akun penting lainnya dari komputer yang aman.'
          ],
          proTip: 'Jangan mencari nomor call center bank dari Google Ads/sponsor! Gunakan nomor di balik kartu ATM fisik Anda.',
          mockupType: 'bank'
        }
      ]
    },
    {
      id: 'tutorial-phishing',
      category: 'phishing',
      title: 'Penyelamatan Cepat Terlanjur Mengklik Tautan Phishing',
      subtitle: 'Langkah tangkal kebocoran data formulir dan pembajakan sesi peramban.',
      badge: 'Darurat Tautan Phishing',
      severity: 'RISIKO TINGGI',
      severityColor: 'bg-amber-50 text-amber-800 border-amber-200',
      readTime: '2 Menit Respon Cepat',
      heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      overview: 'Jika Anda memasukkan nomor kartu, PIN, kata sandi, atau kode OTP ke situs tiruan, data tersebut langsung tersimpan di server pelaku.',
      steps: [
        {
          stepNumber: 1,
          title: 'Tutup Segera Tab Peramban & Bersihkan Riwayat/Cookie',
          subtitle: 'Mencegah script berbahaya mengeksploitasi session token.',
          description: 'Tutup tab situs palsu dan bersihkan data situs peramban agar cookie otentikasi sesi Anda tidak tersimpan di memori cache.',
          actionPoints: [
            'Tutup jendela tab peramban (Chrome, Safari, atau Firefox).',
            'Buka Pengaturan Browser → Privasi & Keamanan → Hapus Data Penjelajahan.',
            'Pilih rentang waktu 1 jam terakhir, centang Cookie dan File Gambar Cache, lalu hapus.'
          ],
          proTip: 'Jangan memuat ulang (refresh) halaman phishing karena formulir dapat terkirim ganda ke database pelaku.',
          mockupType: 'browser'
        },
        {
          stepNumber: 2,
          title: 'Ubah Kata Sandi Akun Utama & Aktifkan 2FA Berbasis Aplikasi',
          subtitle: 'Ganti kredensial segera sebelum pelaku mencoba login.',
          description: 'Segera akses situs asli institusi tersebut dan lakukan penggantian kata sandi menyeluruh, lalu pilih "Keluarkan dari semua perangkat lain" (Log out everywhere).',
          actionPoints: [
            'Masuk ke portal web resmi (ketik manual alamat URL, jangan dari tautan obrolan).',
            'Ubah kata sandi akun dengan kombinasi acak minimal 12 karakter.',
            'Pilih opsi "Keluar dari semua perangkat lain" pada pengaturan keamanan akun.',
            'Aktifkan otentikasi dua faktor (2FA) menggunakan Google Authenticator daripada SMS.'
          ],
          proTip: 'Jika kata sandi akun tersebut juga Anda pakai di akun email atau media sosial lain, segera ganti semuanya!',
          mockupType: 'domain'
        }
      ]
    },
    {
      id: 'tutorial-domain',
      category: 'domain',
      title: 'Panduan Membedah Anatomi Domain Bank & Institusi Resmi',
      subtitle: 'Teknik membaca subdomain vs domain induk untuk menghindari jebakan typosquatting.',
      badge: 'Langkah Preventif',
      severity: 'PREVENTIF',
      severityColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      readTime: '3 Menit Literasi',
      heroImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      overview: 'Banyak korban terkecoh karena melihat nama bank di dalam alamat URL, padahal nama tersebut hanya ditempatkan di subdomain buatan pelaku.',
      steps: [
        {
          stepNumber: 1,
          title: 'Kenali Posisi Domain Induk Sebelum Garis Miring Pertama',
          subtitle: 'Domain resmi selalu berada tepat di sebelah kiri ekstensi TLD (.com, .co.id, .go.id).',
          description: 'Pelaku sering membuat URL seperti "bca.promo-hadiah-2026.xyz". Kata "bca" di depan hanyalah subdomain yang bisa dibuat gratis oleh pemilik domain utama "promo-hadiah-2026.xyz".',
          actionPoints: [
            'Cari tanda titik terakhir sebelum garis miring tunggal pertama (`/`).',
            'Dua kata sebelum garis miring adalah domain induk pemilik situs sebenarnya.',
            'Periksa ekstensi domain: Bank di Indonesia menggunakan .co.id atau .com terdaftar.',
            'Waspadai domain gratisan atau TLD murah seperti .xyz, .top, .live, .club.'
          ],
          proTip: 'Situs resmi instansi pemerintah Republik Indonesia SELALU berakhiran domain .go.id (misal: kominfo.go.id, polri.go.id).',
          mockupType: 'domain'
        }
      ]
    },
    {
      id: 'tutorial-lapor',
      category: 'lapor',
      title: 'Prosedur Penerbitan Aduan Resmi Siber ke Kominfo & Kepolisian',
      subtitle: 'Langkah hukum resmi agar nomor rekening penipu dibekukan dan situs diblokir nasional.',
      badge: 'Tindak Lanjut & Lapor',
      severity: 'TINDAK LANJUT',
      severityColor: 'bg-blue-50 text-blue-800 border-blue-200',
      readTime: '4 Menit Panduan',
      heroImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
      overview: 'Jangan biarkan pelaku melanjutkan operasinya. Laporkan bukti tangkapan layar, nomor rekening penerima dana, dan URL jebakan ke kanal resmi negara.',
      steps: [
        {
          stepNumber: 1,
          title: 'Kumpulkan Seluruh Berkas Bukti Digital (Forensik Dasar)',
          subtitle: 'Amankan bukti sebelum pelaku menghapus pesan (unsend) di aplikasi obrolan.',
          description: 'Simpan tangkapan layar bukti percakapan lengkap dengan nomor telepon pengirim, bukti transfer perbankan, dan tautan asli yang dikirim.',
          actionPoints: [
            'Screenshot riwayat chat WhatsApp lengkap dengan nama & nomor telepon pelaku yang terlihat jelas.',
            'Unduh bukti transfer mutasi bank (PDF atau gambar yang memuat nomor referensi transaksi).',
            'Salin nomor rekening dan nama bank penerima dana milik pelaku.',
            'Ekspor riwayat percakapan WhatsApp ke format .txt bila memungkinkan.'
          ],
          proTip: 'Jangan membalas dengan ancaman kepada pelaku karena mereka dapat segera menguras saldo rekening penampung.',
          mockupType: 'report'
        },
        {
          stepNumber: 2,
          title: 'Laporkan Rekening Penipu ke CekRekening.id (Kominfo)',
          subtitle: 'Langkah pemblokiran rekening bank penampung oleh asosiasi perbankan.',
          description: 'CekRekening.id adalah database resmi Kementerian Komunikasi dan Digital untuk memverifikasi dan membekukan rekening terindikasi penipuan.',
          actionPoints: [
            'Buka portal resmi www.cekrekening.id.',
            'Pilih menu "Laporkan Rekening" di bagian navigasi.',
            'Masukkan nama bank, nomor rekening, dan nama pemilik rekening pelaku.',
            'Unggah bukti transfer dan screenshot obrolan sebagai lampiran sah.'
          ],
          proTip: 'Semakin banyak laporan terverifikasi pada rekening yang sama, semakin cepat pihak bank membekukan saldo di dalamnya.',
          mockupType: 'report'
        }
      ]
    }
  ];

  const currentTutorial = tutorials.find((t) => t.id === activeTutorialId) || tutorials[0];
  const activeStep = currentTutorial.steps[activeStepIndex] || currentTutorial.steps[0];

  const renderStepMockup = (mockupType: TutorialStep['mockupType']) => {
    switch (mockupType) {
      case 'airplane':
        return (
          <div className="w-full bg-[#0F172A] text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Pusat Kontrol Perangkat</span>
              <span className="text-[10px] text-slate-400">10:42 WIB</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-orange-600 text-white font-bold flex flex-col items-center justify-center gap-1 border border-orange-400 shadow-xs">
                <Plane className="w-5 h-5 animate-pulse" />
                <span className="text-[11px]">Mode Pesawat: AKTIF</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 text-slate-300 flex flex-col items-center justify-center gap-1 border border-white/10 opacity-60">
                <span className="text-[10px]">Wi-Fi &amp; Data: MATI</span>
                <span className="text-[9px] text-teal-300">Sinyal Terputus</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-300 font-sans leading-tight">
              &bull; Sinyal data seluler dan Wi-Fi terputus total. Trojan tidak dapat mengirimkan SMS OTP Anda ke server penyerang.
            </p>
          </div>
        );

      case 'permissions':
        return (
          <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 font-sans text-xs">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Pengaturan → Aksesibilitas
            </div>
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-red-950">Aplikasi Mencurigakan (.APK)</div>
                <div className="text-[10px] text-red-600 font-mono">Izin Layanan Aksesibilitas</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px]">
                MATIKAN
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Akses Notifikasi SMS</div>
                <div className="text-[10px] text-slate-500 font-mono">Pembacaan OTP Otomatis</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px]">
                NONAKTIFKAN
              </span>
            </div>
          </div>
        );

      case 'browser':
      case 'domain':
        return (
          <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 font-mono text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Perbandingan Struktur URL
            </div>
            <div className="space-y-1.5">
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-700 font-bold font-mono text-[11px]">PALSU:</span>
                <span className="text-slate-800 break-all text-[11px]">
                  https://bca.<strong className="text-red-600 bg-red-100 px-1 rounded">klik-bca-promo.xyz</strong>/login
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                <span className="text-emerald-700 font-bold font-mono text-[11px]">RESMI:</span>
                <span className="text-slate-800 break-all text-[11px]">
                  https://<strong className="text-emerald-700 bg-emerald-100 px-1 rounded">ibank.klikbca.com</strong>/
                </span>
              </div>
            </div>
          </div>
        );

      case 'bank':
      case 'report':
        return (
          <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 font-sans">
            <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] border-b border-slate-100 pb-2">
              <span>Saluran Kontak Bantuan 24/7 Siaga</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-mono border border-teal-200">RESMI</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">Halo BCA</div>
                <div className="text-teal-700 font-mono font-bold">1500888</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">Mandiri Call</div>
                <div className="text-teal-700 font-mono font-bold">14000</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">Contact BRI</div>
                <div className="text-teal-700 font-mono font-bold">1500017</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">BNI Call</div>
                <div className="text-teal-700 font-mono font-bold">1500046</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-transparent text-[#0F172A] relative overflow-hidden">
      
      {/* Background Soft Aura */}
      <div 
        className="absolute top-0 right-1/3 w-[650px] h-[550px] pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(13, 148, 136, 0.12) 0%, rgba(241, 245, 249, 0) 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full relative z-10 space-y-8">
        
        {/* 1. TOP EDITORIAL HERO HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-slate-200/80 pb-8">
          
          <div className="lg:col-span-8 space-y-4 text-left">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
              Panduan Tanggap Darurat <br />
              <span className="text-[#0D9488]">&amp; Alur Aliran Penyelamatan Siber.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-medium">
              Ikuti alur tahapan horizontal di bawah ini untuk mengambil tindakan penyelamatan terstruktur sebelum pelaku sempat mengeksploitasi data atau membobol rekening Anda.
            </p>

            {/* Protocol Switcher Segmented Control */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-slate-500 uppercase block">
                Pilih Protokol Penanganan:
              </span>
              <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-full overflow-x-auto gap-1 scrollbar-none">
                {tutorials.map((tut) => {
                  const isActive = activeTutorialId === tut.id && !showChecklistView;
                  return (
                    <button
                      key={tut.id}
                      onClick={() => {
                        setActiveTutorialId(tut.id);
                        setActiveStepIndex(0);
                        setShowChecklistView(false);
                      }}
                      className={`whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {tut.id === 'tutorial-apk' && <Smartphone className="w-3.5 h-3.5 shrink-0" />}
                      {tut.id === 'tutorial-phishing' && <Globe className="w-3.5 h-3.5 shrink-0" />}
                      {tut.id === 'tutorial-domain' && <ShieldCheck className="w-3.5 h-3.5 shrink-0" />}
                      {tut.id === 'tutorial-lapor' && <PhoneCall className="w-3.5 h-3.5 shrink-0" />}
                      <span>{tut.badge}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowChecklistView(true)}
                  className={`whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    showChecklistView
                      ? 'bg-[#0D9488] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Checklist Perimeter</span>
                </button>
              </div>
            </div>

          </div>

          {/* 2D Cartoon Visual */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="p-4 rounded-3xl bg-gradient-to-b from-teal-50/60 to-white border border-slate-200/80 flex items-center justify-center shadow-xs">
              <GuidebookIllustration className="w-44 h-32 sm:w-64 sm:h-48" />
            </div>
          </div>

        </div>

        {/* 2. MAIN LAYOUT: HORIZONTAL CONNECTED PATHWAY FLOW */}
        {!showChecklistView ? (
          <div className="space-y-8">
            
            {/* Active Protocol Banner Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${currentTutorial.severityColor}`}>
                  {currentTutorial.severity}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentTutorial.readTime}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-snug">
                {currentTutorial.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {currentTutorial.overview}
              </p>
            </div>

            {/* HORIZONTAL CONNECTED PIPELINE (ALUR JALUR KE SAMPING DENGAN PENGHUBUNG) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1 font-mono">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                  <span>JALUR ALIRAN TAHAPAN PENYELAMATAN (KLIK TAHAP):</span>
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  Langkah {activeStepIndex + 1} dari {currentTutorial.steps.length}
                </span>
              </div>

              {/* Connected Track Grid */}
              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory gap-3 sm:gap-3.5 pb-2 sm:pb-0 scrollbar-none relative">
                {currentTutorial.steps.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  const isPassed = idx < activeStepIndex;

                  return (
                    <button
                      key={step.stepNumber}
                      onClick={() => setActiveStepIndex(idx)}
                      type="button"
                      className={`shrink-0 w-[230px] sm:w-auto snap-start p-3.5 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-2.5 sm:space-y-3 cursor-pointer ${
                        isActive
                          ? 'bg-white border-[#0D9488] shadow-md ring-2 ring-[#0D9488]/20 -translate-y-1'
                          : isPassed
                          ? 'bg-slate-50/90 border-slate-200 text-slate-700 hover:bg-white'
                          : 'bg-white/70 border-slate-200 text-slate-500 hover:bg-white'
                      }`}
                    >
                      {/* Top Header of Node */}
                      <div className="flex items-center justify-between">
                        <span className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center transition shadow-2xs ${
                          isActive
                            ? 'bg-[#0D9488] text-white shadow-teal-500/20'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          0{step.stepNumber}
                        </span>

                        {/* Connector Chevron (Arrow to next) */}
                        {idx < currentTutorial.steps.length - 1 && (
                          <div className="hidden lg:flex items-center text-slate-300">
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-1 min-h-[50px]">
                        <h4 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-tight ${
                          isActive ? 'text-[#0F172A]' : 'text-slate-800'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight">
                          {step.subtitle}
                        </p>
                      </div>

                      {/* Bottom Status Tag */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                        <span className={`font-bold ${isActive ? 'text-[#0D9488]' : isPassed ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isActive ? '● Sedang Aktif' : isPassed ? '✓ Selesai' : 'Tahap ' + step.stepNumber}
                        </span>
                        <span className="text-slate-400 font-normal">
                          Detik ke-0{step.stepNumber}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FOCUSED ACTIVE STAGE STUDIO (DETAIL TAHAP TERPILIH) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
              
              {/* Studio Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold font-mono">
                    <span>TAHAP KE-0{activeStep.stepNumber} DARI 0{currentTutorial.steps.length}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-snug">
                    {activeStep.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E86A33] font-bold">
                    {activeStep.subtitle}
                  </p>
                </div>

                {/* Quick Prev / Next Switchers in Header */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activeStepIndex === 0}
                    type="button"
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                      activeStepIndex === 0
                        ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer shadow-2xs'
                    }`}
                    title="Langkah Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  <button
                    onClick={() => setActiveStepIndex((prev) => Math.min(currentTutorial.steps.length - 1, prev + 1))}
                    disabled={activeStepIndex === currentTutorial.steps.length - 1}
                    type="button"
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      activeStepIndex === currentTutorial.steps.length - 1
                        ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer shadow-xs'
                    }`}
                    title="Langkah Selanjutnya"
                  >
                    <span className="hidden sm:inline">Langkah Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2-Column Workstation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left (7 cols): Explanation & Action Points */}
                <div className="lg:col-span-7 space-y-5">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {activeStep.description}
                  </p>

                  {/* Concrete Action Points Checklist */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="text-xs font-bold text-slate-900 font-mono tracking-wider uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                      <span>Daftar Tindakan Konkret yang Wajib Dilakukan:</span>
                    </div>
                    <ul className="space-y-2.5">
                      {activeStep.actionPoints.map((action, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-1.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pro-Tip Box */}
                  <div className="p-4 rounded-2xl bg-orange-50/70 border-l-4 border-[#E86A33] text-xs space-y-1">
                    <div className="font-bold text-[#B44616] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#E86A33]" />
                      <span>Instruksi Kritis Penyelamatan:</span>
                    </div>
                    <p className="text-[#B44616] leading-relaxed">
                      {activeStep.proTip}
                    </p>
                  </div>
                </div>

                {/* Right (5 cols): Embedded Step Mockup & Direct Hotline */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Simulasi Visual Langkah Ini:
                  </div>

                  {/* Render Mockup */}
                  {renderStepMockup(activeStep.mockupType)}

                  {/* Quick Copy Call Center Strip */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>Hotline Call Center Bank Resmi:</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">24/7 SIAGA</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { name: 'Halo BCA', phone: '1500888' },
                        { name: 'Mandiri Call', phone: '14000' },
                        { name: 'Contact BRI', phone: '1500017' },
                        { name: 'BNI Call', phone: '1500046' },
                      ].map((bank) => (
                        <button
                          key={bank.name}
                          type="button"
                          onClick={() => handleCopyPhone(bank.phone, bank.name)}
                          className="p-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <span className="font-bold text-slate-800 text-[11px]">{bank.name}</span>
                          <span className="font-mono font-bold text-[#0D9488] text-[11px]">{bank.phone}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Step Flow Navigation */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold border transition flex items-center justify-center gap-2 ${
                    activeStepIndex === 0
                      ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 cursor-pointer shadow-2xs'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Langkah Sebelumnya</span>
                </button>

                <button
                  type="button"
                  disabled={activeStepIndex === currentTutorial.steps.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(currentTutorial.steps.length - 1, prev + 1))}
                  className={`btn-animate w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeStepIndex === currentTutorial.steps.length - 1
                      ? 'opacity-30 cursor-not-allowed bg-slate-200 text-slate-400'
                      : 'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-xs cursor-pointer'
                  }`}
                >
                  <span>Langkah Selanjutnya (0{activeStepIndex + 2})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* OFFICIAL CHANNELS ROW (KOMINFO & POLISI) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <a
                href="https://cekrekening.id"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-200/90 shadow-2xs flex items-center justify-between transition group"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">KOMINFO</span>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">CekRekening.id</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Blokir rekening bank penampung</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition" />
              </a>

              <a
                href="https://aduankonten.id"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-200/90 shadow-2xs flex items-center justify-between transition group"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">KOMINFO</span>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">AduanKonten.id</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Blokir domain phishing &amp; APK</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition" />
              </a>

              <a
                href="https://patrolisiber.id"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-200/90 shadow-2xs flex items-center justify-between transition group"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">BARESKRIM POLRI</span>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">PatroliSiber.id</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Laporan kepolisian penipuan digital</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition" />
              </a>
            </div>

          </div>
        ) : (
          /* CHECKLIST VIEW (WHEN TOGGLED) */
          <div className="max-w-3xl mx-auto space-y-6 text-left">
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#E86A33]" />
                    <span className="font-mono text-xs font-bold uppercase text-slate-800">
                      Pemeriksaan Mandiri 6 Titik
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    Checklist Perimeter Sebelum Mengirim Uang / Data
                  </h3>
                </div>

                <div className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 font-mono text-xs font-bold shrink-0 self-start sm:self-auto border border-teal-200">
                  {completedCount} / {checklist.length} Aman
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0D9488] to-[#E86A33] transition-all duration-300"
                  style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-3 pt-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    type="button"
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      item.checked
                        ? 'bg-teal-50/60 border-teal-300 text-teal-900 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.checked ? (
                        <CheckSquare className="w-5 h-5 text-[#0D9488] shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm leading-relaxed ${item.checked ? 'font-semibold line-through text-slate-400' : 'font-medium'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>

              {completedCount === checklist.length && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5 text-emerald-800 text-xs sm:text-sm font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Hebat! Anda telah memverifikasi seluruh perimeter keselamatan digital.</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowChecklistView(false)}
                  type="button"
                  className="px-6 py-2.5 rounded-full bg-[#0F172A] text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer"
                >
                  Kembali ke Alur Jalur Protokol &rarr;
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
