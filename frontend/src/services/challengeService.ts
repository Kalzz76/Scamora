import { apiClient } from './apiClient';
import type {
  ChallengeCategory,
  ChallengeResult,
  ChallengeScenario,
  ChallengeSession,
  DecisionNode,
  DifficultyLevel,
  UserChallengeStatistics,
} from '../types/challenge';

export function getOrCreateUserId(): string {
  const STORAGE_KEY = 'scamora_guardian_uid';
  let uid = localStorage.getItem(STORAGE_KEY);
  if (!uid) {
    uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, uid);
  }
  return uid;
}

// Client-side fallback scenarios if backend is offline
const CLIENT_FALLBACK_CATEGORIES: ChallengeCategory[] = [
  {
    id: 'kurir-apk',
    name: 'Modus Kurir Paket (.APK)',
    description: 'Simulasi pesan kurir paket palsu yang mengirimkan file .apk berbahaya berkedok foto resi pengiriman.',
    icon: 'Package',
    sort_order: 1,
    scenario_count: 1,
  },
  {
    id: 'bank-phishing',
    name: 'Phishing CS Bank & Perubahan Tarif',
    description: 'Simulasi penipu mengaku petugas resmi bank mengancam kenaikan biaya bulanan atau meminta verifikasi OTP.',
    icon: 'Landmark',
    sort_order: 2,
    scenario_count: 1,
  },
  {
    id: 'job-scam',
    name: 'Lowongan Kerja Like & Follow (Task Scam)',
    description: 'Tawaran komisi fantastis hanya dengan like video yang berujung permintaan deposit sistem.',
    icon: 'Briefcase',
    sort_order: 3,
    scenario_count: 1,
  },
];

const CLIENT_FALLBACK_SCENARIOS: ChallengeScenario[] = [
  {
    id: 'scen-kurir-jnt-01',
    categoryId: 'kurir-apk',
    title: 'Paket Tertahan: Konfirmasi Alamat Kurir J&T',
    difficulty: 'easy',
    characterName: 'Budi Santoso (Kurir J&T)',
    characterRole: 'Mengaku Kurir Ekspedisi',
    characterAvatar: '',
    initialDialogue: [
      {
        id: 'msg-01',
        sender: 'scammer',
        text: 'Selamat siang kak, saya Budi kurir J&T Express. Mau antar paket atas nama kakak tetapi alamat rumah tidak lengkap/kurang blok rumah.',
        timestamp: '13:40',
      },
      {
        id: 'msg-02',
        sender: 'scammer',
        text: 'Ini saya kirimkan foto resi paket dan kondisi barangnya ya kak, tolong dicek dan diinstal aplikasinya buat konfirmasi titik pengantaran kakak.',
        timestamp: '13:41',
        attachment: {
          type: 'apk',
          filename: 'Lihat_Foto_Resi_Paket_JNT.apk',
          size: '8.4 MB',
          warningNote: 'Ekstensi berkas adalah .apk (Program Aplikasi Android), bukan format foto (.jpg/.png)',
        },
      },
    ],
    redFlags: [
      {
        id: 'rf-apk-ext',
        title: 'Ekstensi File .APK Berbahaya',
        description: 'Foto resi seharusnya berekstensi gambar (.jpg, .png), bukan file executable aplikasi Android (.apk) pencuri SMS/OTP.',
        severity: 'critical',
        category: 'malware',
      },
      {
        id: 'rf-unknown-number',
        title: 'Nomor Pengirim Tidak Resmi',
        description: 'Ekspedisi resmi menggunakan notifikasi WhatsApp Business dengan centang hijau resmi (Verified) tanpa mengirim file aplikasi.',
        severity: 'medium',
        category: 'social_engineering',
      },
    ],
    decisionNodes: {
      node_1: {
        id: 'node_1',
        prompt: 'Kurir mengirim berkas "Lihat_Foto_Resi_Paket_JNT.apk". Apa respons tindakan yang Anda pilih?',
        options: [
          {
            id: 'opt_1_install',
            label: 'Unduh dan buka file APK tersebut agar paket segera diantar.',
            isSafe: false,
            scoreImpact: -30,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'c1',
                sender: 'system',
                text: '⚠️ BAHAYA! Layanan Accessibility Service Android diminta aktif. Malware mencuri seluruh SMS OTP perbankan Anda dan menguras rekening secara diam-diam!',
                timestamp: '13:42',
              },
            ],
            explanation: 'Sangat berbahaya! File .apk adalah program aplikasi perusak. Kurir resmi tidak pernah mengirim aplikasi untuk melihat foto resi.',
            redFlagsIdentified: [],
          },
          {
            id: 'opt_1_ask_photo',
            label: 'Tolak berkas APK. Minta kurir mengirimkan foto langsung (.jpg) atau minta nomor resi resminya.',
            isSafe: true,
            scoreImpact: 35,
            nextNodeId: 'node_2_curious',
            consequenceDialogue: [
              {
                id: 'c2',
                sender: 'scammer',
                text: 'Sistem kantor kami mewajibkan instal aplikasi itu kak buat verifikasi barcode resi. Kalau tidak diinstal paket kakak kami kembalikan ke gudang dan dikenakan denda!',
                timestamp: '13:43',
              },
            ],
            explanation: 'Langkah tepat! Anda mencurigai ekstensi berkas yang tidak wajar dan meminta jalur komunikasi teks/foto biasa.',
            redFlagsIdentified: ['rf-apk-ext'],
          },
          {
            id: 'opt_1_block_report',
            label: 'Kenali sebagai malware APK, abaikan kurir palsu, dan langsung blokir nomornya.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'c3',
                sender: 'system',
                text: 'TEPAT DAN AMAN! Anda memutus rantai serangan siber dan melindungi perangkat dari infeksi malware.',
                timestamp: '13:42',
              },
            ],
            explanation: 'Keputusan luar biasa! Begitu menemukan file .apk dari nomor tidak dikenal, tindakan teraman adalah segera memutus kontak.',
            redFlagsIdentified: ['rf-apk-ext', 'rf-unknown-number'],
          },
        ],
      },
      node_2_curious: {
        id: 'node_2_curious',
        prompt: 'Pelaku mulai mengancam: "Kalau tidak diinstal, paket kena denda dan dikembalikan!". Apa tindakan Anda selanjutnya?',
        options: [
          {
            id: 'opt_2_panicked',
            label: 'Merasa takut kena denda, akhirnya menginstal file APK tersebut.',
            isSafe: false,
            scoreImpact: -35,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'c4',
                sender: 'system',
                text: '⚠️ ANDA TERPERANGKAP! Tekanan psikologis (ancaman denda) membuat pertahanan Anda runtuh. Rekening mobile banking Anda dibobol oleh aplikasi sniffing SMS.',
                timestamp: '13:44',
              },
            ],
            explanation: 'Pelaku menggunakan manipulasi rasa takut dan urgensi palsu. Jangan pernah tunduk pada ancaman denda dari nomor asing.',
            redFlagsIdentified: [],
          },
          {
            id: 'opt_2_check_official',
            label: 'Abaikan ancaman pelaku, lacak langsung nomor resi asli lewat aplikasi atau website resmi J&T Express.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'c5',
                sender: 'system',
                text: '✅ INVESTIGASI BERHASIL! Saat memeriksa aplikasi resmi, tidak ada paket tertahan. Anda berhasil menggagalkan upaya kejahatan siber!',
                timestamp: '13:45',
              },
            ],
            explanation: 'Sempurna! Selalu gunakan kanal resmi pihak ketiga untuk memvalidasi klaim pengirim.',
            redFlagsIdentified: ['rf-apk-ext', 'rf-unknown-number'],
          },
        ],
      },
    },
    learningPoints: [
      'Format file resi kiriman resmi adalah gambar (.jpg/.png) atau PDF, BUKAN file aplikasi (.apk).',
      'Kurir resmi tidak meminta penerima menginstal program apa pun di ponsel.',
      'Jika terlanjur klik file APK, segera aktifkan Mode Pesawat dan hubungi call center bank untuk memblokir akun rekening sementara.',
    ],
  },
  {
    id: 'scen-bank-bca-02',
    categoryId: 'bank-phishing',
    title: 'Kenaikan Tarif Transaksi Rp 150.000/Bulan',
    difficulty: 'medium',
    characterName: 'HaloBCA Priority Support',
    characterRole: 'Mengaku Petugas Customer Care',
    characterAvatar: '',
    initialDialogue: [
      {
        id: 'b-01',
        sender: 'scammer',
        text: 'PEMBERITAHUAN NASABAH YTH: Mulai besok akan diberlakukan penyesuaian tarif transaksi otomatis sebesar Rp 150.000/bulan pada rekening Anda.',
        timestamp: '09:15',
      },
      {
        id: 'b-02',
        sender: 'scammer',
        text: 'Jika Anda TIDAK SETUJU dan ingin tetap menggunakan tarif lama (Rp 6.500/transaksi), segera konfirmasi pembatalan dalam waktu 30 menit melalui link portal nasabah berikut:',
        timestamp: '09:16',
        attachment: {
          type: 'link',
          filename: 'bca-klik.com.tarif-update.xyz/batal-tarif',
          url: 'http://bca-klik.com.tarif-update.xyz/batal-tarif',
          warningNote: 'Domain induk adalah "tarif-update.xyz", bukan domain resmi bca.co.id atau klikbca.com',
        },
      },
    ],
    redFlags: [
      {
        id: 'rf-domain-spoof',
        title: 'Manipulasi Subdomain (Domain Phishing)',
        description: 'Nama merek BCA ditempatkan di subdomain, sementara domain aslinya adalah tarif-update.xyz dengan TLD murah berisiko.',
        severity: 'critical',
        category: 'credential_theft',
      },
      {
        id: 'rf-time-urgency',
        title: 'Tekanan Waktu 30 Menit (Urgency Trigger)',
        description: 'Pelaku membatasi waktu agar korban panik dan kehilangan kemampuan analisis kritis.',
        severity: 'high',
        category: 'urgency_manipulation',
      },
    ],
    decisionNodes: {
      node_1: {
        id: 'node_1',
        prompt: 'Pesan mengancam biaya Rp 150.000/bulan akan dipotong jika Anda tidak membuka tautan dalam 30 menit. Apa tindakan Anda?',
        options: [
          {
            id: 'b_opt_1_click',
            label: 'Langsung buka tautan tersebut dan isi nomor kartu ATM beserta PIN untuk membatalkan.',
            isSafe: false,
            scoreImpact: -40,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'bc1',
                sender: 'system',
                text: '⚠️ KREDENSIAL BOCOR! Halaman web tersebut adalah web tiruan (phishing). Data kartu dan PIN Anda telah tersimpan di server penipu!',
                timestamp: '09:18',
              },
            ],
            explanation: 'Sangat berbahaya! Web phishing mencuri kredensial login perbankan Anda dengan menduplikasi tampilan resmi.',
            redFlagsIdentified: [],
          },
          {
            id: 'b_opt_1_inspect_url',
            label: 'Periksa alamat tautannya. Sadari bahwa domain aslinya adalah tarif-update.xyz dan tolak membukanya.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'bc2',
                sender: 'system',
                text: 'DETEKSI TAJAM! Anda berhasil mengidentifikasi teknik Domain Spoofing dan melindungi akun bank Anda.',
                timestamp: '09:20',
              },
            ],
            explanation: 'Tepat sekali! Meneliti domain induk sebelum mengklik adalah kebiasaan cyber-hygiene yang krusial.',
            redFlagsIdentified: ['rf-domain-spoof', 'rf-time-urgency'],
          },
        ],
      },
    },
    learningPoints: [
      'Bank tidak pernah meminta nasabah melakukan konfirmasi perubahan tarif melalui formulir website pihak ketiga.',
      'Perhatikan domain induk URL sebelum mengklik tautan apa pun.',
      'Hubungi HaloBCA resmi (1500888) untuk memvalidasi setiap pengumuman penting.',
    ],
  },
  {
    id: 'scen-job-like-03',
    categoryId: 'job-scam',
    title: 'Gaji Rp 1.500.000/Hari: Tugas Like YouTube & Review Maps',
    difficulty: 'medium',
    characterName: 'Jessica - HRD Global Media',
    characterRole: 'Mengaku Recruiter Freelance',
    characterAvatar: '',
    initialDialogue: [
      {
        id: 'j-01',
        sender: 'scammer',
        text: 'Halo kak! Kami dari agensi digital marketing mitra resmi YouTube & TikTok. Kami membuka lowongan kerja freelance paruh waktu yang fleksibel dari rumah.',
        timestamp: '11:00',
      },
      {
        id: 'j-02',
        sender: 'scammer',
        text: 'Tugasnya sangat mudah: hanya memberi Like pada 3 video YouTube per jam. Setiap video dibayar Rp 35.000. Sehari bisa dapat Rp 500.000 - Rp 1.500.000 langsung transfer ke e-wallet kakak!',
        timestamp: '11:01',
      },
    ],
    redFlags: [
      {
        id: 'rf-unrealistic-pay',
        title: 'Komisi Fantastis Tidak Masuk Akal',
        description: 'Bayaran Rp 1,5 juta per hari hanya untuk pekerjaan remeh (like video) adalah umpan khas sindikat penipuan tenaga kerja online.',
        severity: 'critical',
        category: 'financial_fraud',
      },
    ],
    decisionNodes: {
      node_1: {
        id: 'node_1',
        prompt: 'Tawaran kerja seperti ini sangat marak di WhatsApp. Bagaimana respons Anda?',
        options: [
          {
            id: 'j_opt_accept',
            label: 'Menerima tawaran dan bersiap transfer uang deposit sistem yang diminta.',
            isSafe: false,
            scoreImpact: -50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'jc1',
                sender: 'system',
                text: 'UANG ANDA LENYAP! Setelah transfer deposit, kontak Anda diblokir atau diminta transfer lagi dengan dalih biaya pembukaan sistem.',
                timestamp: '11:05',
              },
            ],
            explanation: 'Ini adalah modus Task Scam. Jangan pernah membayar uang untuk mendapatkan pekerjaan.',
            redFlagsIdentified: [],
          },
          {
            id: 'j_opt_reject',
            label: 'Abaikan tawaran dan laporkan nomor sebagai spam penipuan kerja.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'jc2',
                sender: 'system',
                text: 'ANDA TERLINDUNGI! Anda tidak membuang waktu dan modal pada tawaran kerja fiktif.',
                timestamp: '11:06',
              },
            ],
            explanation: 'Pilihan tepat. Perusahaan besar tidak merekrut melalui pesan instan WhatsApp.',
            redFlagsIdentified: ['rf-unrealistic-pay'],
          },
        ],
      },
    },
    learningPoints: [
      'Pekerjaan riil tidak pernah membebankan deposit kepada calon pekerja.',
      'Imbalan yang terlalu tinggi untuk tugas sepele adalah indikasi kuat penipuan.',
    ],
  },
];

export const challengeService = {
  async getCategories(): Promise<ChallengeCategory[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ChallengeCategory[] }>('/challenges/categories');
      return res.data.data;
    } catch {
      return CLIENT_FALLBACK_CATEGORIES;
    }
  },

  async getScenarios(categoryId?: string, difficulty?: DifficultyLevel): Promise<ChallengeScenario[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ChallengeScenario[] }>('/challenges/scenarios', {
        params: { category_id: categoryId, difficulty },
      });
      return res.data.data;
    } catch {
      let filtered = CLIENT_FALLBACK_SCENARIOS;
      if (categoryId) filtered = filtered.filter((s) => s.categoryId === categoryId);
      if (difficulty) filtered = filtered.filter((s) => s.difficulty === difficulty);
      return filtered;
    }
  },

  async createSession(scenarioId: string): Promise<{
    session: ChallengeSession;
    currentDecisionNode: DecisionNode | null;
  }> {
    const userId = getOrCreateUserId();
    try {
      const res = await apiClient.post<{
        success: boolean;
        data: { session: ChallengeSession; currentDecisionNode: DecisionNode | null };
      }>('/challenges/sessions', {
        scenario_id: scenarioId,
        user_id: userId,
      });
      return res.data.data;
    } catch {
      // Local fallback session
      const scenario = CLIENT_FALLBACK_SCENARIOS.find((s) => s.id === scenarioId) || CLIENT_FALLBACK_SCENARIOS[0];
      const startNode = scenario.decisionNodes ? scenario.decisionNodes['node_1'] : null;
      const localSession: ChallengeSession = {
        id: `local-ses-${Date.now()}`,
        userId,
        scenarioId: scenario.id,
        currentNodeId: startNode?.id || null,
        status: 'in_progress',
        messages: [...scenario.initialDialogue],
        history: [],
        detectedRedFlags: [],
        totalScore: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        session: localSession,
        currentDecisionNode: startNode,
      };
    }
  },

  async submitDecision(
    sessionId: string,
    nodeId: string,
    optionId: string,
    flagsIdentified: string[] = []
  ): Promise<{
    session: ChallengeSession;
    result: ChallengeResult | null;
    chosenFeedback: {
      isSafe: boolean;
      explanation: string;
      consequenceMessages: any[];
    };
    nextDecisionNode: DecisionNode | null;
  }> {
    try {
      const res = await apiClient.post<{
        success: boolean;
        data: {
          session: ChallengeSession;
          result: ChallengeResult | null;
          chosenFeedback: {
            isSafe: boolean;
            explanation: string;
            consequenceMessages: any[];
          };
          nextDecisionNode: DecisionNode | null;
        };
      }>(`/challenges/sessions/${sessionId}/decisions`, {
        node_id: nodeId,
        option_id: optionId,
        flags_identified: flagsIdentified,
      });
      return res.data.data;
    } catch {
      // Offline fallback handling
      const scenario = CLIENT_FALLBACK_SCENARIOS[0];
      const node = scenario.decisionNodes ? scenario.decisionNodes[nodeId] : null;
      const option = node?.options.find((o) => o.id === optionId) || {
        id: optionId,
        label: 'Tindakan dipilih',
        isSafe: true,
        scoreImpact: 30,
        nextNodeId: null,
        consequenceDialogue: [{ id: 'cf', sender: 'system' as const, text: 'Sesi selesai.', timestamp: '12:00' }],
        explanation: 'Analisis tindakan selesai.',
      };

      const finalResult: ChallengeResult = {
        id: `res-${sessionId}`,
        sessionId,
        userId: getOrCreateUserId(),
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        difficulty: scenario.difficulty,
        categoryName: 'Kurir APK',
        score: option.isSafe ? 85 : 30,
        safetyRating: option.isSafe ? 'Sangat Aman (Cyber Guardian)' : 'Perlu Waspada Ekstra',
        redFlagsDetected: scenario.redFlags,
        redFlagsMissed: [],
        decisionsSummary: [
          {
            nodeId,
            chosenOptionId: optionId,
            isSafe: option.isSafe,
            scoreImpact: option.scoreImpact,
            chosenLabel: option.label,
            timestamp: new Date().toISOString(),
            explanation: option.explanation,
          },
        ],
        feedbackSummary: option.isSafe
          ? 'Respons sangat baik! Anda mengenali bahaya ekstensi file berbahaya.'
          : 'Waspadai file executable APK di WhatsApp.',
        vulnerabilityAssessment: {
          urgencyResistance: option.isSafe ? 85 : 40,
          authorityResistance: 80,
          greedResistance: 85,
          technicalInspection: option.isSafe ? 90 : 35,
        },
        recommendations: scenario.learningPoints,
        completedAt: new Date().toISOString(),
      };

      return {
        session: {
          id: sessionId,
          userId: getOrCreateUserId(),
          scenarioId: scenario.id,
          currentNodeId: null,
          status: 'completed',
          messages: [...scenario.initialDialogue, ...option.consequenceDialogue],
          history: [],
          detectedRedFlags: [],
          totalScore: option.isSafe ? 85 : 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        result: finalResult,
        chosenFeedback: {
          isSafe: option.isSafe,
          explanation: option.explanation,
          consequenceMessages: option.consequenceDialogue,
        },
        nextDecisionNode: null,
      };
    }
  },

  async getSessionResult(sessionId: string): Promise<ChallengeResult | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ChallengeResult }>(
        `/challenges/sessions/${sessionId}/result`
      );
      return res.data.data;
    } catch {
      return null;
    }
  },

  async getUserStatistics(): Promise<UserChallengeStatistics> {
    const userId = getOrCreateUserId();
    try {
      const res = await apiClient.get<{ success: boolean; data: UserChallengeStatistics }>(
        `/challenges/statistics`,
        { params: { user_id: userId } }
      );
      return res.data.data;
    } catch {
      return {
        totalAttempts: 1,
        completedAttempts: 1,
        averageScore: 85,
        highestScore: 85,
        guardianBadge: 'Novice Defender',
        strongestArea: 'Inspeksi Format Berkas',
        weakestArea: 'Tekanan Waktu',
      };
    }
  },

  async generateScenario(
    categoryId: string,
    difficulty: DifficultyLevel,
    topicPrompt?: string
  ): Promise<ChallengeScenario> {
    try {
      const res = await apiClient.post<{ success: boolean; data: ChallengeScenario }>(
        '/challenges/scenarios/generate',
        {
          category_id: categoryId,
          difficulty,
          topic_prompt: topicPrompt,
        }
      );
      if (res.data?.data) {
        console.log('[Gemini Challenge] Skenario AI Baru:', res.data.data.title, `(${res.data.data.difficulty})`);
        return res.data.data;
      }
      throw new Error('Data skenario kosong');
    } catch (err) {
      console.warn('[Gemini Challenge] Backend/API error, beralih ke skenario kurasi:', err);
      const matches = CLIENT_FALLBACK_SCENARIOS.filter(
        (s) => s.categoryId === categoryId && s.difficulty === difficulty
      );
      if (matches.length > 0) {
        return matches[Math.floor(Math.random() * matches.length)];
      }
      const catMatches = CLIENT_FALLBACK_SCENARIOS.filter((s) => s.categoryId === categoryId);
      if (catMatches.length > 0) {
        return catMatches[Math.floor(Math.random() * catMatches.length)];
      }
      return CLIENT_FALLBACK_SCENARIOS[0];
    }
  },
};

