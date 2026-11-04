import {
  CHAT_INDICATOR_WEIGHTS,
  getSeverityFromWeight,
  INDICATOR_TITLES,
} from '../../config/scoring';
import type { Indicator } from '../../types/analysis';

function buildChatIndicator(
  type: string,
  evidence: string,
  description: string
): Indicator {
  const weight = CHAT_INDICATOR_WEIGHTS[type] || 15;
  const severity = getSeverityFromWeight(weight);
  const title = INDICATOR_TITLES[type] || type;

  return {
    type,
    title,
    severity,
    weight,
    source: 'chat_heuristic',
    evidence,
    description,
  };
}

export function scanChatPatterns(text: string): Indicator[] {
  const indicators: Indicator[] = [];
  const lower = text.toLowerCase();

  if (/(kode otp|kirimkan otp|minta otp|sms \d+ digit|pin anda|kode verifikasi|kode rahasia|kirimkan kode)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:otp|pin|digit|kode verifikasi)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'otp_request',
        match ? match[0].trim() : 'permintaan kode verifikasi',
        'Terdapat permintaan kode rahasia atau otentikasi yang berisiko pengambilalihan akun.'
      )
    );
  }

  if (/(biaya|deposit|uang muka|bayar pendaftaran|transfer dulu|administrasi|ongkir dulu|top up dulu)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:biaya|deposit|uang muka|administrasi|transfer)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'advance_fee',
        match ? match[0].trim() : 'permintaan biaya di muka',
        'Pelaku mewajibkan korban melakukan transfer atau pembayaran biaya sebelum proses dilanjutkan.'
      )
    );
  }

  if (/(diblokir|penangguhan akun|rekening dibekukan|hukuman|segera klik link|tautan berikut|klik tautan)\b/i.test(lower) && /(https?:\/\/|tautan|link|bit\.ly)/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:diblokir|dibekukan|klik|link)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'threat_link',
        match ? match[0].trim() : 'tautan ancaman blokir',
        'Menyertakan tautan dengan ancaman pemblokiran akses jika tidak segera dibuka.'
      )
    );
  }

  if (/(kami dari|resmi shopee|pihak bank|customer service|petugas kepolisian|kurir j&t|tim admin|kantor pusat)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:kami dari|resmi|pihak bank|customer service|petugas)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'impersonation_data',
        match ? match[0].trim() : 'pengakuan pihak resmi',
        'Mengatasnamakan entitas atau pejabat resmi untuk membangun kepercayaan semu.'
      )
    );
  }

  if (/(komisi \d+|gaji.*per hari|ratusan ribu|jutaan rupiah|like.*subscribe|pekerjaan paruh waktu|tugas mudah|part time)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:komisi|gaji|juta|like|part time|tugas)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'unrealistic_offer',
        match ? match[0].trim() : 'penawaran komisi fantastis',
        'Imbalan pendapatan tidak wajar untuk tugas yang sangat ringan.'
      )
    );
  }

  if (/(segera|hanya hari ini|slot terbatas|dalam \d+ menit|sebelum hangus|waktu tersisa|buru-buru)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:segera|slot|terbatas|hari ini|menit|hangus)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'time_pressure',
        match ? match[0].trim() : 'tekanan batas waktu',
        'Menciptakan kepanikan batas waktu agar korban terburu-buru mengambil keputusan.'
      )
    );
  }

  if (/(pindah ke telegram|hubungi telegram|chat telegram|wa nomor lain|hubungi nomor ini|lanjut di telegram)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:telegram|nomor lain|nomor ini)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'move_platform',
        match ? match[0].trim() : 'ajakan beralih aplikasi',
        'Mengarahkan komunikasi ke platform lain yang lebih sulit dilacak.'
      )
    );
  }

  if (/(keuntungan pasti|profit pasti|dijamin untung|pasti cair|garansi kembali|100% aman untung)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:pasti|garansi|untung|cair)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'guaranteed_profit',
        match ? match[0].trim() : 'janji imbal hasil pasti',
        'Menjanjikan pengembalian keuntungan pasti yang bertentangan dengan prinsip investasi wajar.'
      )
    );
  }

  if (/(ybs|dgn hormat rekan|segera tindak lanjuti permohonan diatas|kpd bpk\/ibu)\b/i.test(lower)) {
    const match = text.match(/([^\.\n]*?(?:ybs|tindak lanjuti|kpd)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'odd_language',
        match ? match[0].trim() : 'gaya bahasa janggal',
        'Tata kalimat janggal atau penggunaan singkatan kaku yang tidak wajar.'
      )
    );
  }

  if (/(halo kak apa kabar|selamat siang dengan siapa ini|ini nomor siapa ya)\b/i.test(lower) && indicators.length === 0) {
    const match = text.match(/([^\.\n]*?(?:halo|siang|siapa)[^\.\n]*)/i);
    indicators.push(
      buildChatIndicator(
        'unknown_sender',
        match ? match[0].trim() : 'sapaan nomor tidak dikenal',
        'Pesan sapaan dari kontak yang belum dikenal tanpa indikasi ancaman lain.'
      )
    );
  }

  return indicators;
}

