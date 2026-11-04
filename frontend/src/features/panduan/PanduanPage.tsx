import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Lock, 
  Plane, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  ShieldCheck,
  Clock
} from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'apk' | 'phishing' | 'domain' | 'lapor' | 'checklist'>('all');
  const [activeTutorialId, setActiveTutorialId] = useState<string>('tutorial-apk');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const [checklist, setChecklist] = useState([
    { id: 'c1', text: 'Periksa alamat pengirim (bukan nomor acak atau email domain gratisan seperti @gmail.com jika mengaku instansi).', checked: false },
    { id: 'c2', text: 'Periksa ejaan nama merek/domain (waspadai typosquatting seperti bca-klik.xyz bukan klikbca.com).', checked: false },
    { id: 'c3', text: 'Jangan pernah mentransfer uang dengan alasan biaya administrasi, deposit, atau jaminan pekerjaan.', checked: false },
    { id: 'c4', text: 'Jangan pernah memberikan kode OTP, PIN, atau kata sandi kepada siapa pun, termasuk petugas resmi.', checked: false },
    { id: 'c5', text: 'Jangan menginstal file berkas biner berekstensi .APK yang dikirim melalui WhatsApp atau media sosial.', checked: false },
    { id: 'c6', text: 'Lakukan verifikasi silang (cross-check) melalui nomor telepon resmi atau kanal media sosial centang biru.', checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = checklist.filter((c) => c.checked).length;

  const tutorials: Tutorial[] = [
    {
      id: 'tutorial-apk',
      category: 'apk',
      title: 'Protokol Isolasi Darurat Pasca Menginstal Berkas .APK',
      subtitle: 'Tindakan cepat memutus kendali spyware pencuri SMS & OTP perbankan.',
      badge: 'DARURAT MALWARE',
      severity: 'DARURAT TINGGI',
      severityColor: 'bg-red-500/10 text-red-700 border-red-500/20',
      readTime: '3 Menit Praktik',
      heroImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      overview: 'Berkas .APK penipuan (berkedok surat tilang, undangan pernikahan, resi kurir, atau tagihan PLN) biasanya mengandung malware Trojan perbankan yang membaca SMS dan meneruskan OTP secara otomatis ke pelaku.',
      steps: [
        {
          stepNumber: 1,
          title: 'Putuskan Koneksi Internet Seketika (Mode Pesawat)',
          subtitle: 'Langkah detik pertama untuk memutus Command & Control (C2) server pelaku.',
          description: 'Malware .APK membutuhkan koneksi internet (data seluler atau Wi-Fi) untuk mengirimkan data sensitif dan SMS OTP Anda ke server penyerang. Mematikan sinyal menghentikan komunikasi ini seketika.',
          actionPoints: [
            'Tarik panel notifikasi dari atas layar ponsel Anda.',
            'Segera ketuk ikon "Mode Pesawat" (Airplane Mode) hingga aktif.',
            'Pastikan Wi-Fi, Bluetooth, dan Data Seluler benar-benar mati.',
            'Jika ponsel terkunci atau tidak merespon, lepas kartu SIM fisik dari slot ponsel.'
          ],
          proTip: 'Jangan mematikan daya ponsel jika belum sempat menyalakan Mode Pesawat, karena beberapa malware auto-start saat reboot.',
          mockupType: 'airplane'
        },
        {
          stepNumber: 2,
          title: 'Cabut Izin Aksesibilitas & Akses SMS',
          subtitle: 'Melumpuhkan kemampuan aplikasi malware membaca layar dan kode OTP.',
          description: 'Malware biasanya meminta izin "Accessibility Service" dan "BACA NOTIFIKASI/SMS" agar bisa mencuri OTP secara diam-diam di latar belakang.',
          actionPoints: [
            'Buka menu Pengaturan (Settings) &rarr; Aksesibilitas (Accessibility).',
            'Cari nama aplikasi mencurigakan atau nama generik (misal: "Layanan Update", "Kurir", "Surat Undangan").',
            'Matikan saklar izin aksesibilitas untuk aplikasi tersebut.',
            'Buka Pengaturan &rarr; Aplikasi &rarr; Akses Khusus &rarr; Akses Notifikasi, lalu matikan izin aplikasi tersebut.'
          ],
          proTip: 'Jika tombol izin tidak bisa ditekan, aplikasi menggunakan proteksi Device Admin. Masuk ke Pengaturan Keamanan &rarr; Device Administrators untuk menonaktifkannya terlebih dahulu.',
          mockupType: 'permissions'
        },
        {
          stepNumber: 3,
          title: 'Copot Pemasangan (Uninstall) di Mode Aman (Safe Mode)',
          subtitle: 'Menghapus tuntas berkas berbahaya tanpa perlawanan dari malware.',
          description: 'Pada kondisi normal, malware sering kali menutup paksa menu saat Anda mencoba meng-uninstall-nya. Menjalankan ponsel di Safe Mode mencegah aplikasi pihak ketiga berjalan otomatis.',
          actionPoints: [
            'Nyalakan Safe Mode: Tekan dan tahan tombol Power &rarr; ketuk dan tahan tombol "Matikan Daya" (Power Off) hingga muncul dialog "Mulai Ulang ke Safe Mode" &rarr; pilih OK.',
            'Setelah ponsel menyala dengan tulisan "Safe Mode" di pojok bawah, buka Pengaturan &rarr; Aplikasi.',
            'Cari aplikasi .APK penipuan (biasanya ikon kosong putih atau ikon default Android).',
            'Ketuk "Copot Pemasangan" (Uninstall) dan konfirmasi penghapusan.'
          ],
          proTip: 'Periksa folder "Download" pada File Manager dan hapus berkas mentah berekstensi .apk yang telah Anda unduh agar tidak terklik kembali di kemudian hari.',
          mockupType: 'permissions'
        },
        {
          stepNumber: 4,
          title: 'Hubungi Call Center Bank Resmi & Blokir Sementara Rekening',
          subtitle: 'Langkah pengamanan aset finansial melalui saluran resmi perbankan.',
          description: 'Gunakan ponsel atau perangkat lain milik kerabat yang bersih untuk menghubungi call center resmi perbankan Anda dan laporkan potensi kebocoran kredensial m-banking.',
          actionPoints: [
            'Gunakan telepon terpisah, hubungi call center resmi bank Anda (misal: Halo BCA 1500888, Mandiri 14000, BRI 1500017, BNI 1500046).',
            'Minta petugas customer service untuk memblokir sementara rekening dan akses mobile banking/debit Anda.',
            'Ganti kata sandi email utama, akun marketplace, dan akun penting lainnya dari komputer yang aman.'
          ],
          proTip: 'Jangan pernah mencari nomor call center bank dari pencarian Google sponsor atau tautan yang dikirim di WhatsApp! Gunakan nomor di balik kartu ATM fisik Anda.',
          mockupType: 'bank'
        }
      ]
    },
    {
      id: 'tutorial-phishing',
      category: 'phishing',
      title: 'Penyelamatan Cepat Terlanjur Mengklik Tautan Phishing',
      subtitle: 'Langkah tangkal kebocoran data formulir dan pembajakan sesi peramban.',
      badge: 'URL PHISHING',
      severity: 'RISIKO TINGGI',
      severityColor: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
      readTime: '2 Menit Praktik',
      heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      overview: 'Situs web phishing meniru tampilan portal resmi seperti login perbankan, Google, atau pengumuman promo e-commerce palsu untuk mencuri username, password, nomor kartu kredit, dan CVV Anda.',
      steps: [
        {
          stepNumber: 1,
          title: 'Tutup Tab Seketika & Jangan Pernah Kirimkan Formulir',
          subtitle: 'Data Anda baru benar-benar terkirim ke penipu saat tombol "Submit/Login" ditekan.',
          description: 'Jika Anda baru sebatas membuka tautan atau mengisi sebagian teks tanpa menekan tombol "Lanjut/Submit", segera tutup tab peramban. Mayoritas situs penipuan tidak mencuri data sebelum formulir disubmit.',
          actionPoints: [
            'Segera tutup jendela atau tab browser Anda.',
            'Jangan klik tombol apa pun di dalam halaman palsu tersebut.',
            'Jangan izinkan izin pop-up seperti "Izinkan Notifikasi" atau "Akses Lokasi".'
          ],
          proTip: 'Jika formulir terlanjur diisi dan diklik, asumsikan kredensial tersebut sudah jatuh ke tangan penipu dan segera lakukan reset kata sandi pada langkah berikutnya.',
          mockupType: 'browser'
        },
        {
          stepNumber: 2,
          title: 'Bersihkan Riwayat, Cache, dan Cookie Peramban',
          subtitle: 'Mencegah script pelacak (tracker) dan session cookie palsu bertahan di perangkat.',
          description: 'Situs phishing terkadang menyimpan cookie berbahaya atau script cache di peramban Anda untuk mengarahkan Anda kembali ke situs palsu di kemudian hari.',
          actionPoints: [
            'Buka menu setelan pada browser Anda (Chrome/Safari).',
            'Pilih menu "Hapus Data Penjelajahan" (Clear Browsing Data).',
            'Centang "Cookie dan data situs" serta "Gambar dan file dalam cache".',
            'Pilih rentang waktu "Sepanjang waktu" (All time), lalu ketuk "Hapus Data".'
          ],
          proTip: 'Di Google Chrome, Anda juga dapat mereset izin situs di Settings &rarr; Site Settings &rarr; All Sites &rarr; cari nama domain palsu &rarr; Clear & Reset.',
          mockupType: 'browser'
        },
        {
          stepNumber: 3,
          title: 'Ganti Kata Sandi & Logout dari Semua Perangkat Aktif',
          subtitle: 'Memutus akses pelaku yang mungkin sempat mengantongi kata sandi lama Anda.',
          description: 'Segera kunjungi situs resmi akun yang terindikasi (misal akun Google, media sosial, atau perbankan) dan lakukan pembaruan kata sandi.',
          actionPoints: [
            'Masuk ke portal resmi dari browser bersih atau aplikasi resmi.',
            'Ganti kata sandi dengan kombinasi unik (minimal 12 karakter: huruf besar, kecil, angka, simbol).',
            'Pilih opsi "Keluar dari semua perangkat lain" (Log out of all other sessions).',
            'Aktifkan Autentikasi Dua Faktor (2FA) menggunakan aplikasi Authenticator, bukan SMS jika tersedia.'
          ],
          proTip: 'Hindari memakai kata sandi yang sama di akun lain. Gunakan password manager tepercaya jika kesulitan mengingat sandi yang kuat.',
          mockupType: 'browser'
        }
      ]
    },
    {
      id: 'tutorial-domain',
      category: 'domain',
      title: 'Cara Menyelidiki & Membedakan Domain Asli vs Domain Tiruan',
      subtitle: 'Teknik mengenali typosquatting, subdomain palsu, dan manipulasi protokol URL.',
      badge: 'VERIFIKASI URL',
      severity: 'PREVENTIF',
      severityColor: 'bg-blue-500/10 text-blue-800 border-blue-500/20',
      readTime: '3 Menit Baca',
      heroImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      overview: 'Penipu sering mendaftarkan domain yang sangat mirip dengan instansi terkemuka untuk mengelabui korban yang terburu-buru atau membaca sepintas di layar ponsel.',
      steps: [
        {
          stepNumber: 1,
          title: 'Periksa Nama Domain Utama Sebelum Garis Miring Pertama',
          subtitle: 'Aturan emas membaca anatomi struktur URL internet.',
          description: 'Banyak orang terkecoh oleh teks awal URL. Ingat: nama situs yang sesungguhnya ditentukan oleh nama domain tepat sebelum garis miring pertama (`/`), bukan teks di depannya!',
          actionPoints: [
            'Contoh Palsu: `https://klikbca.com.layanan-keuangan.xyz/login` &rarr; Domain aslinya adalah `layanan-keuangan.xyz`, bukan BCA!',
            'Contoh Palsu: `https://bca-official-promo.top` &rarr; Domain aslinya adalah `.top`, bukan domain resmi perbankan.',
            'Contoh Asli: `https://ibank.klikbca.com/` &rarr; Domain intinya adalah `klikbca.com` yang sah.'
          ],
          proTip: 'Perhatikan domain tingkat atas (TLD). Bank dan instansi pemerintah Indonesia menggunakan akhiran resmi seperti `.co.id`, `.id`, atau `.go.id`, bukan `.xyz`, `.top`, `.tk`, atau `.online`.',
          mockupType: 'domain'
        },
        {
          stepNumber: 2,
          title: 'Waspadai Simbol Gembok HTTPS yang Menyesatkan',
          subtitle: 'Gembok hijau/HTTPS hanya berarti koneksi terenkripsi, BUKAN berarti situsnya jujur.',
          description: 'Banyak orang mengira tanda gembok berarti situs tersebut 100% aman dan bukan penipuan. Penipu masa kini juga memasang sertifikat SSL gratis (seperti Let\'s Encrypt) pada domain palsu mereka.',
          actionPoints: [
            'HTTPS hanya menjamin data yang Anda kirim tidak bisa diintip di jaringan Wi-Fi.',
            'Jika Anda mengirim password ke situs penipu yang ber-HTTPS, data tersebut terenkripsi langsung ke server si penipu!',
            'Selalu verifikasi nama domainnya terlebih dahulu, jangan hanya percaya pada ikon gembok.'
          ],
          proTip: 'Gunakan modul Cek Tautan (URL Checker) di Scamora AI untuk memindai reputasi heuristik dan usia registrasi domain secara otomatis.',
          mockupType: 'domain'
        }
      ]
    },
    {
      id: 'tutorial-lapor',
      category: 'lapor',
      title: 'Panduan Pelaporan Resmi ke Komdigi & Kepolisian Siber',
      subtitle: 'Membekukan rekening bank penipu dan memblokir domain malware secara nasional.',
      badge: 'LAPOR RESMI',
      severity: 'TINDAK LANJUT',
      severityColor: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
      readTime: '4 Menit Baca',
      heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      overview: 'Setelah mengamankan akun dan perangkat pribadi, laporkan data pelaku ke kanal resmi pemerintah agar nomor rekening dibekukan dan situs penipuan diblokir secara nasional.',
      steps: [
        {
          stepNumber: 1,
          title: 'Kumpulkan Bukti Digital yang Sah & Utuh',
          subtitle: 'Menyiapkan arsip digital sebelum pelaku menghapus pesan percakapan.',
          description: 'Sebelum memblokir nomor penipu di WhatsApp, amankan semua bukti transaksi dan komunikasi untuk kebutuhan verifikasi aparat.',
          actionPoints: [
            'Tangkapan layar (screenshot) nomor WhatsApp pelaku lengkap dengan nomor telepon utuh (bukan nama kontak).',
            'Screenshot riwayat obrolan lengkap yang memuat penawaran atau ancaman dari pelaku.',
            'Bukti transfer bank / e-wallet yang mencantumkan nama bank, nomor rekening tujuan, nama pemilik rekening, dan ID transaksi.',
            'Catat alamat tautan URL atau nama file .APK yang dikirimkan.'
          ],
          proTip: 'Ekspor obrolan WhatsApp: Buka chat &rarr; Opsi Lainnya &rarr; Lainnya &rarr; Ekspor Chat &rarr; Tanpa Media (untuk mendapatkan file log teks yang autentik).',
          mockupType: 'report'
        },
        {
          stepNumber: 2,
          title: 'Laporkan Rekening Penipu ke CekRekening.id (Komdigi)',
          subtitle: 'Memasukkan rekening pelaku ke daftar hitam nasional untuk dibekukan perbankan.',
          description: 'CekRekening.id adalah portal resmi dari Kementerian Komunikasi dan Digital RI yang bekerja sama dengan perbankan nasional untuk membekukan rekening hasil tindak pidana.',
          actionPoints: [
            'Kunjungi portal resmi: `https://cekrekening.id`.',
            'Pilih menu "Laporkan Rekening".',
            'Masukkan nama bank, nomor rekening pelaku, dan nama pemilik rekening.',
            'Unggah bukti transfer dan screenshot percakapan WhatsApp.',
            'Setelah diverifikasi oleh sistem dan perbankan, rekening pelaku akan dibekukan.'
          ],
          proTip: 'Cek terlebih dahulu nomor rekening yang diberikan calon penjual di CekRekening.id sebelum Anda mentransfer dana transaksi apa pun.',
          mockupType: 'report'
        },
        {
          stepNumber: 3,
          title: 'Laporkan Tautan Phishing ke AduanKonten.id & Patroli Siber',
          subtitle: 'Pemblokiran domain di tingkat ISP nasional & laporan pidana Bareskrim Polri.',
          description: 'Melindungi masyarakat luas dari jebakan yang sama dengan memutus peredaran tautan phishing di jaringan internet Indonesia.',
          actionPoints: [
            'AduanKonten.id (Komdigi): Daftarkan URL phishing agar masuk ke database TrustPositif dan diblokir oleh seluruh penyedia internet (ISP) di Indonesia.',
            'PatroliSiber.id (Direktorat Tindak Pidana Siber Bareskrim Polri): Buat laporan polisi secara daring untuk tindak lanjut penyidikan kejahatan siber finansial.',
            'Laporkan nomor WhatsApp ke WhatsApp: Ketuk profil penipu &rarr; pilih "Laporkan Kontak" (Report Contact).'
          ],
          proTip: 'Makin cepat Anda melapor dalam kurun waktu 1x24 jam pasca kejadian, makin besar peluang dana yang ditransfer dapat dibekukan sebelum dicairkan pelaku.',
          mockupType: 'report'
        }
      ]
    }
  ];

  const currentTutorial = tutorials.find((t) => t.id === activeTutorialId) || tutorials[0];

  const renderStepMockup = (mockupType: TutorialStep['mockupType']) => {
    switch (mockupType) {
      case 'airplane':
        return (
          <div className="w-full bg-[#0E241B] rounded-2xl p-5 text-white shadow-inner border border-emerald-900/40 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono border-b border-emerald-900/60 pb-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                SIMULASI PANEL KONTROL PONSEL
              </span>
              <span className="text-amber-400 font-semibold">TINDAKAN DARURAT</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-amber-500 text-white font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                <Plane className="w-6 h-6 animate-pulse" />
                <span className="text-xs">MODE PESAWAT: AKTIF</span>
                <span className="text-[10px] text-amber-100 font-normal">Semua Radio Terputus</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-800/80 text-gray-400 font-bold flex flex-col items-center justify-center gap-2 border border-gray-700/60">
                <Globe className="w-6 h-6 text-red-400" />
                <span className="text-xs text-red-300">DATA / WI-FI: MATI</span>
                <span className="text-[10px] text-gray-400 font-normal">Koneksi Hacker Terblokir</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-200/80 text-center leading-relaxed font-sans">
              &bull; Sinyal terputus seketika &bull; Spyware gagal meneruskan kode OTP SMS ke server pelaku.
            </p>
          </div>
        );

      case 'permissions':
        return (
          <div className="w-full bg-[#1A202C] rounded-2xl p-5 text-white shadow-inner border border-gray-700 space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-700 pb-2">
              <span className="text-xs font-bold text-gray-200">Pengaturan &gt; Aksesibilitas</span>
              <span className="text-xs text-red-400 font-mono font-bold">HAPUS IZIN</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/90 border border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                  APK
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Layanan Surat Undangan / Kurir</div>
                  <div className="text-[10px] text-red-400 font-medium">Meminta izin membaca layar &amp; SMS</div>
                </div>
              </div>
              <div className="w-10 h-5 bg-gray-600 rounded-full flex items-center p-0.5 cursor-not-allowed">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Matikan izin ini, lalu lanjutkan pencopotan di Safe Mode.</span>
            </div>
          </div>
        );

      case 'browser':
        return (
          <div className="w-full bg-white rounded-2xl p-5 border border-gray-200 shadow-md space-y-3 font-sans">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-red-600 font-bold">https://bca-klik.promo-hadiah.xyz</span>
              <span className="ml-auto text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-sans font-bold">PALSU</span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Peringatan: Formulir Phishing Terdeteksi</span>
              </div>
              <p className="text-[11px] text-red-700 leading-relaxed">
                Tutup jendela tab ini segera. Jangan sentuh kolom input "Username" atau "PIN/Password ATM".
              </p>
            </div>
          </div>
        );

      case 'domain':
        return (
          <div className="w-full bg-[#F8F9FA] rounded-2xl p-5 border border-gray-200 shadow-md space-y-3">
            <div className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-2">
              Perbandingan Anatomi Tautan Domain
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-600 font-bold">❌ PALSU:</span>
                <span className="text-gray-800">
                  https://klikbca.com.<strong className="text-red-600 bg-red-100 px-1 rounded">layanan-perbankan.top</strong>/login
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✅ ASLI:</span>
                <span className="text-gray-800">
                  https://<strong className="text-emerald-700 bg-emerald-100 px-1 rounded">ibank.klikbca.com</strong>/
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              &bull; Perhatikan domain sebelum garis miring pertama (`/`). TLD resmi bank Indonesia selalu menggunakan `.co.id` atau `.com` yang sah.
            </p>
          </div>
        );

      case 'bank':
      case 'report':
        return (
          <div className="w-full bg-white rounded-2xl p-5 border border-[#CFDDD5] shadow-sm space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs font-bold text-[#143826] border-b border-gray-100 pb-2">
              <span>Saluran Kontak Bantuan Resmi Terverifikasi</span>
              <span className="text-[10px] text-emerald-700 bg-[#EAF2ED] px-2 py-0.5 rounded-full font-mono">24/7 SIAGA</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200">
                <div className="font-bold text-gray-900">Halo BCA</div>
                <div className="text-emerald-700 font-mono font-bold">1500888</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200">
                <div className="font-bold text-gray-900">Mandiri Call</div>
                <div className="text-emerald-700 font-mono font-bold">14000</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200">
                <div className="font-bold text-gray-900">Contact BRI</div>
                <div className="text-emerald-700 font-mono font-bold">1500017</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200">
                <div className="font-bold text-gray-900">BNI Call</div>
                <div className="text-emerald-700 font-mono font-bold">1500046</div>
              </div>
            </div>
            <div className="text-[11px] text-gray-500">
              *Hanya gunakan nomor telepon resmi di atas atau yang tertera pada bagian belakang kartu ATM fisik Anda.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#F8F9FA] text-[#1A202C] min-h-screen">
      
      {/* 1. HERO HEADER BANNER (Pomaii Spacious Forest Green Style) */}
      <section className="w-full bg-[#143826] text-white pt-12 pb-16 border-b border-[#1D4E36] relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(232,106,51,0.5),rgba(255,255,255,0))]" />

        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-5 text-left">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#E86A33]" />
            <span>PUSAT MITIGASI &amp; TUTORIAL MANDIRI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
            Panduan Tanggap Insiden <br />
            <span className="text-[#E86A33]">&amp; Tutorial Langkah demi Langkah.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-200 max-w-2xl leading-relaxed font-medium">
            Ikuti panduan interaktif bergambar di bawah ini untuk mengambil tindakan penyelamatan cepat saat berhadapan dengan malware .APK, tautan phishing, atau penipuan finansial.
          </p>

          {/* Tutorial Category Switcher Chips */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap pt-3">
            {[
              { id: 'all', label: 'Semua Tutorial' },
              { id: 'apk', label: 'Darurat .APK' },
              { id: 'phishing', label: 'Tautan Phishing' },
              { id: 'domain', label: 'Verifikasi Domain' },
              { id: 'lapor', label: 'Lapor Resmi' },
              { id: 'checklist', label: 'Checklist Keamanan' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  if (cat.id !== 'all' && cat.id !== 'checklist') {
                    const match = tutorials.find((t) => t.category === cat.id);
                    if (match) {
                      setActiveTutorialId(match.id);
                      setActiveStepIndex(0);
                    }
                  }
                }}
                className={`btn-animate px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#E86A33] text-white shadow-md shadow-orange-500/25'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. MAIN TUTORIAL BODY */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-12 w-full space-y-12">
        
        {selectedCategory === 'checklist' ? (
          /* CHECKLIST VIEW */
          <div className="max-w-3xl mx-auto space-y-6 text-left">
            <div className="p-8 rounded-3xl bg-white border border-[#E8ECE9] space-y-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <h3 className="text-xl font-extrabold text-[#143826]">
                    Checklist Perimeter Keamanan Sebelum Bertransaksi
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Centang setiap poin perlindungan untuk memastikan keaslian lawan bicara Anda:
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold shrink-0 self-start sm:self-auto">
                  {completedCount} / {checklist.length} Aman
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#143826] to-[#E86A33] transition-all duration-300"
                  style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                />
              </div>

              <div className="space-y-3 pt-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    type="button"
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                      item.checked
                        ? 'bg-[#EAF2ED]/60 border-[#143826]/30 text-[#143826] shadow-2xs'
                        : 'bg-[#F8F9FA] border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.checked ? (
                        <CheckSquare className="w-5 h-5 text-[#143826] shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm leading-relaxed ${item.checked ? 'font-semibold line-through text-gray-400' : 'font-medium'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>

              {completedCount === checklist.length && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5 text-emerald-800 text-xs sm:text-sm font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Hebat! Anda telah memverifikasi seluruh perimeter keselamatan digital. Tetap waspada terhadap manipulasi psikologis.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* INTERACTIVE TUTORIAL WALKTHROUGH VIEW */
          <div className="space-y-12">
            
            {/* Top Selector Grid: 4 Tutorial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutorials.map((tut) => {
                const isActive = tut.id === activeTutorialId;
                return (
                  <div
                    key={tut.id}
                    onClick={() => {
                      setActiveTutorialId(tut.id);
                      setActiveStepIndex(0);
                    }}
                    className={`pomaii-card cursor-pointer p-5 rounded-3xl border transition-all text-left flex flex-col justify-between space-y-4 ${
                      isActive
                        ? 'ring-2 ring-[#E86A33] border-transparent shadow-lift bg-white'
                        : 'bg-white border-[#E8ECE9] hover:border-gray-300 opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="w-full h-32 rounded-2xl overflow-hidden relative">
                        <img 
                          src={tut.heroImage} 
                          alt={tut.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#143826]/90 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                          {tut.badge}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-[#143826] leading-snug">
                        {tut.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {tut.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] font-bold">
                      <span className={`px-2 py-0.5 rounded-md border ${tut.severityColor}`}>
                        {tut.severity}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {tut.readTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DETAIL ACTIVE TUTORIAL WALKTHROUGH */}
            <div className="p-6 sm:p-10 lg:p-12 rounded-[36px] bg-white border border-[#E8ECE9] shadow-card space-y-10 text-left">
              
              {/* Tutorial Header Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-gray-100 pb-8">
                
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentTutorial.severityColor}`}>
                      {currentTutorial.severity}
                    </span>
                    <span className="text-xs text-gray-400 font-medium font-mono">
                      {currentTutorial.steps.length} LANGKAH INTERAKTIF
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-[#143826] tracking-tight">
                    {currentTutorial.title}
                  </h2>

                  <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                    {currentTutorial.overview}
                  </p>
                </div>

                <div className="lg:col-span-4 rounded-2xl overflow-hidden h-48 sm:h-56 shadow-sm border border-gray-200">
                  <img
                    src={currentTutorial.heroImage}
                    alt={currentTutorial.title}
                    className="w-full h-full object-cover"
                  />
                </div>

              </div>

              {/* STEP-BY-STEP PROGRESS BAR & NAVIGATOR */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 tracking-wider uppercase font-mono">
                    PILIH LANGKAH TUTORIAL:
                  </span>
                  <span className="text-xs font-bold text-[#E86A33]">
                    Langkah {activeStepIndex + 1} dari {currentTutorial.steps.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentTutorial.steps.map((step, idx) => {
                    const isStepActive = idx === activeStepIndex;
                    return (
                      <button
                        key={step.stepNumber}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          isStepActive
                            ? 'bg-[#143826] text-white border-[#143826] shadow-md'
                            : 'bg-[#F8F9FA] text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isStepActive ? 'bg-[#E86A33] text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {step.stepNumber}
                        </div>
                        <span className="text-xs font-bold truncate">
                          Langkah {step.stepNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE STEP CARD CONTENT */}
              {(() => {
                const step = currentTutorial.steps[activeStepIndex];
                if (!step) return null;

                return (
                  <motion.div
                    key={`${currentTutorial.id}-step-${step.stepNumber}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2"
                  >
                    
                    {/* Left: Step Instructions */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] text-xs font-bold font-mono">
                          <span>LANGKAH KE-{step.stepNumber}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#143826] leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#E86A33] font-semibold">
                          {step.subtitle}
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                        {step.description}
                      </p>

                      {/* Action Points Checklist */}
                      <div className="space-y-3 p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider">
                          Daftar Tindakan Konkret:
                        </h4>
                        <ul className="space-y-2.5">
                          {step.actionPoints.map((action, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-[#143826] shrink-0 mt-0.5" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pro Tip Box */}
                      <div className="p-4 rounded-2xl bg-[#FDF0E9] border-l-4 border-[#E86A33] space-y-1">
                        <div className="text-xs font-bold text-[#B44616] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Catatan Kritis / Pro Tip:</span>
                        </div>
                        <p className="text-xs text-[#B44616] leading-relaxed">
                          {step.proTip}
                        </p>
                      </div>

                      {/* Step Nav Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          disabled={activeStepIndex === 0}
                          onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold border transition ${
                            activeStepIndex === 0
                              ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                              : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'
                          }`}
                        >
                          &larr; Langkah Sebelumnya
                        </button>

                        <button
                          type="button"
                          disabled={activeStepIndex === currentTutorial.steps.length - 1}
                          onClick={() => setActiveStepIndex((prev) => Math.min(currentTutorial.steps.length - 1, prev + 1))}
                          className={`btn-animate px-6 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                            activeStepIndex === currentTutorial.steps.length - 1
                              ? 'opacity-40 cursor-not-allowed bg-gray-200 text-gray-500'
                              : 'bg-[#143826] hover:bg-[#1D4E36] text-white shadow-sm'
                          }`}
                        >
                          <span>Langkah Selanjutnya</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                    {/* Right: Visual Step Diagram / Simulated Mockup */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider">
                        ILUSTRASI VISUAL LANGKAH:
                      </div>

                      {renderStepMockup(step.mockupType)}

                      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#CFDDD5] space-y-1 text-xs text-gray-600">
                        <span className="font-bold text-[#143826] block">Prinsip Respon Cepat:</span>
                        <p className="text-[11px] leading-relaxed">
                          Kecepatan tindakan dalam 15 menit pertama menentukan apakah akun atau saldo Anda dapat diselamatkan sebelum dicairkan pelaku.
                        </p>
                      </div>
                    </div>

                  </motion.div>
                );
              })()}

            </div>

            {/* 3. OFFICIAL REPORTING PORTALS ROW (Direct Help Links) */}
            <div className="space-y-6 pt-4 text-left">
              <div className="flex items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-black text-[#143826] tracking-tight">
                  Kanal Resmi Pelaporan Siber Indonesia
                </h3>
                <span className="text-xl">🇮🇩</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Portal 1 */}
                <div className="pomaii-card p-6 rounded-3xl bg-white border border-[#E8ECE9] space-y-4 shadow-sm hover:shadow-card transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#143826] flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5 text-[#143826]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">KEMENTERIAN KOMDIGI</span>
                      <h4 className="text-base font-bold text-gray-900 mt-0.5">CekRekening.id</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Portal resmi untuk melaporkan nomor rekening bank atau e-wallet yang digunakan untuk tindak pidana penipuan agar dibekukan.
                    </p>
                  </div>
                  <a
                    href="https://cekrekening.id"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-animate inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#EAF2ED] hover:bg-[#DDE8E2] text-[#143826] text-xs font-bold transition w-full"
                  >
                    <span>Buka CekRekening.id</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Portal 2 */}
                <div className="pomaii-card p-6 rounded-3xl bg-white border border-[#E8ECE9] space-y-4 shadow-sm hover:shadow-card transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                      <Globe className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">KEMENTERIAN KOMDIGI</span>
                      <h4 className="text-base font-bold text-gray-900 mt-0.5">AduanKonten.id</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Fasilitas pengaduan konten negatif, situs phishing, dan tautan malware untuk pemblokiran DNS di seluruh ISP Indonesia.
                    </p>
                  </div>
                  <a
                    href="https://aduankonten.id"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-animate inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#EAF2ED] hover:bg-[#DDE8E2] text-[#143826] text-xs font-bold transition w-full"
                  >
                    <span>Buka AduanKonten.id</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Portal 3 */}
                <div className="pomaii-card p-6 rounded-3xl bg-white border border-[#E8ECE9] space-y-4 shadow-sm hover:shadow-card transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                      <ShieldAlert className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">BARESKRIM POLRI</span>
                      <h4 className="text-base font-bold text-gray-900 mt-0.5">PatroliSiber.id</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Portal resmi Direktorat Tindak Pidana Siber Polri untuk pembuatan laporan kepolisian atas kerugian kejahatan daring.
                    </p>
                  </div>
                  <a
                    href="https://patrolisiber.id"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-animate inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#EAF2ED] hover:bg-[#DDE8E2] text-[#143826] text-xs font-bold transition w-full"
                  >
                    <span>Buka PatroliSiber.id</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
};
