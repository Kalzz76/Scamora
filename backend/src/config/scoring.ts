import type { IndicatorSeverity, IndicatorSource } from '../types/analysis';

export const SCORE_THRESHOLDS = {
  HIGH_MIN: 60,
  REVIEW_MIN: 30,
};

export const CRITICAL_INDICATOR_TYPES = [
  'safe_browsing_match',
  'otp_request',
];

export const URL_INDICATOR_WEIGHTS: Record<string, number> = {
  safe_browsing_match: 60,
  typosquatting: 35,
  punycode_homograph: 30,
  brand_in_subdomain: 30,
  ip_host: 25,
  userinfo_in_url: 20,
  url_shortener: 15,
  excessive_subdomains: 10,
  risky_tld: 10,
  no_https: 10,
  sensitive_keywords: 10,
  unusual_port: 10,
  long_encoded_url: 5,
};

export const CHAT_INDICATOR_WEIGHTS: Record<string, number> = {
  otp_request: 30,
  advance_fee: 30,
  threat_link: 30,
  impersonation_data: 30,
  unrealistic_offer: 15,
  time_pressure: 15,
  move_platform: 15,
  guaranteed_profit: 15,
  odd_language: 5,
  unknown_sender: 5,
};

export const INDICATOR_TITLES: Record<string, string> = {
  safe_browsing_match: 'Terdaftar pada Basis Data Ancaman Google Safe Browsing',
  typosquatting: 'Kemiripan Nama Domain dengan Merek Resmi (Typosquatting)',
  punycode_homograph: 'Karakter Punycode Homograf Menyerupai Huruf Asli',
  brand_in_subdomain: 'Pencatutan Nama Merek pada Subdomain',
  ip_host: 'Tautan Menggunakan Alamat IP Langsung',
  userinfo_in_url: 'Penyisipan Kredensial Login di dalam URL',
  url_shortener: 'Penggunaan Layanan Pemendek Tautan',
  excessive_subdomains: 'Jumlah Subdomain Berlebihan',
  risky_tld: 'Domain Menggunakan Ekstensi Berisiko Tinggi',
  no_https: 'Koneksi Tidak Terenkripsi (HTTP)',
  sensitive_keywords: 'Kata Kunci Sensitif pada Alamat Tautan',
  unusual_port: 'Penggunaan Port Tidak Lazim',
  long_encoded_url: 'Tautan Sangat Panjang atau Banyak Karakter Ter-encode',
  otp_request: 'Permintaan Kode Rahasia / OTP',
  advance_fee: 'Permintaan Biaya atau Uang di Muka',
  threat_link: 'Tautan Disertai Ancaman Pemblokiran Akun',
  impersonation_data: 'Pencatutan Identitas Resmi Sambil Meminta Data',
  unrealistic_offer: 'Penawaran Komisi atau Hadiah Tidak Wajar',
  time_pressure: 'Tekanan Waktu agar Segera Mengambil Tindakan',
  move_platform: 'Ajakan Berpindah Komunikasi ke Platform Lain',
  guaranteed_profit: 'Janji Keuntungan Pasti Tanpa Risiko',
  odd_language: 'Gaya Bahasa Janggal atau Tata Kalimat Mencurigakan',
  unknown_sender: 'Pesan dari Nomor Tidak Dikenal',
};

export const INDICATOR_DEFAULT_SOURCES: Record<string, IndicatorSource> = {
  safe_browsing_match: 'threat_db',
  typosquatting: 'url_structure',
  punycode_homograph: 'url_structure',
  brand_in_subdomain: 'url_structure',
  ip_host: 'url_structure',
  userinfo_in_url: 'url_structure',
  url_shortener: 'url_structure',
  excessive_subdomains: 'url_structure',
  risky_tld: 'url_structure',
  no_https: 'url_structure',
  sensitive_keywords: 'url_structure',
  unusual_port: 'url_structure',
  long_encoded_url: 'url_structure',
  otp_request: 'ai',
  advance_fee: 'ai',
  threat_link: 'ai',
  impersonation_data: 'ai',
  unrealistic_offer: 'ai',
  time_pressure: 'ai',
  move_platform: 'ai',
  guaranteed_profit: 'ai',
  odd_language: 'ai',
  unknown_sender: 'ai',
};

export const SENSITIVE_QUERY_PARAMS = [
  'token',
  'access_token',
  'api_key',
  'key',
  'secret',
  'password',
  'otp',
  'code',
  'session',
  'sid',
  'auth',
  'signature',
];

export function getSeverityFromWeight(weight: number): IndicatorSeverity {
  if (weight >= 30) {
    return 'high';
  }
  if (weight >= 15) {
    return 'medium';
  }
  return 'low';
}

