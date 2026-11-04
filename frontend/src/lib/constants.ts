import type { DemoPreset, RiskLevel } from '../types/analysis';

export const APP_CONFIG = {
  NAME: 'Scamora AI',
  FULL_NAME: 'Scamora - Platform Pendeteksi Potensi Penipuan Digital Berbasis AI',
  TAGLINE: 'Autonomous Digital Threat Defense',
  EVENT: 'MIT-Week 2026 Innovation Challenge',
  VERSION: '2.0.0-react',
};

export const RISK_CATEGORIES: Record<RiskLevel, {
  label: string;
  badgeBg: string;
  badgeText: string;
  containerBg: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  description: string;
}> = {
  high: {
    label: 'Indikasi risiko tinggi',
    badgeBg: 'bg-[#DC2626]',
    badgeText: 'text-white font-bold',
    containerBg: 'bg-[#FEF2F2]',
    borderColor: 'border-[#DC2626]/20',
    textColor: 'text-[#991B1B]',
    accentColor: '#DC2626',
    description: 'Banyak atau kuat tanda bahaya. Hindari bertindak, mentransfer dana, atau mengklik tautan sebelum diverifikasi pihak berwenang.',
  },
  review: {
    label: 'Perlu ditinjau lebih lanjut',
    badgeBg: 'bg-[#E86A33]',
    badgeText: 'text-white font-bold',
    containerBg: 'bg-[#FDF0E9]',
    borderColor: 'border-[#E86A33]/30',
    textColor: 'text-[#B44616]',
    accentColor: '#E86A33',
    description: 'Ada indikasi yang perlu diwaspadai atau data/pemeriksaan belum lengkap untuk menarik kesimpulan pasti. Lakukan verifikasi manual mandiri.',
  },
  low: {
    label: 'Indikator risiko rendah',
    badgeBg: 'bg-[#143826]',
    badgeText: 'text-white font-bold',
    containerBg: 'bg-[#EAF2ED]',
    borderColor: 'border-[#143826]/20',
    textColor: 'text-[#143826]',
    accentColor: '#143826',
    description: 'Tidak ditemukan anomali atau tanda bahaya signifikan pada pemeriksaan saat ini. Tetap waspada terhadap perubahan konteks percakapan.',
  },
};

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'url-bank-phishing',
    type: 'url',
    title: 'Phishing BCA Internet Banking',
    subtitle: 'Typosquatting & Subdomain Masking',
    content: 'http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true&token=rahasia123',
    expectedCategory: 'high',
    expectedScore: 95,
    scamType: 'phishing',
    tags: ['Bank', 'Typosquatting', 'HTTP'],
  },
  {
    id: 'url-legit-store',
    type: 'url',
    title: 'Toko Online Resmi Indonesia',
    subtitle: 'Domain Terverifikasi & HTTPS Resmi',
    content: 'https://tokopedia.com/promo/guncang-sepatu-sneakers',
    expectedCategory: 'low',
    expectedScore: 0,
    scamType: 'unknown',
    tags: ['E-Commerce', 'HTTPS', 'Aman'],
  },
  {
    id: 'url-shortener-redirect',
    type: 'url',
    title: 'URL Shortener Mencurigakan',
    subtitle: 'Tautan Pendek Tanpa Transparansi Tujuan',
    content: 'https://bit.ly/undian-bca-resmi-hadiah2026',
    expectedCategory: 'review',
    expectedScore: 45,
    scamType: 'phishing',
    tags: ['Shortener', 'Unverified'],
  },
  {
    id: 'chat-job-freelance',
    type: 'chat',
    title: 'Lowongan Kerja Like/Follow Bodong',
    subtitle: 'Komisi Fantastis + Biaya Pendaftaran Awal',
    content: 'Halo kak! Kami dari Talent Agency Shopee Indonesia. Ada tugas part-time online cuma like & subscribe video YouTube, komisi 500rb - 2jt per hari. Kerja fleksibel dari rumah. Tapi sebelum mulai, ada biaya deposit jaminan aktivasi sistem Rp 150.000 ke rekening bendahara kami ya. Cepat kak slot tinggal 2 orang!',
    expectedCategory: 'high',
    expectedScore: 85,
    scamType: 'job_scam',
    tags: ['Lowongan', 'Uang Muka', 'Desakan'],
  },
  {
    id: 'chat-apk-kurir',
    type: 'chat',
    title: 'Modus Paket Kurir Ekspedisi .APK',
    subtitle: 'Pengiriman Berkas Malicious Android APK',
    content: 'Selamat siang paket anda tertahan di gudang J&T Express karena alamat tidak lengkap. Mohon unduh dan instal file resi digital berikut untuk konfirmasi: Resi_Paket_JNT_Express.apk. Segera ya supaya tidak dikembalikan ke pengirim.',
    expectedCategory: 'high',
    expectedScore: 90,
    scamType: 'apk_malware',
    tags: ['APK Kurir', 'Malware', 'Urgent'],
  },
  {
    id: 'chat-customer-service-resmi',
    type: 'chat',
    title: 'Pesan Konfirmasi CS Standar',
    subtitle: 'Komunikasi Ramah Tanpa Permintaan Data Rahasia',
    content: 'Halo Kak Budi, terima kasih telah berbelanja di Toko Sejahtera. Pesanan #88291 sedang dikemas oleh tim gudang kami dan akan diserahkan ke kurir sore ini. Resi pengiriman akan terupdate otomatis di aplikasi Anda. Ada yang bisa kami bantu lagi?',
    expectedCategory: 'low',
    expectedScore: 0,
    scamType: 'unknown',
    tags: ['CS Resmi', 'Normal', 'No PII'],
  },
];

