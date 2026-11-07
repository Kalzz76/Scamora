import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  MessageSquare, 
  Info, 
  ArrowRight, 
  Eye, 
  Users, 
  CheckCircle2, 
  Play, 
  Target, 
  ShieldAlert,
  Lightbulb,
  PhoneCall,
  Globe,
  Terminal,
  Cpu,
  Smartphone,
  Lock,
  Layers,
  KeyRound,
  Activity,
  Briefcase,
  Building2,
  User
} from 'lucide-react';
import { AcademyIllustration } from '../../components/illustrations/Illustrations2D';

interface AnatomyHotspot {
  id: string;
  pinNumber: number;
  label: string;
  triggerText: string;
  explanation: string;
  category: 'psikologis' | 'teknis' | 'identitas' | 'finansial';
}

interface AnatomyCase {
  id: string;
  title: string;
  category: string;
  senderName: string;
  senderPhone: string;
  senderAvatar: string;
  timeString: string;
  chatMessage: string;
  attachmentName?: string;
  attachmentType?: 'apk' | 'link';
  attachmentSize?: string;
  presetTarget: { type: 'chat' | 'url'; presetId: string };
  hotspots: AnatomyHotspot[];
}

interface ScamModus {
  id: string;
  category: string;
  title: string;
  severity: 'KRITIS' | 'TINGGI' | 'SEDANG';
  severityColor: string;
  targetVictim: string;
  channel: string;
  summary: string;
  tactics: string[];
  prevention: string[];
  linkType: 'chat' | 'url' | 'panduan';
  diagramType: 'apk_flow' | 'task_flow' | 'typo_url' | 'vishing_call' | 'mule_flow';
}

interface GlossaryItem {
  id: string;
  term: string;
  tag: string;
  iconType: 'globe' | 'smartphone' | 'cpu' | 'terminal' | 'phone' | 'key' | 'shield' | 'lock';
  definition: string;
  analogy: string;
}

export const KnowledgePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'anatomi' | 'katalog' | 'kamus'>('anatomi');
  const [activeCaseId, setActiveCaseId] = useState<string>('case-apk');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('h1');
  const [catalogFilter, setCatalogFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const anatomyCases: AnatomyCase[] = [
    {
      id: 'case-apk',
      title: 'Surat Undangan Pernikahan .APK',
      category: 'Malware Android / Trojan SMS',
      senderName: 'Undangan Pernikahan R&D',
      senderPhone: '+62 821-9981-2241',
      senderAvatar: '',
      timeString: '14:23',
      chatMessage: 'Halo kak, mohon maaf mengganggu waktunya. Ini kami kirimkan Surat Undangan Pernikahan digital kami. Mohon doa restu dan kehadirannya ya kak. Silakan buka file undangannya di bawah ini ya kak terima kasih.',
      attachmentName: 'Surat_Undangan_Pernikahan_Digital.apk',
      attachmentType: 'apk',
      attachmentSize: '6.4 MB',
      presetTarget: { type: 'chat', presetId: 'chat-apk-invitation' },
      hotspots: [
        {
          id: 'h1',
          pinNumber: 1,
          label: 'Nomor Pengirim Tidak Dikenal',
          triggerText: '+62 821-9981-2241 (Nomor Asing Tanpa Nama)',
          explanation: 'Pelaku membeli nomor prabayar acak sekali pakai. Mereka mengatasnamakan kerabat atau kenalan lama agar Anda merasa sungkan untuk menanyakan identitas aslinya.',
          category: 'identitas'
        },
        {
          id: 'h2',
          pinNumber: 2,
          label: 'Manipulasi Kesopanan (Social Engineering)',
          triggerText: '"Mohon maaf mengganggu... mohon doa restunya"',
          explanation: 'Pelaku memanfaatkan norma kesopanan dan rasa segan orang Indonesia. Korban merasa tidak enak hati menolak sehingga langsung membuka lampiran tanpa berpikir kritis.',
          category: 'psikologis'
        },
        {
          id: 'h3',
          pinNumber: 3,
          label: 'Ekstensi Berbahaya .APK',
          triggerText: 'Surat_Undangan_Pernikahan_Digital.apk',
          explanation: 'Undangan digital asli biasanya berbentuk link website atau file PDF/gambar. File berakhiran .APK adalah berkas aplikasi Android yang jika diinstal akan menyusupkan malware pencuri SMS OTP.',
          category: 'teknis'
        },
        {
          id: 'h4',
          pinNumber: 4,
          label: 'Permintaan Izin Akses Berbahaya',
          triggerText: 'Saat diinstal: Minta izin Aksesibilitas & Notifikasi',
          explanation: 'Setelah terinstal, malware akan meminta izin membaca SMS di latar belakang. Kode OTP yang dikirim bank Anda otomatis diteruskan ke Telegram milik hacker tanpa sepengetahuan Anda.',
          category: 'finansial'
        }
      ]
    },
    {
      id: 'case-task',
      title: 'Lowongan Freelance Like & Subscribe Video',
      category: 'Task Scam / Rekayasa Sosial',
      senderName: 'HR Recruiter Global Agency',
      senderPhone: '+62 858-3312-9901',
      senderAvatar: '',
      timeString: '10:15',
      chatMessage: 'Halo Kak! Kami dari HR Global Marketing Agency membuka peluang kerja paruh waktu (freelance WFH). Tugasnya hanya Like dan Subscribe channel YouTube/TikTok. Komisi harian Rp 200.000 s/d Rp 1.500.000 langsung cair ke rekening/e-wallet Anda. Untuk tugas pertama komisi Rp 30.000, apakah Kakak tertarik bergabung?',
      presetTarget: { type: 'chat', presetId: 'chat-job-scam' },
      hotspots: [
        {
          id: 'j1',
          pinNumber: 1,
          label: 'Perekrutan Acak Melalui WhatsApp',
          triggerText: 'Perekrutan kerja dari nomor asing tanpa melamar',
          explanation: 'Perusahaan profesional tidak pernah merekrut kandidat melalui pesan WhatsApp acak tanpa proses seleksi, portofolio, atau wawancara resmi.',
          category: 'identitas'
        },
        {
          id: 'j2',
          pinNumber: 2,
          label: 'Imbalan Fantastis untuk Tugas Remeh',
          triggerText: 'Rp 200.000 - Rp 1.500.000 hanya untuk Like Video',
          explanation: 'Tugas sepele dengan bayaran ratusan ribu hingga jutaan per hari adalah umpan psikologis yang tidak rasional dalam logika bisnis periklanan mana pun.',
          category: 'psikologis'
        },
        {
          id: 'j3',
          pinNumber: 3,
          label: 'Trik Umpan Kecil di Awal (Baiting)',
          triggerText: 'Komisi awal Rp 30.000 langsung cair',
          explanation: 'Pelaku sengaja mentransfer uang kecil di misi awal untuk meyakinkan Anda bahwa mereka bukan penipu dan membangun rasa percaya semu.',
          category: 'teknis'
        },
        {
          id: 'j4',
          pinNumber: 4,
          label: 'Jebakan Deposit Grup Telegram VIP',
          triggerText: 'Misi lanjutan wajib deposit uang jaminan',
          explanation: 'Setelah korban percaya, korban dipindahkan ke grup Telegram dan diwajibkan mentransfer deposit jutaan rupiah untuk "membuka misi bonus besar". Begitu uang ditransfer, korban diblokir.',
          category: 'finansial'
        }
      ]
    },
    {
      id: 'case-phishing',
      title: 'Peringatan Pemblokiran Rekening Bank',
      category: 'Phishing & Domain Typosquatting',
      senderName: 'NOTIFIKASI BANK RESMI',
      senderPhone: 'INFO-BCA / BANK RESMI',
      senderAvatar: '',
      timeString: '08:45',
      chatMessage: '[PERINGATAN RESMI] Rekening Anda terindikasi transaksi mencurigakan sebesar Rp 5.000.000. Jika ini bukan Anda, segera batalkan transaksi dan amankan akun Anda dalam 2 jam melalui tautan resmi: http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true',
      attachmentType: 'link',
      presetTarget: { type: 'url', presetId: 'url-bank-phishing' },
      hotspots: [
        {
          id: 'p1',
          pinNumber: 1,
          label: 'Trik Teror Urgensi Waktu',
          triggerText: '"Segera konfirmasi dalam 2 jam..."',
          explanation: 'Penipu sengaja memberikan tenggat waktu sempit agar korban panik, cemas kehilangan uang, dan langsung mengklik tautan tanpa sempat memeriksa keaslian alamat web.',
          category: 'psikologis'
        },
        {
          id: 'p2',
          pinNumber: 2,
          label: 'Domain Palsu (Typosquatting & Subdomain)',
          triggerText: 'bca-klik.com.secure-login-update.xyz',
          explanation: 'Domain induk situs ini adalah secure-login-update.xyz, bukan bca.co.id atau klikbca.com. Kata "bca-klik.com" hanyalah subdomain tipuan untuk mengelabui mata yang melihat sepintas.',
          category: 'teknis'
        },
        {
          id: 'p3',
          pinNumber: 3,
          label: 'Protokol HTTP Tidak Terenkripsi',
          triggerText: 'http:// (Bukan HTTPS resmi)',
          explanation: 'Bank resmi selalu menggunakan protokol HTTPS dengan sertifikat EV (Extended Validation) dan domain resmi berakhiran .co.id, bukan domain generik murah seperti .xyz.',
          category: 'teknis'
        },
        {
          id: 'p4',
          pinNumber: 4,
          label: 'Formulir Pencurian Kredensial',
          triggerText: 'Formulir meminta PIN, No. Kartu, & Kode OTP',
          explanation: 'Situs tiruan ini akan mencatat seluruh ketikan username, PIN, nomor CVV kartu, dan kode OTP Anda untuk langsung dikuras oleh pelaku secara real-time.',
          category: 'finansial'
        }
      ]
    }
  ];

  const scamCatalog: ScamModus[] = [
    {
      id: 'mod-apk',
      category: 'Malware Android',
      title: 'Malware .APK Berkedok Dokumen & Kurir Paket',
      severity: 'KRITIS',
      severityColor: 'bg-red-500/10 text-red-700 border-red-500/20',
      targetVictim: 'Semua Pengguna HP Android & Nasabah Mobile Banking',
      channel: 'WhatsApp, Telegram, SMS',
      summary: 'Penipuan dengan mengirimkan berkas aplikasi Android (.APK) palsu yang menyamar sebagai undangan pernikahan, resi kurir paket tertahan, surat tilang ETLE, atau tagihan PLN.',
      tactics: [
        'Mengganti ekstensi file menjadi teks mengecoh (contoh: Foto_Paket.apk atau Undangan.apk).',
        'Meminta izin "Accessibility Service" dan "Akses Notifikasi SMS" saat proses instalasi.',
        'Mencegat kode OTP transaksi perbankan dan menghapus notifikasi SMS agar korban tidak curiga.',
        'Menguras saldo tabungan melalui transfer otomatis di latar belakang.'
      ],
      prevention: [
        'Jangan pernah menginstal file dari luar Google Play Store.',
        'Dokumen foto, undangan, atau tagihan asli di Android berakhiran .pdf, .jpg, atau tautan web resmi, BUKAN .apk.',
        'Matikan opsi "Install unknown apps" pada pengaturan privasi ponsel Anda.',
        'Jika terlanjur klik, segera aktifkan Mode Pesawat (Airplane Mode) seketika.'
      ],
      linkType: 'chat',
      diagramType: 'apk_flow'
    },
    {
      id: 'mod-task',
      category: 'Social Engineering',
      title: 'Lowongan Kerja Paruh Waktu Like & Subscribe Video (Task Scam)',
      severity: 'TINGGI',
      severityColor: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
      targetVictim: 'Pencari Kerja, Mahasiswa, Ibu Rumah Tangga',
      channel: 'WhatsApp, Telegram, TikTok, Instagram',
      summary: 'Menawarkan pekerjaan freelance mudah dengan komisi harian jutaan rupiah hanya untuk menyukai video YouTube atau follow akun media sosial tertentu.',
      tactics: [
        'Memberikan imbalan kecil di awal (Rp 15.000 - Rp 50.000) yang benar-benar ditransfer untuk membangun rasa percaya.',
        'Memasukkan korban ke grup Telegram tertutup dan menugaskan "misi deposit bernilai tinggi".',
        'Mengunci dana korban dengan alasan "salah kode tugas" dan meminta transfer tambahan jutaan rupiah untuk mencairkan saldo.',
        'Memblokir kontak korban saat dana yang disetor sudah mencapai puluhan hingga ratusan juta rupiah.'
      ],
      prevention: [
        'Ingat prinsip: Pekerjaan profesional tidak pernah memungut biaya pendaftaran atau meminta deposit uang muka.',
        'Waspadai tawaran komisi tidak logis untuk tugas yang sangat sepele.',
        'Hindari bergabung ke grup Telegram keuangan tertutup dari ajakan nomor asing.'
      ],
      linkType: 'chat',
      diagramType: 'task_flow'
    },
    {
      id: 'mod-phishing',
      category: 'Phishing Domain',
      title: 'Situs Web Tiruan Perbankan & Lembaga Finansial (Typosquatting)',
      severity: 'KRITIS',
      severityColor: 'bg-red-500/10 text-red-700 border-red-500/20',
      targetVictim: 'Nasabah Aktif Internet & Mobile Banking',
      channel: 'SMS Blast, Email, Iklan Mesin Pencari Google',
      summary: 'Membuat alamat website tiruan yang sangat mirip dengan portal perbankan resmi untuk mencuri kredensial login, PIN transaksi, dan kode OTP nasabah.',
      tactics: [
        'Mendaftarkan domain dengan kesalahan ketik tipis (contoh: bca-klik.com, bri-layanan.top, cimb-login.xyz).',
        'Menyusupkan nama bank ke dalam subdomain (contoh: bankbca.update-akun.xyz).',
        'Meniru 100% tata letak visual, logo, dan skema warna portal internet banking asli.',
        'Menyerap data input secara langsung ke panel kendali hacker.'
      ],
      prevention: [
        'Ketik manual alamat resmi bank Anda di bilah browser, jangan mengklik link dari chat atau SMS.',
        'Periksa nama domain induk sebelum tanda garis miring pertama (`/`). Bank resmi Indonesia menggunakan domain `.co.id` atau `.com` yang sah.',
        'Gunakan modul Cek URL di Scamora untuk mendeteksi indikasi typosquatting dan usia domain.'
      ],
      linkType: 'url',
      diagramType: 'typo_url'
    },
    {
      id: 'mod-vishing',
      category: 'Impersonasi Panggilan',
      title: 'Panggilan Telepon Mengaku Petugas Resmi / Call Center Bank (Vishing)',
      severity: 'TINGGI',
      severityColor: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
      targetVictim: 'Pemilik Tabungan & Pemegang Kartu Kredit',
      channel: 'Panggilan Suara Telepon Seluler (+62, +1, Nomor Khusus)',
      summary: 'Pelaku menelepon calon korban dengan nomor palsu (spoofed caller ID) mengaku dari pihak bank atau OJK, mengabarkan adanya transaksi mencurigakan, dan meminta konfirmasi OTP.',
      tactics: [
        'Menciptakan kepanikan dengan menyatakan ada tagihan kartu kredit atau pembobolan rekening jutaan rupiah.',
        'Menyebutkan data pribadi korban (Nama, NIK, alamat) yang diperoleh dari kebocoran data untuk meyakinkan korban.',
        'Mendesak korban membacakan kode 6-digit OTP SMS dengan dalih "untuk membatalkan transaksi".'
      ],
      prevention: [
        'Prinsip Mutlak Perbankan: Petugas bank TIDAK AKAN PERNAH meminta kode OTP, PIN, atau 3 angka CVV kartu.',
        'Jika menerima telepon mencurigakan, segera matikan telepon.',
        'Hubungi kembali nomor resmi call center yang tertera di bagian belakang kartu ATM fisik Anda.'
      ],
      linkType: 'panduan',
      diagramType: 'vishing_call'
    },
    {
      id: 'mod-mule',
      category: 'Pencucian Uang',
      title: 'Jual Beli Rekening Tabungan & QRIS Palsu (Rekening Penampung / Mule)',
      severity: 'SEDANG',
      severityColor: 'bg-blue-500/10 text-blue-800 border-blue-500/20',
      targetVictim: 'Masyarakat Awam, Remaja, Pelaku Usaha Mikro',
      channel: 'Grup Facebook, Twitter/X, Forum Daring',
      summary: 'Membujuk masyarakat untuk membuka rekening bank atau akun e-wallet baru lalu menjualnya ke sindikat kejahatan dengan imbalan uang tunai beberapa ratus ribu rupiah.',
      tactics: [
        'Menawarkan uang cepat Rp 300.000 - Rp 1.000.000 per buku tabungan + kartu ATM yang diserahkan.',
        'Menyatakan rekening hanya digunakan untuk transaksi game online atau bisnis crypto luar negeri.',
        'Rekening tersebut kemudian digunakan sindikat untuk menampung dana hasil penipuan online dan judi daring.'
      ],
      prevention: [
        'Jangan pernah meminjamkan, menyewakan, atau menjual rekening bank pribadi kepada siapa pun.',
        'Pemilik rekening terdaftar dapat terjerat Pasal Tindak Pidana Pencucian Uang (TPPU) dan UU ITE sebagai pelaku pembantu kejahatan.',
        'Segera tutup rekening jika Anda pernah menyerahkan aksesnya ke orang lain.'
      ],
      linkType: 'panduan',
      diagramType: 'mule_flow'
    }
  ];

  const glossaryItems: GlossaryItem[] = [
    {
      id: 'g-phishing',
      term: 'Phishing',
      tag: 'Taktik Pancingan',
      iconType: 'globe',
      definition: 'Metode penipuan menggunakan situs web, email, atau tautan palsu untuk memancing korban memasukkan data rahasia seperti username, password, dan PIN.',
      analogy: 'Ibarat memasang papan nama palsu di depan rumah orang lain untuk mengumpulkan paket surat berharga milik korban.'
    },
    {
      id: 'g-trojan',
      term: 'Trojan Banker (.APK)',
      tag: 'Malware Ponsel',
      iconType: 'smartphone',
      definition: 'Aplikasi jahat yang menyamar sebagai file berguna (undangan, resi paket), padahal bertugas menyadap SMS, mencuri OTP, dan mengambil alih m-banking.',
      analogy: 'Ibarat kuda troya yang tampak seperti hadiah pernikahan di luar, tetapi di dalamnya ada penyusup yang mencuri kunci brankas.'
    },
    {
      id: 'g-social',
      term: 'Social Engineering',
      tag: 'Manipulasi Pikiran',
      iconType: 'cpu',
      definition: 'Teknik manipulasi psikologis yang mengeksploitasi emosi manusia (rasa panik, serakah, takut, atau sungkan) agar korban mematuhi instruksi penipu tanpa curiga.',
      analogy: 'Bukan meretas sistem komputernya, melainkan "meretas" kelemahan pikiran dan emosi manusianya.'
    },
    {
      id: 'g-typo',
      term: 'Typosquatting',
      tag: 'Manipulasi Domain',
      iconType: 'terminal',
      definition: 'Pendaftaran nama domain internet yang sengaja dibuat mirip atau salah ketik satu huruf dari merek resmi ternama untuk mengecoh pembacaan sepintas.',
      analogy: 'Contoh: mendaftarkan "bca-klik.xyz" alih-alih "klikbca.com" untuk mengelabui mata yang terburu-buru.'
    },
    {
      id: 'g-vishing',
      term: 'Vishing (Voice Phishing)',
      tag: 'Panggilan Telepon',
      iconType: 'phone',
      definition: 'Penipuan menggunakan sambungan panggilan telepon langsung dengan mengaku sebagai petugas bank, polisi, atau instansi resmi untuk meminta kode OTP.',
      analogy: 'Pencuri yang menelpon rumah Anda dan berpura-pura menjadi pemadam kebakaran agar Anda melempar kunci rumah keluar jendela.'
    },
    {
      id: 'g-otp',
      term: 'OTP (One-Time Password)',
      tag: 'Kunci Pengaman',
      iconType: 'key',
      definition: 'Kata sandi dinamis sekali pakai 6 digit angka yang dikirimkan bank via SMS untuk mengesahkan transaksi perbankan atau perpindahan dana.',
      analogy: 'Kode OTP adalah tanda tangan digital mutlak Anda. Memberikan OTP sama dengan menyerahkan uang tunai di dompet Anda.'
    },
    {
      id: 'g-zero',
      term: 'Zero Plaintext Retention',
      tag: 'Standar Privasi Scamora',
      iconType: 'shield',
      definition: 'Arsitektur privasi di mana teks percakapan dan alamat URL yang dimasukkan pengguna langsung dihapus dari memori sistem seketika setelah analisis selesai.',
      analogy: 'Seperti menggunakan papan tulis kapur: begitu Anda selesai membaca penjelasannya, tulisan langsung dihapus bersih tanpa jejak di database.'
    },
    {
      id: 'g-2fa',
      term: 'Two-Factor Authentication (2FA)',
      tag: 'Perlindungan Ganda',
      iconType: 'lock',
      definition: 'Metode otentikasi yang memerlukan dua bukti identitas sebelum masuk ke akun (misal: Kata Sandi + Kode dari Aplikasi Authenticator).',
      analogy: 'Memiliki pintu rumah dengan dua kunci berbeda dari dua gembok terpisah agar lebih sulit ditembus maling.'
    }
  ];

  const currentCase = anatomyCases.find((c) => c.id === activeCaseId) || anatomyCases[0];
  const currentHotspot = currentCase.hotspots.find((h) => h.id === selectedHotspotId) || currentCase.hotspots[0];

  const filteredCatalog = scamCatalog.filter((item) => {
    const matchFilter = catalogFilter === 'all' || item.category.toLowerCase().includes(catalogFilter.toLowerCase());
    const matchSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleTestInScanner = (target: { type: 'chat' | 'url'; presetId: string }) => {
    if (target.type === 'url') {
      navigate('/url');
    } else {
      navigate('/chat');
    }
  };

  // Render Visual Diagram for Catalog Modus
  const renderCatalogDiagram = (diagramType: ScamModus['diagramType']) => {
    switch (diagramType) {
      case 'apk_flow':
        return (
          <div className="p-4 rounded-2xl bg-[#0D2418] text-white space-y-3 font-mono text-xs border border-emerald-900/50">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold border-b border-emerald-900/60 pb-2">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                SKEMA ANATOMI EKSPLOITASI .APK
              </span>
              <span className="text-red-400">MALWARE INFECTION</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-sans">
              <div className="p-2 rounded-xl bg-gray-800/80 border border-gray-700">
                <span className="block font-bold text-gray-200">1. Pesan WA</span>
                <span className="text-gray-400 text-[9px]">File berekstensi .apk</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <span className="block font-bold">2. Izin SMS</span>
                <span className="text-[9px]">Aksesibilitas aktif</span>
              </div>
              <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40">
                <span className="block font-bold">3. Intersepsi</span>
                <span className="text-[9px]">OTP diteruskan C2</span>
              </div>
              <div className="p-2 rounded-xl bg-red-600 text-white font-bold">
                <span className="block">4. Bobol</span>
                <span className="text-[9px] text-red-100">Saldo ditransfer</span>
              </div>
            </div>
          </div>
        );

      case 'task_flow':
        return (
          <div className="p-4 rounded-2xl bg-[#1C1814] text-white space-y-3 font-mono text-xs border border-amber-900/50">
            <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold border-b border-amber-900/60 pb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                SIKLUS JEBAKAN PSIKOLOGIS TASK SCAM
              </span>
              <span className="text-amber-300">BAITING PYRAMID</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[10px] font-sans">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                <span className="font-bold block text-emerald-400">+ Rp 30.000</span>
                <span className="text-[9px]">Misi 1: Cair Asli (Umpan)</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-300">
                <span className="font-bold block text-amber-400">Grup VIP Telegram</span>
                <span className="text-[9px]">Deposit Rp 2jt - Rp 10jt</span>
              </div>
              <div className="p-2 rounded-xl bg-red-950/80 border border-red-700/60 text-red-300">
                <span className="font-bold block text-red-400">SALDO TERKUNCI</span>
                <span className="text-[9px]">Kontak Diblokir</span>
              </div>
            </div>
          </div>
        );

      case 'typo_url':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans font-bold border-b border-gray-100 pb-1.5">
              <span>BEDAH ANATOMI PERBANDINGAN URL</span>
              <span className="text-red-600 font-bold">TYPOSQUATTING CHECK</span>
            </div>
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-[11px]">
              <span className="text-red-700 truncate">
                http://bca-klik.com.<strong className="bg-red-200 px-1 rounded text-red-900">update-data.top</strong>/login
              </span>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-sans text-[10px] font-bold shrink-0 ml-2">
                PALSU
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px]">
              <span className="text-emerald-800 truncate">
                https://<strong className="bg-emerald-200 px-1 rounded text-emerald-950">ibank.klikbca.com</strong>/
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-sans text-[10px] font-bold shrink-0 ml-2">
                RESMI
              </span>
            </div>
          </div>
        );

      case 'vishing_call':
        return (
          <div className="p-4 rounded-2xl bg-[#0F172A] text-white space-y-3 font-mono text-xs border border-slate-700">
            <div className="flex items-center justify-between text-[11px] text-blue-400 font-bold border-b border-slate-700 pb-2">
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                SIMULASI PANGGILAN SPOOFING CALLER ID
              </span>
              <span className="text-red-400 animate-pulse">PANGGILAN MASUK</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-between font-sans">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">Call Center Bank Resmi (Palsu)</div>
                  <div className="text-[10px] text-gray-400 font-mono">+62 21-1500888 (ID Spoofed)</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-300 font-bold">
                Mendesak OTP
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-sans leading-relaxed">
              &bull; Fakta Perbankan: Petugas bank tidak pernah meminta pembacaan kode OTP atau PIN transaksi.
            </div>
          </div>
        );

      case 'mule_flow':
        return (
          <div className="p-4 rounded-2xl bg-[#131E2A] text-white space-y-3 font-mono text-xs border border-blue-900/60">
            <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold border-b border-blue-900 pb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                ALUR PENCUCIAN UANG (MONEY MULE)
              </span>
              <span className="text-amber-400">PASAL TPPU</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[10px] font-sans">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                <span className="block font-bold text-gray-200">1. Sindikat</span>
                <span className="text-[9px] text-gray-400">Dana hasil tipuan</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="block font-bold">2. Rekening Anda</span>
                <span className="text-[9px]">Uang numpang lewat</span>
              </div>
              <div className="p-2 rounded-xl bg-red-600 text-white font-bold">
                <span className="block">3. Pidana</span>
                <span className="text-[9px] text-red-100">Pemilik rekening diusut</span>
              </div>
            </div>
          </div>
        );
    }
  };

  // Render Visual Mini Mockup for Glossary Items
  const renderGlossaryVisual = (iconType: GlossaryItem['iconType']) => {
    switch (iconType) {
      case 'globe':
        return (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 font-mono text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[9px] text-red-600 font-bold uppercase font-sans">
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Web Palsu</span>
              <span>Umpan Link</span>
            </div>
            <div className="truncate text-[10px] text-gray-700 bg-white px-2 py-1 rounded border border-red-200">
              http://login-bank-update.xyz
            </div>
          </div>
        );

      case 'smartphone':
        return (
          <div className="p-2.5 rounded-xl bg-[#0D2418] text-emerald-300 font-mono text-[11px] space-y-1 border border-emerald-900">
            <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold uppercase font-sans">
              <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Android Package</span>
              <span>Trojan</span>
            </div>
            <div className="text-[10px] text-gray-200 bg-black/40 px-2 py-1 rounded border border-emerald-800/80 flex items-center justify-between">
              <span>Undangan.apk</span>
              <span className="text-red-400 font-bold">Malware</span>
            </div>
          </div>
        );

      case 'cpu':
        return (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-sans text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-[9px] text-amber-700 font-bold uppercase">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Manipulasi Emosi</span>
              <span>90% Sukses</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-center">
              <span className="flex-1 bg-amber-200 py-0.5 rounded text-amber-900">Panik</span>
              <span>&rarr;</span>
              <span className="flex-1 bg-amber-200 py-0.5 rounded text-amber-900">Tergesa</span>
              <span>&rarr;</span>
              <span className="flex-1 bg-red-200 py-0.5 rounded text-red-900">Tertipu</span>
            </div>
          </div>
        );

      case 'terminal':
        return (
          <div className="p-2.5 rounded-xl bg-gray-900 text-gray-200 font-mono text-[10px] space-y-1 border border-gray-700">
            <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans font-bold">
              <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> DNS Apex Domain</span>
              <span className="text-red-400">Salah Ketik</span>
            </div>
            <div className="text-emerald-400 truncate">
              bca-klik.<span className="text-red-400 underline font-bold">xyz</span> (Palsu)
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-sans text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[9px] text-blue-700 font-bold uppercase">
              <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3" /> Voice Call</span>
              <span className="text-red-600 font-bold">Minta OTP</span>
            </div>
            <div className="text-[10px] bg-white p-1 rounded border border-blue-200 text-gray-700 flex items-center justify-between">
              <span>+62 21-1500xxx</span>
              <span className="text-red-600 font-bold text-[9px]">Tolak!</span>
            </div>
          </div>
        );

      case 'key':
        return (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 font-mono text-[11px] space-y-1.5 text-center">
            <div className="flex items-center justify-between text-[9px] text-red-700 font-bold uppercase font-sans">
              <span className="flex items-center gap-1"><KeyRound className="w-3 h-3" /> 6-Digit Rahasia</span>
              <span>1x Pakai</span>
            </div>
            <div className="flex items-center justify-center gap-1 font-bold text-gray-900">
              <span className="w-5 h-6 bg-white border border-gray-300 rounded flex items-center justify-center text-[10px]">4</span>
              <span className="w-5 h-6 bg-white border border-gray-300 rounded flex items-center justify-center text-[10px]">8</span>
              <span className="w-5 h-6 bg-white border border-gray-300 rounded flex items-center justify-center text-[10px]">1</span>
              <span className="w-5 h-6 bg-white border border-gray-300 rounded flex items-center justify-center text-[10px]">9</span>
              <span className="w-5 h-6 bg-white border border-gray-300 rounded flex items-center justify-center text-[10px]">2</span>
              <span className="w-5 h-6 bg-white border border-gray-300 rounded flex items-center justify-center text-[10px]">0</span>
            </div>
          </div>
        );

      case 'shield':
        return (
          <div className="p-2.5 rounded-xl bg-[#EAF2ED] border border-[#CFDDD5] font-mono text-[10px] text-[#143826] space-y-1">
            <div className="flex items-center justify-between text-[9px] text-[#143826] font-bold uppercase font-sans">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Siklus Memori</span>
              <span>0-Byte Simpan</span>
            </div>
            <div className="text-[10px] flex items-center justify-between bg-white px-2 py-0.5 rounded border border-[#CFDDD5]">
              <span>Input Data</span>
              <span>&rarr;</span>
              <span className="text-emerald-700 font-bold">RAM Wipe (0ms)</span>
            </div>
          </div>
        );

      case 'lock':
        return (
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-sans text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[9px] text-purple-700 font-bold uppercase">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Lapisan Ganda</span>
              <span>Keamanan 99%</span>
            </div>
            <div className="text-[10px] bg-white px-2 py-1 rounded border border-purple-200 flex items-center justify-between font-mono">
              <span>Password</span>
              <span>+</span>
              <span className="text-purple-700 font-bold">App Token</span>
            </div>
          </div>
        );
    }
  };

  const renderSenderAvatar = (caseId: string) => {
    if (caseId === 'case-apk') return <User className="w-5 h-5 text-emerald-200" />;
    if (caseId === 'case-task') return <Briefcase className="w-5 h-5 text-emerald-200" />;
    if (caseId === 'case-phishing') return <Building2 className="w-5 h-5 text-emerald-200" />;
    return <User className="w-5 h-5 text-emerald-200" />;
  };

  return (
    <div className="flex flex-col w-full bg-transparent text-[#0F172A] min-h-screen">
      
      {/* 1. HERO HEADER (Clean Editorial Academy Hub with 2D Visual) */}
      <section className="w-full pt-10 pb-8 relative overflow-hidden border-b border-slate-200/80 bg-white/60">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] pointer-events-none opacity-50"
          style={{
            background: 'radial-gradient(circle at 50% 15%, rgba(13, 148, 136, 0.12) 0%, rgba(241, 245, 249, 0) 70%)',
          }}
        />

        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 text-left">
              <h1 className="text-3xl sm:text-5xl font-black text-[#143826] tracking-tight leading-tight">
                Laboratorium Bedah Modus <br />
                <span className="text-[#E86A33]">&amp; Ensiklopedia Penipuan Digital.</span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed font-medium">
                Pelajari anatomi trik psikologis, manipulasi teknis, dan ciri fisik pesan penipuan melalui simulasi interaktif sebelum Anda menjadi korban berikutnya.
              </p>

              {/* Navigation Mode Switcher Segmented Control */}
              <div className="pt-3 space-y-2">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#143826]/70 uppercase block">
                  Pilih Modul Pembelajaran:
                </span>
                <div className="inline-flex p-1 bg-white/95 rounded-2xl border border-[#143826]/15 shadow-xs max-w-full overflow-x-auto gap-1">
                  <button
                    onClick={() => setActiveTab('anatomi')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      activeTab === 'anatomi'
                        ? 'bg-[#143826] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Bedah Kasus Interaktif</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('katalog')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      activeTab === 'katalog'
                        ? 'bg-[#143826] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Katalog Modus Populer</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('kamus')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      activeTab === 'kamus'
                        ? 'bg-[#143826] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    <span>Kamus Istilah Siber</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2D Cartoon Illustration on the right */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <AcademyIllustration className="w-64 h-48 sm:w-72 sm:h-56" />
            </div>

          </div>
        </div>
      </section>

      {/* 2. MAIN BODY CONTENT */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-12 w-full space-y-12">
        
        {/* ========================================================================= */}
        {/* TAB 1: INTERACTIVE ANATOMY LAB (BEDAH KASUS BERGAMBAR DENGAN HOTSPOT PIN) */}
        {/* ========================================================================= */}
        {activeTab === 'anatomi' && (
          <div className="space-y-10 text-left">
            
            {/* Case Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#143826] tracking-tight">
                  Pilih Kasus untuk Dibedah:
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Klik titik bernomor (hotspot) pada chat untuk mengungkap manipulasi tersembunyinya.
                </p>
              </div>

              <div className="p-1 bg-gray-100/90 rounded-2xl border border-gray-200 flex items-center gap-1 overflow-x-auto max-w-full">
                {anatomyCases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCaseId(c.id);
                      setSelectedHotspotId(c.hotspots[0]?.id || 'h1');
                    }}
                    className={`btn-animate px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeCaseId === c.id
                        ? 'bg-[#143826] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Showcase (Mockup on Left + Hotspot Explanation on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Simulated Chat / Message UI with Hotspots */}
              <div className="lg:col-span-7 bg-[#EFEAE2] rounded-3xl p-3.5 sm:p-6 lg:p-8 border border-gray-300 shadow-card space-y-4 sm:space-y-6 relative overflow-hidden">
                
                {/* Header Chat Bar */}
                <div className="bg-[#143826] text-white p-3 sm:p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      {renderSenderAvatar(currentCase.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5 truncate">
                        <span className="truncate">{currentCase.senderName}</span>
                      </div>
                      <div className="text-[10px] text-emerald-300 font-mono mt-0.5 truncate">
                        {currentCase.senderPhone}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-gray-300 px-2 py-0.5 rounded bg-white/10 shrink-0 ml-2">
                    SIMULASI CHAT
                  </span>
                </div>

                {/* Simulated WhatsApp Chat Bubble */}
                <div className="max-w-xl mx-auto space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                  
                  <div className="relative bg-white rounded-2xl rounded-tl-none p-3.5 sm:p-5 shadow-md border border-gray-200 space-y-3 text-left text-xs sm:text-sm text-gray-800 leading-relaxed">
                    
                    {/* Hotspot 1 Pin: Pengirim Asing */}
                    <button
                      onClick={() => setSelectedHotspotId(currentCase.hotspots[0].id)}
                      className={`absolute -top-3 left-3 sm:-left-3 sm:-top-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs flex items-center justify-center shadow-md ring-2 sm:ring-4 cursor-pointer transition-transform hover:scale-110 z-10 ${
                        selectedHotspotId === currentCase.hotspots[0].id
                          ? 'bg-[#E86A33] text-white ring-orange-300 scale-105'
                          : 'bg-white text-gray-800 border-2 border-[#E86A33] ring-orange-100'
                      }`}
                      title="Klik untuk menganalisis nomor pengirim"
                    >
                      {currentCase.hotspots[0].pinNumber}
                    </button>

                    {/* Chat Text Message */}
                    <div className="relative pr-7 pt-1">
                      <p className="font-normal text-gray-800 leading-relaxed text-xs sm:text-sm">
                        {currentCase.chatMessage}
                      </p>

                      {/* Hotspot 2 Pin: Manipulasi Urgensi / Teks */}
                      <button
                        onClick={() => setSelectedHotspotId(currentCase.hotspots[1].id)}
                        className={`absolute -top-2 right-1 sm:right-2 w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shadow-md ring-2 cursor-pointer transition-transform hover:scale-110 z-10 ${
                          selectedHotspotId === currentCase.hotspots[1].id
                            ? 'bg-[#143826] text-white ring-emerald-300 scale-105'
                            : 'bg-white text-[#143826] border-2 border-[#143826] ring-emerald-100'
                        }`}
                        title="Klik untuk membedah rekayasa sosial"
                      >
                        {currentCase.hotspots[1].pinNumber}
                      </button>
                    </div>

                    {/* Attachment / Preview / Hotspot 3 Box */}
                    {currentCase.attachmentName ? (
                      <div className="relative p-2.5 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2 mt-2 w-full max-w-full overflow-hidden">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                            APK
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-gray-900 truncate">
                              {currentCase.attachmentName}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono truncate">
                              {currentCase.attachmentSize} &bull; Berkas Aplikasi Android
                            </div>
                          </div>
                        </div>

                        {/* Hotspot 3 Pin: Ekstensi Berbahaya */}
                        <button
                          onClick={() => setSelectedHotspotId(currentCase.hotspots[2].id)}
                          className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shadow-md ring-2 transition-transform shrink-0 cursor-pointer ml-1 ${
                            selectedHotspotId === currentCase.hotspots[2].id
                              ? 'bg-[#E86A33] text-white ring-orange-300 scale-105'
                              : 'bg-white text-gray-800 border-2 border-[#E86A33] ring-orange-100'
                          }`}
                          title="Klik untuk mengungkap bahaya file .APK"
                        >
                          {currentCase.hotspots[2].pinNumber}
                        </button>
                      </div>
                    ) : currentCase.attachmentType === 'link' ? (
                      <div className="relative p-2.5 sm:p-3 rounded-xl bg-red-50/80 border border-red-200 flex items-center justify-between gap-2 mt-2 w-full max-w-full overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-mono text-red-700 font-bold truncate">
                            http://bca-klik.com.secure-login-update.xyz/...
                          </div>
                          <div className="text-[10px] text-red-500 font-sans">
                            Tautan Typosquatting / Tidak Aman
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedHotspotId(currentCase.hotspots[2].id)}
                          className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shadow-md ring-2 transition-transform shrink-0 cursor-pointer ml-1 ${
                            selectedHotspotId === currentCase.hotspots[2].id
                              ? 'bg-[#E86A33] text-white ring-orange-300 scale-105'
                              : 'bg-white text-gray-800 border-2 border-[#E86A33] ring-orange-100'
                          }`}
                          title="Klik untuk bedah link phishing"
                        >
                          {currentCase.hotspots[2].pinNumber}
                        </button>
                      </div>
                    ) : (
                      <div className="relative p-2.5 sm:p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-2 mt-2 w-full max-w-full overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-sans text-amber-900 font-bold truncate">
                            Komisi Awal Rp 30.000 Cair Instan
                          </div>
                          <div className="text-[10px] text-amber-700 font-sans">
                            Trik Umpan Kepercayaan (Baiting)
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedHotspotId(currentCase.hotspots[2].id)}
                          className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shadow-md ring-2 transition-transform shrink-0 cursor-pointer ml-1 ${
                            selectedHotspotId === currentCase.hotspots[2].id
                              ? 'bg-[#E86A33] text-white ring-orange-300 scale-105'
                              : 'bg-white text-gray-800 border-2 border-[#E86A33] ring-orange-100'
                          }`}
                          title="Klik untuk bedah trik komisi"
                        >
                          {currentCase.hotspots[2].pinNumber}
                        </button>
                      </div>
                    )}

                    {/* Hotspot 4 Pin (footer badge) */}
                    {currentCase.hotspots[3] && (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-[11px] text-gray-400">
                        <span>{currentCase.timeString} WIB &bull; Terkirim</span>
                        <button
                          onClick={() => setSelectedHotspotId(currentCase.hotspots[3].id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            selectedHotspotId === currentCase.hotspots[3].id
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                            selectedHotspotId === currentCase.hotspots[3].id
                              ? 'bg-white text-red-600'
                              : 'bg-red-600 text-white'
                          }`}>
                            {currentCase.hotspots[3].pinNumber}
                          </span>
                          <span className="truncate max-w-[170px] sm:max-w-none">
                            {currentCase.hotspots[3].label}
                          </span>
                        </button>
                      </div>
                    )}

                  </div>

                </div>

                {/* Hotspot Quick Dock: 1 | 2 | 3 | 4 buttons */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
                  <span className="text-[11px] font-bold text-gray-600 mr-1 hidden sm:inline">Pilih Titik:</span>
                  {currentCase.hotspots.map((h) => {
                    const isSelected = selectedHotspotId === h.id;
                    return (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHotspotId(h.id)}
                        className={`h-8 px-2.5 sm:px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                          isSelected
                            ? 'bg-[#143826] text-white ring-2 ring-emerald-300'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isSelected ? 'bg-[#E86A33] text-white' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {h.pinNumber}
                        </span>
                        <span className="text-[11px] hidden min-[480px]:inline truncate max-w-[120px]">
                          {h.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Responsive Instruction Note */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 backdrop-blur border border-gray-300 text-xs text-gray-600 text-center leading-relaxed">
                  <em>
                    Klik salah satu lingkaran pin bernomor di atas untuk melihat pembongkaran triknya{' '}
                    <span className="hidden lg:inline">di samping</span>
                    <span className="lg:hidden">di bawah</span>.
                  </em>
                </div>

              </div>

              {/* Right Column: Detailed Breakdown of Selected Hotspot */}
              <div className="lg:col-span-5 space-y-6">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHotspot.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-white border border-[#E8ECE9] shadow-card space-y-4 sm:space-y-6 text-left"
                  >
                    
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold uppercase tracking-wider">
                          TITIK ANATOMI #{currentHotspot.pinNumber}
                        </span>
                        <span className="text-xs text-gray-400 font-mono capitalize">
                          Kategori: {currentHotspot.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-[#143826] leading-snug">
                        {currentHotspot.label}
                      </h3>
                    </div>

                    {/* Trigger Text Quote */}
                    <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">
                        BAGIAN JEBAKAN PADA CHAT:
                      </span>
                      <p className="text-xs font-mono font-bold text-[#E86A33]">
                        {currentHotspot.triggerText}
                      </p>
                    </div>

                    {/* Deep Explanation */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider">
                        BEDAH TRIK PENIPU:
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                        {currentHotspot.explanation}
                      </p>
                    </div>

                    {/* Action Button: Test this in Scamora Detector */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleTestInScanner(currentCase.presetTarget)}
                        className="btn-animate inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition w-full shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 text-[#E86A33] fill-[#E86A33]" />
                        <span>Uji Kasus Ini di Scanner Scamora</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                </AnimatePresence>

                {/* Quick Navigation to Other Hotspots */}
                <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#CFDDD5] space-y-2 text-left">
                  <span className="text-xs font-bold text-[#143826] block">
                    Semua Titik Bahaya pada Kasus Ini:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentCase.hotspots.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHotspotId(h.id)}
                        className={`p-2.5 rounded-xl text-xs text-left transition font-medium flex items-center gap-2 ${
                          selectedHotspotId === h.id
                            ? 'bg-[#143826] text-white font-bold shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                          selectedHotspotId === h.id ? 'bg-[#E86A33] text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {h.pinNumber}
                        </span>
                        <span className="truncate">{h.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SCAM CARDS DIRECTORY (KATALOG MODUS DILENGKAPI DIAGRAM VISUAL)     */}
        {/* ========================================================================= */}
        {activeTab === 'katalog' && (
          <div className="space-y-8 text-left">
            
            {/* Search & Filter Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-2xl font-black text-[#143826] tracking-tight">
                  Katalog Ragam Modus Kejahatan Siber
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Koleksi taktik penipuan digital yang paling banyak memakan korban di Indonesia saat ini disertai diagram alur visual.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari kata kunci modus..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#143826] transition shadow-2xs"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'malware', label: 'Malware .APK' },
                { id: 'social', label: 'Social Engineering' },
                { id: 'phishing', label: 'Phishing Domain' },
                { id: 'panggilan', label: 'Panggilan Telepon' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setCatalogFilter(chip.id)}
                  className={`btn-animate px-4 py-2 rounded-full text-xs font-bold transition ${
                    catalogFilter === chip.id
                      ? 'bg-[#143826] text-white shadow-2xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Cards Grid with Embedded Visual Diagrams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="pomaii-card p-6 sm:p-8 rounded-3xl bg-white border border-[#E8ECE9] shadow-card space-y-6 flex flex-col justify-between text-left hover:shadow-lift transition-all"
                >
                  <div className="space-y-4">
                    
                    {/* Top Row: Category & Severity */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold">
                        {item.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${item.severityColor}`}>
                        TINGKAT BAHAYA: {item.severity}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#143826] leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {item.summary}
                    </p>

                    {/* EMBEDDED VISUAL DIAGRAM / FLOW (MENGIRINGI INFORMASI) */}
                    <div className="pt-1">
                      {renderCatalogDiagram(item.diagramType)}
                    </div>

                    {/* Metadata Badges */}
                    <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-bold">Sasaran Korban:</span>
                        <span className="text-gray-500 truncate">{item.targetVictim}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-bold">Media Penyebaran:</span>
                        <span className="text-gray-500 truncate">{item.channel}</span>
                      </div>
                    </div>

                    {/* Taktik Penipu */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Taktik Utama Penipu:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-gray-600">
                        {item.tactics.map((tac, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">&bull;</span>
                            <span>{tac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cara Pencegahan */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="text-xs font-bold text-[#143826] flex items-center gap-1.5 uppercase font-mono tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Langkah Pencegahan Mutlak:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-gray-600">
                        {item.prevention.map((prev, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{prev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      to={item.linkType === 'url' ? '/url' : item.linkType === 'chat' ? '/chat' : '/panduan'}
                      className="btn-animate inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#EAF2ED] hover:bg-[#DDE8E2] text-[#143826] text-xs font-bold transition w-full"
                    >
                      <span>{item.linkType === 'panduan' ? 'Buka Panduan Tanggap Insiden' : 'Uji Contoh Kasus di Scanner'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CYBER SCAM GLOSSARY (KAMUS DILENGKAPI MOCKUP VISUAL MINI DI SETIAP KARTU) */}
        {/* ========================================================================= */}
        {activeTab === 'kamus' && (
          <div className="space-y-8 text-left">
            
            <div className="border-b border-gray-200 pb-5">
              <h2 className="text-2xl font-black text-[#143826] tracking-tight">
                Kamus Istilah Kejahatan Siber untuk Awam
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Istilah teknis yang sering Anda dengar di media dijelaskan dengan diagram mini dan analogi kehidupan sehari-hari.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {glossaryItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="pomaii-card p-6 rounded-3xl bg-white border border-[#E8ECE9] shadow-sm hover:shadow-card transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-[10px] font-bold">
                        {item.tag}
                      </span>
                      <span className="text-gray-300 font-mono text-xs">#{idx + 1}</span>
                    </div>

                    <h3 className="text-lg font-black text-[#143826]">
                      {item.term}
                    </h3>

                    {/* VISUALISASI MINI MOCKUP DI SETIAP KARTU */}
                    <div className="pt-1">
                      {renderGlossaryVisual(item.iconType)}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      {item.definition}
                    </p>
                  </div>

                  {/* Analogi Sehari-hari dengan Ikon Bohlam (No Sparkles / No Stars) */}
                  <div className="p-3.5 rounded-2xl bg-[#FDF0E9] border border-orange-100 text-[11px] text-[#B44616] space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-xs text-[#E86A33]">
                      <Lightbulb className="w-3.5 h-3.5 text-[#E86A33]" />
                      Analogi Mudah:
                    </span>
                    <p className="leading-relaxed font-normal">
                      {item.analogy}
                    </p>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* 3. CTA BRIDGE TO QUIZ / SCANNER (Tanpa Sparkles atau Bintang) */}
        <div className="p-8 sm:p-12 rounded-[36px] bg-[#143826] text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left shadow-2xl relative overflow-hidden">
          
          <div className="lg:col-span-8 space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-[#E86A33]" />
              <span>UJI PEMAHAMAN ANDA SEKARANG</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Seberapa Tajam Insting Anda <br />
              <span className="text-[#E86A33]">Mengenali Penipuan Digital?</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Setelah mempelajari anatomi, visual alur modus, dan istilah di atas, uji kepekaan Anda menghadapi 6 simulasi skenario penipuan interaktif di Tantangan AI Scamora.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 relative z-10">
            <Link
              to="/kuis"
              className="btn-animate inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition"
            >
              <span>Mulai Tantangan Kuis AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/url"
              className="btn-animate inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Periksa Tautan Mencurigakan</span>
            </Link>
          </div>

          {/* Background Decorative Shield Watermark */}
          <div className="absolute right-0 bottom-0 p-4 opacity-15 pointer-events-none select-none text-white">
            <ShieldCheck className="w-36 h-36 sm:w-56 sm:h-56" />
          </div>

        </div>

      </main>

    </div>
  );
};
