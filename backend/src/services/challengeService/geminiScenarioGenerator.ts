import { env } from '../../config/env';
import type { ChallengeScenario, DifficultyLevel } from '../../types/challenge';
import { SEED_SCENARIOS } from '../../data/seedScenarios';

export interface GenerateScenarioRequest {
  categoryId: string;
  difficulty: DifficultyLevel;
  topicPrompt?: string;
}

const SCENARIO_ANGLES: Record<string, string[]> = {
  'kurir-apk': [
    'Ekspedisi SiCepat: Paket elektronik berharga tertahan karena label barcode sobek. Kurir meminta membuka aplikasi pembaca resi digital "SiCepat_Barcode_Scan.apk".',
    'Ekspedisi Anteraja: Paket COD senilai Rp 950.000 atas nama Anda hendak diantar hari ini. Jika merasa tidak memesan, Anda disuruh mengisi form pembatalan kiriman via "Form_Retur_Batal_Anteraja.apk".',
    'Shopee Xpress: Kurir mengaku sudah berada di dekat perumahan tetapi GPS maps error. Kurir mengirimkan berkas "Peta_Lokasi_Titik_Antar.apk" untuk memandu arah.',
    'JNE Express: Somasi kerusakan barang kiriman cair yang tumpah mengenai paket berharga lain. Kurir menuntut validasi klaim asuransi melalui file "Surat_Ganti_Rugi_JNE.apk".',
    'Pos Indonesia: Kiriman dokumen ijazah/berkas resmi tertahan di Bea Cukai karena salah data penerima. Verifikasi manifest diminta lewat "Pos_Manifest_Checker.apk".',
    'Ninja Xpress: Notifikasi mendesak perubahan jadwal kiriman sebelum batas waktu sistem pukul 17:00, mengirim berkas "Resi_Ekspedisi_Ninja.apk".',
  ],
  'bank-phishing': [
    'Halo BCA CS: Surat edaran direksi mengenai penyesuaian tarif transfer otomatis menjadi Rp 150.000/bulan. Korban diminta membuka tautan formulir keberatan pembatalan tarif dalam 30 menit.',
    'Customer Care Mandiri Livin: Terdeteksi aktivitas transfer Rp 18.500.000 dari perangkat iPhone di luar negeri. Korban diminta segera menghentikan transaksi via portal autentikasi darurat.',
    'BRImo Security Center: Peringatan persetujuan pinjaman digital Rp 25.000.000 yang sedang diproses. Jika merasa tidak mengajukan, segera klik link verifikasi pembatalan dan masukkan kode otorisasi.',
    'BNI Priority Support: Penawaran upgrade kartu debit bebas biaya admin selamanya untuk nasabah setia dengan syarat memverifikasi nomor CVV dan 6 digit kode OTP.',
    'Bank Danamon Rewards: Pemberitahuan poin reward perbankan senilai voucher belanja Rp 2.000.000 akan hangus malam ini pukul 23:59.',
  ],
  'job-scam': [
    'Reviewer Google Maps & Hotel Bintang 5: Komisi Rp 35.000 per ulasan. Pelaku langsung mentransfer uang muka Rp 50.000 ke GoPay korban untuk memancing rasa percaya sebelum meminta top-up deposit tugas VIP.',
    'Affiliate Marketing TikTok / Shopee: Tugas sederhana like video dan follow akun berbayar Rp 20.000 per video, lalu diarahkan ke grup Telegram untuk misi investasi berhadiah mobil.',
    'Freelance Pengetikan Dokumen Rahasia: Lowongan paruh waktu mengetik ulang berkas PDF ke Word berbayar Rp 4.000.000/minggu, dengan syarat membayar deposit jaminan materi kerja.',
    'Perekrut Talent Internasional: Headhunter mengatasnamakan korporasi global menawarkan posisi freelance app tester dengan mengunduh aplikasi uji coba .apk.',
  ],
  'tilang-etle': [
    'Ditlantas Polda Metro Jaya: Surat konfirmasi tilang kamera ETLE jalan tol batas kecepatan tinggi, melampirkan berkas bukti "Surat_Tilang_ETLE_Polda.apk".',
    'Satlantas Polres: Peringatan denda tilang pelanggaran ganjil-genap dan ancaman pemblokiran STNK dalam 1x24 jam jika tidak membuka aplikasi konfirmasi perkara.',
    'Panitera Pengadilan Negeri: Undangan panggilan sidang elektronik pelanggaran lalu lintas dengan ancaman eksekusi penahanan kendaraan.',
  ],
  'undian-belanja': [
    'Gebyar Hadiah Belanja Shopee/Tokopedia: Pengumuman pemenang uang tunai Rp 120.000.000, melampirkan ID card staf legal palsu dan meminta transfer pajak pemenang ke rekening pribadi.',
    'Kasir Minimarket Alfamart / Indomaret: Kasir panik memohon bantuan karena keliru ketik nomor voucher game, memohon korban membagikan kode OTP SMS 6 digit yang masuk ke HP korban.',
    'Refund Dana Belanja: Notifikasi pembayaran belanja marketplace gagal tetapi saldo rekening terpotong ganda, menawarkan klaim pengembalian dana instan lewat website tiruan.',
  ],
};

const DIFFICULTY_GUIDELINES: Record<DifficultyLevel, string> = {
  easy: 'Tingkat Kesulitan: PEMULA. Penipu memakai trik umum yang relatif mudah diendus, nomor HP biasa (+62 8xx), gaya bicara agak kaku atau mendesak, red flag sangat mencolok (ekstensi jelas .apk atau langsung minta uang/OTP). Kontras opsi aman vs bahaya sangat jelas.',
  medium: 'Tingkat Kesulitan: MENENGAH. Penipu lebih rapi, memakai profil bisnis semi-formal, nomor tiket laporan, memanfaatkan manipulasi batas waktu (urgensi 15-30 menit), dan link phishing dengan domain tiruan atau lampiran berbahaya yang dikemas rapi.',
  hard: 'Tingkat Kesulitan: MAHIR. Social engineering tingkat tinggi, bahasa sangat formal dan meyakinkan, menggunakan intimidasi hukum atau kebocoran data pribadi (fear/authority), menuntut verifikasi teliti lintas saluran independen.',
};

// gemini-3.1-flash-lite-preview and gemini-3-flash-preview are fastest and most reliable
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
];

export async function generateScenarioWithGemini(
  request: GenerateScenarioRequest
): Promise<ChallengeScenario> {
  const angles = SCENARIO_ANGLES[request.categoryId] || SCENARIO_ANGLES['kurir-apk'];
  const randomAngle = angles[Math.floor(Math.random() * angles.length)];
  const difficultyGuide = DIFFICULTY_GUIDELINES[request.difficulty] || DIFFICULTY_GUIDELINES.medium;
  const uniqueSeed = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  if (!env.GEMINI_API_KEY) {
    return getFallbackScenario(request.categoryId, request.difficulty, randomAngle);
  }

  const prompt = `Anda adalah pakar edukasi keamanan siber dan perancang simulasi interaktif.
Buat SATU skenario simulasi penipuan percakapan WhatsApp baru yang SANGAT SEGAR, UNIK, dan REALISTIS dalam Bahasa Indonesia.

Informasi Skenario:
- Kategori Modus: "${request.categoryId}"
- Tingkat Kesulitan: "${request.difficulty}"
- Panduan Kesulitan: ${difficultyGuide}
- Sudut Pandang/Konteks Cerita: "${request.topicPrompt ? request.topicPrompt : randomAngle}"
- Variasi Unik Seed: "${uniqueSeed}"

ATURAN WAJIB:
1. JANGAN gunakan cerita kurir J&T Budi yang standar. Buat karakter pengirim baru (nama orang, nama instansi/perusahaan, nomor/peran) yang sesuai konteks di atas.
2. Gaya bahasa percakapan WhatsApp HARUS otentik khas masyarakat Indonesia (sopan, panik, formal, atau santai sesuai peran pelaku).
3. Buat minimal 2 pesan pembuka di initialDialogue (bisa ada pesan teks dan lampiran file/link jika relevan).
4. Buat minimal 1 node percabangan di decisionNodes ("node_1") dengan minimal 2 pilihan tindakan:
   - Minimal 1 opsi berisiko (isSafe: false, scoreImpact: -30 s.d -50)
   - Minimal 1 opsi waspada/aman (isSafe: true, scoreImpact: +35 s.d +50)
   - Setiap opsi wajib memiliki penjelasan edukasi yang tajam dan consequenceDialogue (balasan pelaku/sistem).
5. Buat 2 item redFlags spesifik dari skenario ini dan 2-3 learningPoints praktis.

Kembalikan HANYA JSON valid (tanpa teks pembuka atau markdown di luar JSON) dengan struktur persis ini:
{
  "id": "ai-${Date.now()}",
  "categoryId": "${request.categoryId}",
  "title": "Judul Kasus Menarik dan Spesifik",
  "difficulty": "${request.difficulty}",
  "characterName": "Nama Karakter Penipu (misal: Rian SPX, CS Linda Mandiri)",
  "characterRole": "Peran yang Diklaim Pelaku",
  "characterAvatar": "📱",
  "initialDialogue": [
    { "id": "m1", "sender": "scammer", "text": "Pesan pertama pengirim...", "timestamp": "10:15" },
    { "id": "m2", "sender": "scammer", "text": "Pesan kedua dengan link/file...", "timestamp": "10:16" }
  ],
  "redFlags": [
    { "id": "rf-1", "title": "Nama Indikator Bahaya", "description": "Uraian tanda bahaya pada pesan", "severity": "critical", "category": "social_engineering" },
    { "id": "rf-2", "title": "Nama Indikator Kedua", "description": "Uraian kejanggalan kedua", "severity": "medium", "category": "technical" }
  ],
  "decisionNodes": {
    "node_1": {
      "id": "node_1",
      "prompt": "Pertanyaan tindakan yang harus diambil pengguna?",
      "options": [
        {
          "id": "opt_safe",
          "label": "Tindakan waspada dan kritis...",
          "isSafe": true,
          "scoreImpact": 50,
          "nextNodeId": null,
          "consequenceDialogue": [{ "id": "c1", "sender": "system", "text": "Aman! Serangan penipuan berhasil digagalkan.", "timestamp": "10:17" }],
          "explanation": "Penjelasan mengapa langkah ini tepat menurut standar keamanan digital.",
          "redFlagsIdentified": ["rf-1"]
        },
        {
          "id": "opt_risk",
          "label": "Tindakan ceroboh atau terpancing...",
          "isSafe": false,
          "scoreImpact": -40,
          "nextNodeId": null,
          "consequenceDialogue": [{ "id": "c2", "sender": "system", "text": "Peringatan! Akun atau data sensitif Anda terancam.", "timestamp": "10:17" }],
          "explanation": "Penjelasan bahaya konsekuensi dari tindakan tersebut.",
          "redFlagsIdentified": []
        }
      ]
    }
  },
  "learningPoints": [
    "Poin pembelajaran pertama...",
    "Poin pembelajaran kedua..."
  ]
}`;

  const modelsToTry = [
    env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview',
    ...CANDIDATE_MODELS.filter((m) => m !== env.GEMINI_MODEL),
  ];

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.85,
          },
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        console.warn(`Gemini model ${model} status ${response.status}, mencoba alternatif...`);
        continue;
      }

      const json = await response.json();
      const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        continue;
      }

      let cleanJson = candidateText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanJson) as ChallengeScenario;
      parsed.isAiGenerated = true;
      parsed.id = `ai-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      parsed.categoryId = request.categoryId;
      parsed.difficulty = request.difficulty;

      return parsed;
    } catch (err: any) {
      console.warn(`Model ${model} gagal:`, err.message);
    }
  }

  console.warn('Semua model Gemini sedang sibuk, menyajikan skenario kurasi beragam.');
  return getFallbackScenario(request.categoryId, request.difficulty, randomAngle);
}

function getFallbackScenario(
  categoryId: string,
  difficulty: DifficultyLevel,
  randomAngle?: string
): ChallengeScenario {
  const matches = SEED_SCENARIOS.filter(
    (s) => s.categoryId === categoryId && s.difficulty === difficulty
  );
  if (matches.length > 0) {
    // Pick random match if multiple
    return matches[Math.floor(Math.random() * matches.length)];
  }

  const categoryMatches = SEED_SCENARIOS.filter((s) => s.categoryId === categoryId);
  if (categoryMatches.length > 0) {
    return categoryMatches[Math.floor(Math.random() * categoryMatches.length)];
  }

  // If even category has no match, return a cloned and customized seed
  const fallback = { ...SEED_SCENARIOS[0] };
  fallback.id = `curated-${Date.now()}`;
  fallback.categoryId = categoryId;
  fallback.difficulty = difficulty;
  if (randomAngle) {
    fallback.title = randomAngle.split(':')[0] || fallback.title;
  }
  return fallback;
}
