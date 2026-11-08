export function formatNetworkError(err: any): string {
  if (!err) return 'Koneksi gagal atau tidak merespons.';
  const msg = typeof err === 'string' ? err : err.message || '';
  if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
    return 'Domain tidak terdaftar di DNS atau server tidak ditemukan.';
  }
  if (msg.includes('ECONNREFUSED')) {
    return 'Koneksi ditolak oleh server target.';
  }
  if (msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
    return 'Waktu koneksi habis (server tidak merespons).';
  }
  if (msg.includes('ECONNRESET')) {
    return 'Koneksi diputus secara tiba-tiba oleh server.';
  }
  if (msg.includes('CERT_') || msg.includes('unable to verify') || msg.includes('self-signed')) {
    return 'Sertifikat keamanan SSL tidak valid atau bermasalah.';
  }
  return msg;
}
