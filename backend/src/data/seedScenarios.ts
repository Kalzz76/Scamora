import type { ChallengeCategory, ChallengeScenario } from '../types/challenge';

export const SEED_CATEGORIES: ChallengeCategory[] = [
  {
    id: 'kurir-apk',
    name: 'Modus Kurir Paket (.APK)',
    description: 'Simulasi pesan kurir paket palsu yang mengirimkan file .apk berbahaya berkedok foto resi pengiriman.',
    icon: 'Package',
    sort_order: 1,
    scenario_count: 2,
  },
  {
    id: 'bank-phishing',
    name: 'Phishing CS Bank & Perubahan Tarif',
    description: 'Simulasi penipu mengaku petugas resmi bank mengancam kenaikan biaya bulanan atau meminta verifikasi OTP.',
    icon: 'Landmark',
    sort_order: 2,
    scenario_count: 2,
  },
  {
    id: 'job-scam',
    name: 'Lowongan Kerja Like & Follow (Task Scam)',
    description: 'Tawaran komisi fantastis hanya dengan like video atau memberi rating Google Maps yang berujung permintaan deposit.',
    icon: 'Briefcase',
    sort_order: 3,
    scenario_count: 2,
  },
  {
    id: 'tilang-etle',
    name: 'Surat Tilang ETLE Palsu',
    description: 'Pesan mengatasnamakan Kepolisian yang mengirimkan berkas surat tilang digital dengan format aplikasi berbahaya.',
    icon: 'FileWarning',
    sort_order: 4,
    scenario_count: 1,
  },
  {
    id: 'undian-belanja',
    name: 'Undian Belanja & Biaya di Muka',
    description: 'Manipulasi euforia kemenangan hadiah ratusan juta dengan syarat transfer pajak pemenang ke rekening pribadi.',
    icon: 'Gift',
    sort_order: 5,
    scenario_count: 1,
  },
];

export const SEED_SCENARIOS: ChallengeScenario[] = [
  {
    id: 'scen-kurir-jnt-01',
    categoryId: 'kurir-apk',
    title: 'Paket Tertahan: Konfirmasi Alamat Kurir J&T',
    difficulty: 'easy',
    characterName: 'Budi Santoso (Kurir J&T Express)',
    characterRole: 'Mengaku Kurir Ekspedisi',
    characterAvatar: '🚚',
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
            nextNodeId: 'node_fail_install',
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
                text: '🛡️ TEPAT DAN AMAN! Anda memutus rantai serangan siber dan melindungi perangkat dari infeksi malware.',
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
      node_fail_install: {
        id: 'node_fail_install',
        prompt: 'Malware telah terinstal di ponsel Anda dan meminta izin akses SMS. Apa langkah darurat yang harus Anda lakukan?',
        options: [
          {
            id: 'opt_fail_airplane',
            label: 'Segera matikan WiFi dan aktifkan Mode Pesawat (Airplane Mode), lalu uninstall aplikasi mencurigakan dari menu Pengaturan Android.',
            isSafe: true,
            scoreImpact: 15,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'c6',
                sender: 'system',
                text: '🛡️ RESPON DARURAT TEPAT! Memutus internet menghentikan transmisi OTP ke server pelaku.',
                timestamp: '13:46',
              },
            ],
            explanation: 'Respons tanggap darurat yang baik. Memutus koneksi internet mencegah data SMS dikirim ke server C2 pelaku penipuan.',
            redFlagsIdentified: [],
          },
          {
            id: 'opt_fail_ignore',
            label: 'Membiarkan saja karena merasa ponsel baik-baik saja.',
            isSafe: false,
            scoreImpact: -30,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'c7',
                sender: 'system',
                text: '❌ FATAL! Pelaku berhasil mengakses SMS perbankan Anda secara diam-diam di latar belakang.',
                timestamp: '13:47',
              },
            ],
            explanation: 'Sangat berbahaya. Malware APK bekerja tanpa antarmuka yang terlihat (silent background service).',
            redFlagsIdentified: [],
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
    characterAvatar: '🏦',
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
      {
        id: 'rf-fake-fee',
        title: 'Isu Biaya Tidak Wajar',
        description: 'Bank resmi tidak pernah menaikkan tarif administrasi bulanan sebesar itu secara sepihak lewat pesan WhatsApp.',
        severity: 'medium',
        category: 'social_engineering',
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
            nextNodeId: 'node_bank_otp',
            consequenceDialogue: [
              {
                id: 'bc1',
                sender: 'system',
                text: '⚠️ KREDENSIAL BOCOR! Halaman web tersebut adalah web tiruan (phishing). Data nomor kartu dan PIN Anda telah tersimpan di database penipu!',
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
            scoreImpact: 45,
            nextNodeId: 'node_bank_verify',
            consequenceDialogue: [
              {
                id: 'bc2',
                sender: 'scammer',
                text: 'Bapak/Ibu segera isi ya, sisa waktu tinggal 10 menit lagi sebelum tarif otomatis didebet oleh sistem pusat!',
                timestamp: '09:20',
              },
            ],
            explanation: 'Tepat sekali! Anda berhasil mengidentifikasi teknik Domain Spoofing di mana domain utama sebenarnya adalah tarif-update.xyz.',
            redFlagsIdentified: ['rf-domain-spoof', 'rf-fake-fee'],
          },
          {
            id: 'b_opt_1_call_official',
            label: 'Jangan klik link apa pun. Hubungi HaloBCA resmi (1500888 atau via aplikasi haloBCA) untuk konfirmasi.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'bc3',
                sender: 'system',
                text: '🛡️ TINDAKAN TERBAIK! Pihak bank resmi menegaskan bahwa isu penyesuaian tarif Rp 150.000 adalah hoaks penipuan yang marak terjadi.',
                timestamp: '09:22',
              },
            ],
            explanation: 'Keputusan paling bijak! Menghubungi call center resmi secara mandiri adalah cara teraman memverifikasi informasi perbankan.',
            redFlagsIdentified: ['rf-domain-spoof', 'rf-time-urgency', 'rf-fake-fee'],
          },
        ],
      },
      node_bank_otp: {
        id: 'node_bank_otp',
        prompt: 'Di layar ponsel Anda masuk SMS dari Bank berisi 6 digit kode OTP. Penipu di chat mendesak: "Sebutkan 6 digit kode pembatalan tarif!". Apa yang Anda lakukan?',
        options: [
          {
            id: 'b_opt_give_otp',
            label: 'Menyerahkan kode OTP tersebut kepada penipu di chat agar proses pembatalan tuntas.',
            isSafe: false,
            scoreImpact: -50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'bc4',
                sender: 'system',
                text: '💥 SALDO TERKURAS HABIS! Kode OTP tersebut sebenarnya adalah otorisasi transfer saldo atau penarikan dana tanpa kartu.',
                timestamp: '09:25',
              },
            ],
            explanation: 'Fatal! OTP adalah One-Time Password rahasia pribadi. Pihak bank TIDAK PERNAH meminta kode OTP kepada nasabah.',
            redFlagsIdentified: [],
          },
          {
            id: 'b_opt_refuse_otp',
            label: 'Sadar bahwa OTP adalah kunci rahasia transaksi, menolak memberikannya dan segera memblokir kartu ATM lewat m-banking.',
            isSafe: true,
            scoreImpact: 35,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'bc5',
                sender: 'system',
                text: '🛡️ ANDA SELAMAT DI DETIK TERAKHIR! Penipu gagal mengeksekusi transfer karena tidak memiliki kode OTP Anda.',
                timestamp: '09:26',
              },
            ],
            explanation: 'Hebat! Menolak memberikan OTP adalah benteng pertahanan terakhir yang menyelamatkan saldo tabungan Anda.',
            redFlagsIdentified: ['rf-time-urgency'],
          },
        ],
      },
      node_bank_verify: {
        id: 'node_bank_verify',
        prompt: 'Pelaku makin agresif mengancam batas waktu tersisa 10 menit. Bagaimana respons Anda?',
        options: [
          {
            id: 'b_opt_block_scam',
            label: 'Kirim tangkapan layar ke aduan siber, blokir nomor penipu, dan abaikan seluruh ancamannya.',
            isSafe: true,
            scoreImpact: 35,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'bc6',
                sender: 'system',
                text: '✅ PERLINDUNGAN SELESAI! Anda tidak terjebak intimidasi psikologis penipu.',
                timestamp: '09:23',
              },
            ],
            explanation: 'Tindakan yang tepat dan tenang. Tidak membalas menutup peluang penipu melanjutkan manipulasi sosial.',
            redFlagsIdentified: ['rf-time-urgency'],
          },
        ],
      },
    },
    learningPoints: [
      'Bank tidak pernah meminta nasabah melakukan konfirmasi perubahan tarif melalui formulir website pihak ketiga.',
      'Perhatikan struktur URL: Domain resmi BCA adalah bca.co.id atau klikbca.com. Domain seperti "bca.xyz" atau "bca-update.com" adalah palsu.',
      'Jangan pernah membagikan OTP, PIN, atau Password kepada siapa pun termasuk staf bank.',
    ],
  },
  {
    id: 'scen-job-like-03',
    categoryId: 'job-scam',
    title: 'Gaji Rp 1.500.000/Hari: Tugas Like YouTube & Review Maps',
    difficulty: 'medium',
    characterName: 'Jessica - HRD Global Media Agency',
    characterRole: 'Mengaku Recruiter Freelance',
    characterAvatar: '💼',
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
      {
        id: 'j-03',
        sender: 'scammer',
        text: 'Ini komisi tugas uji coba pertama kakak sebesar Rp 25.000 sudah kami transfer ya. Mau lanjut ke tugas VIP dengan komisi lebih besar?',
        timestamp: '11:05',
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
      {
        id: 'rf-hook-payment',
        title: 'Umpan Transfer Awal (Baiting)',
        description: 'Pelaku sengaja mencairkan uang kecil (Rp 25.000) di awal untuk membangun rasa percaya semu korban.',
        severity: 'high',
        category: 'social_engineering',
      },
    ],
    decisionNodes: {
      node_1: {
        id: 'node_1',
        prompt: 'Anda baru saja menerima Rp 25.000 sungguhan dari pelaku sebagai bukti. Pelaku mengajak lanjut ke "Tugas VIP". Apa respons Anda?',
        options: [
          {
            id: 'j_opt_vip',
            label: 'Tertarik karena terbukti transfer uang, lalu bertanya bagaimana cara ikut Tugas VIP.',
            isSafe: false,
            scoreImpact: -25,
            nextNodeId: 'node_job_deposit',
            consequenceDialogue: [
              {
                id: 'jc1',
                sender: 'scammer',
                text: 'Hebat kak! Untuk tugas VIP komisi Rp 800.000, kakak wajib deposit modal sistem sebesar Rp 300.000 ke rekening bendahara kami. Tenang kak, deposit akan dikembalikan 130%!',
                timestamp: '11:07',
              },
            ],
            explanation: 'Anda mulai termakan umpan (baiting). Sindikat penipuan selalu memberi keuntungan kecil sebelum meminta setoran uang besar.',
            redFlagsIdentified: [],
          },
          {
            id: 'j_opt_reject',
            label: 'Sadar ini modus Task Scam klasik, tolak tawaran dan hentikan kontak.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'jc2',
                sender: 'system',
                text: '🛡️ KEPUTUSAN CERDAS! Anda berhasil mengidentifikasi modus Task Scam dan selamat dari jeratan deposit bodong.',
                timestamp: '11:08',
              },
            ],
            explanation: 'Luar biasa! Tidak ada pekerjaan resmi yang membayar puluhan ribu rupiah hanya untuk satu kali klik like video.',
            redFlagsIdentified: ['rf-unrealistic-pay', 'rf-hook-payment'],
          },
        ],
      },
      node_job_deposit: {
        id: 'node_job_deposit',
        prompt: 'Pelaku meminta transfer "Deposit Sistem" sebesar Rp 300.000 dengan janji dikembalikan Rp 390.000. Apa tindakan Anda?',
        options: [
          {
            id: 'j_opt_pay_deposit',
            label: 'Transfer Rp 300.000 karena yakin uang akan kembali berlipat ganda.',
            isSafe: false,
            scoreImpact: -50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'jc3',
                sender: 'system',
                text: '💸 UANG ANDA LENYAP! Setelah transfer, penipu beralasan sistem freeze dan meminta tambahan deposit Rp 2.000.000 lagi untuk mencairkan dana. Anda menjadi korban Task Scam.',
                timestamp: '11:12',
              },
            ],
            explanation: 'Ini adalah inti modus Task Scam (Pig Butchering mini). Penipu tidak akan pernah mengembalikan uang deposit Anda.',
            redFlagsIdentified: [],
          },
          {
            id: 'j_opt_stop_now',
            label: 'Berhenti seketika! Pekerjaan yang meminta pencari kerja menyetor uang terlebih dahulu adalah penipuan 100%.',
            isSafe: true,
            scoreImpact: 40,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'jc4',
                sender: 'system',
                text: '✅ PENGHENTIAN TEPAT! Anda berhasil menahan diri sebelum mengalami kerugian finansial yang lebih besar.',
                timestamp: '11:10',
              },
            ],
            explanation: 'Prinsip dasar ketenagakerjaan: Pekerja dibayar untuk bekerja, bukan membayar untuk bekerja.',
            redFlagsIdentified: ['rf-unrealistic-pay'],
          },
        ],
      },
    },
    learningPoints: [
      'Semua lowongan kerja yang mewajibkan transfer "deposit", "uang pendaftaran", atau "uang jaminan" adalah indikasi penipuan.',
      'Uang komisi kecil di awal adalah umpan psikologis agar korban percaya diri menaruh uang lebih besar.',
      'Perusahaan resmi seperti YouTube atau Google tidak pernah merekrut pekerja harian via pesan acak WhatsApp atau Telegram.',
    ],
  },
  {
    id: 'scen-tilang-etle-04',
    categoryId: 'tilang-etle',
    title: 'Surat Tilang ETLE Ditlantas Polri .APK',
    difficulty: 'hard',
    characterName: 'Ditlantas Polri Command Center',
    characterRole: 'Mengaku Petugas Kepolisian RI',
    characterAvatar: '👮',
    initialDialogue: [
      {
        id: 't-01',
        sender: 'scammer',
        text: 'PEMBERITAHUAN PELANGGARAN LALU LINTAS ELEKTRONIK (ETLE): Kendaraan Anda bernomor polisi terdeteksi melanggar batas kecepatan dan rambu marka jalan pada tanggal 4 November 2026.',
        timestamp: '08:30',
      },
      {
        id: 't-02',
        sender: 'scammer',
        text: 'Surat tilang resmi dan bukti foto CCTV terlampir pada berkas digital berikut. Wajib diinstal dan dibuka dalam waktu 1x24 jam sebelum STNK kendaraan Anda diblokir otomatis oleh Samsat:',
        timestamp: '08:31',
        attachment: {
          type: 'apk',
          filename: 'Surat_Pemberitahuan_ETLE_Polri.apk',
          size: '11.2 MB',
          warningNote: 'Ekstensi file adalah .apk (Aplikasi Android). Polisi resmi mengirim surat fisik ke alamat KTP, BUKAN file .apk di WhatsApp!',
        },
      },
    ],
    redFlags: [
      {
        id: 'rf-etle-apk',
        title: 'Pengiriman File .APK atas nama Kepolisian',
        description: 'Korlantas Polri mengirimkan surat konfirmasi tilang fisik lewat pos atau pengecekan mandiri di portal resmi etle-pmj.info, tidak pernah mengirim aplikasi .apk via WhatsApp.',
        severity: 'critical',
        category: 'malware',
      },
      {
        id: 'rf-stnk-threat',
        title: 'Ancaman Pemblokiran STNK 1x24 Jam',
        description: 'Pelaku memanfaatkan rasa takut hukum agar korban terburu-buru menginstal malware tanpa berpikir panjang.',
        severity: 'high',
        category: 'urgency_manipulation',
      },
    ],
    decisionNodes: {
      node_1: {
        id: 'node_1',
        prompt: 'Pesan mengaku dari Kepolisian mengancam STNK Anda diblokir jika tidak menginstal file Surat_Pemberitahuan_ETLE_Polri.apk. Apa tindakan Anda?',
        options: [
          {
            id: 't_opt_install',
            label: 'Panik STNK diblokir, lalu mengunduh dan menginstal aplikasi tersebut.',
            isSafe: false,
            scoreImpact: -50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'tc1',
                sender: 'system',
                text: '⚠️ PERANGKAT TERINFEKSI SPYWARE! Aplikasi APK palsu tersebut mengambil alih izin SMS/OTP dan meneruskan data perbankan Anda ke server penjahat siber.',
                timestamp: '08:33',
              },
            ],
            explanation: 'Fatal! Polisi tidak pernah menggunakan file APK untuk surat tilang. Ini modus malware pencuri SMS perbankan yang marak di Indonesia.',
            redFlagsIdentified: [],
          },
          {
            id: 't_opt_check_website',
            label: 'Tolak file APK! Buka peramban dan cek nomor plat kendaraan langsung di portal resmi Korlantas ETLE (etle-pmj.info).',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'tc2',
                sender: 'system',
                text: '🛡️ INVESTIGASI TEPAT! Setelah dicek di situs resmi Polri, tidak ada pelanggaran tilang apapun. Anda berhasil terhindar dari malware perusak!',
                timestamp: '08:35',
              },
            ],
            explanation: 'Langkah luar biasa! Mengonfirmasi informasi tilang langsung ke website resmi institusi adalah cara terbaik mematahkan manipulasi ini.',
            redFlagsIdentified: ['rf-etle-apk', 'rf-stnk-threat'],
          },
        ],
      },
    },
    learningPoints: [
      'Surat konfirmasi ETLE asli dikirim ke alamat pemilik kendaraan melalui PT Pos Indonesia atau dicek di situs resmi.',
      'Kepolisian tidak pernah meminta masyarakat menginstal aplikasi berkas APK untuk melihat surat tilang.',
    ],
  },
  {
    id: 'scen-undian-shopee-05',
    categoryId: 'undian-belanja',
    title: 'Pemenang Hadiah Grand Prize 150 Juta Shopee',
    difficulty: 'easy',
    characterName: 'Admin Shopee Gebyar Emas',
    characterRole: 'Mengaku Customer Service E-Commerce',
    characterAvatar: '🎁',
    initialDialogue: [
      {
        id: 'u-01',
        sender: 'scammer',
        text: 'SELAMAT! Nomor WhatsApp Anda terpilih sebagai pemenang hadiah Grand Prize uang tunai Rp 150.000.000 dari program Shopee Pesta Akhir Tahun!',
        timestamp: '14:20',
      },
      {
        id: 'u-02',
        sender: 'scammer',
        text: 'Untuk pencairan dana, Anda diwajibkan mentransfer biaya administrasi & pajak pemenang 5% (Rp 750.000) ke rekening bendahara kami agar uang langsung dicairkan ke rekening Anda.',
        timestamp: '14:21',
      },
    ],
    redFlags: [
      {
        id: 'rf-advance-fee',
        title: 'Klaim Pajak Hadiah Ditanggung Pemenang di Muka',
        description: 'Penyelenggara undian resmi tidak pernah membebankan pajak hadiah melalui transfer uang muka ke rekening pribadi.',
        severity: 'critical',
        category: 'financial_fraud',
      },
    ],
    decisionNodes: {
      node_1: {
        id: 'node_1',
        prompt: 'Penipu meminta transfer uang Rp 750.000 agar hadiah Rp 150.000.000 bisa dicairkan. Bagaimana respons Anda?',
        options: [
          {
            id: 'u_opt_transfer',
            label: 'Segera transfer Rp 750.000 karena mengira untung besar jika mendapatkan 150 juta.',
            isSafe: false,
            scoreImpact: -50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'uc1',
                sender: 'system',
                text: '💸 UANG HANGUS! Ini modus Advance Fee Fraud klasik. Setelah transfer Rp 750.000, penipu akan memblokir Anda atau meminta uang tambahan.',
                timestamp: '14:23',
              },
            ],
            explanation: 'Sangat keliru. Setiap undian resmi menanggung pajak atau memotongnya langsung dari nilai hadiah pemenang.',
            redFlagsIdentified: [],
          },
          {
            id: 'u_opt_reject',
            label: 'Abaikan pesan, blokir nomor penipu, dan laporkan pesan sebagai spam.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'uc2',
                sender: 'system',
                text: '🛡️ KEPUTUSAN TEPAT! Anda tidak terjebak euforia hadiah fiktif.',
                timestamp: '14:22',
              },
            ],
            explanation: 'Sempurna! Tidak ada undian resmi yang meminta uang tebusan di muka melalui transfer nomor rekening pribadi.',
            redFlagsIdentified: ['rf-advance-fee'],
          },
        ],
      },
    },
    learningPoints: [
      'Pajak hadiah undian resmi dipotong langsung dari hadiah atau diumumkan terbuka di aplikasi resmi.',
      'Jangan pernah mentransfer uang dengan iming-iming pencairan hadiah.',
    ],
  },
  {
    id: 'scen-kurir-jne-hard',
    categoryId: 'kurir-apk',
    title: 'Surat Somasi Ganti Rugi Barang Hilang JNE .APK',
    difficulty: 'hard',
    characterName: 'Divisi Hukum & Investigasi Ekspedisi',
    characterRole: 'Mengaku Pengacara Ekspedisi',
    characterAvatar: '⚖️',
    initialDialogue: [
      {
        id: 'kh-01',
        sender: 'scammer',
        text: 'SURAT TUNTUTAN HUKUM: Barang kiriman yang Anda terima kemarin dilaporkan hilang/tertukar dan menimbulkan kerugian senilai Rp 18.500.000.',
        timestamp: '15:10',
      },
      {
        id: 'kh-02',
        sender: 'scammer',
        text: 'Pihak kuasa hukum kami telah menerbitkan Berita Acara Perkara (BAP) dan Surat Somasi Digital terlampir. Segera buka berkas ini dan tanda tangani digital dalam waktu 2 jam sebelum kami laporkan ke kepolisian:',
        timestamp: '15:11',
        attachment: {
          type: 'apk',
          filename: 'Dokumen_Somasi_Perkara_JNE.apk',
          size: '9.8 MB',
          warningNote: 'Ekstensi adalah .apk (Aplikasi Android pencuri data)',
        },
      },
    ],
    redFlags: [
      {
        id: 'rf-legal-scare',
        title: 'Intimidasi Ancaman Jalur Hukum & Polisi',
        description: 'Pelaku memakai istilah hukum palsu untuk melumpuhkan logika korban agar segera mengeklik file berbahaya.',
        severity: 'critical',
        category: 'urgency_manipulation',
      },
    ],
    decisionNodes: {
      node_1: {
        id: 'node_1',
        prompt: 'Pelaku mengaku kuasa hukum ekspedisi dan mengirim file "Dokumen_Somasi_Perkara_JNE.apk" disertai ancaman polisi. Apa tindakan Anda?',
        options: [
          {
            id: 'kh_opt_click',
            label: 'Panik karena takut dilaporkan ke polisi, langsung instal file tersebut.',
            isSafe: false,
            scoreImpact: -50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'khc1',
                sender: 'system',
                text: '⚠️ MALWARE AKTIF! Ponsel Anda disusupi trojan perbankan.',
                timestamp: '15:13',
              },
            ],
            explanation: 'Jangan panik! Surat hukum resmi tidak dikirimkan lewat file .apk di WhatsApp.',
            redFlagsIdentified: [],
          },
          {
            id: 'kh_opt_refuse',
            label: 'Kenali ini sebagai modus rekayasa sosial manipulasi rasa takut. Tolak berkas .apk dan hubungi kantor cabang JNE terdekat.',
            isSafe: true,
            scoreImpact: 50,
            nextNodeId: null,
            consequenceDialogue: [
              {
                id: 'khc2',
                sender: 'system',
                text: '🛡️ ANDA KEBAL DARI INTIMIDASI! Penipu gagal memanfaatkan rasa takut Anda.',
                timestamp: '15:14',
              },
            ],
            explanation: 'Luar biasa! Dokumen hukum tidak pernah berformat file aplikasi .apk.',
            redFlagsIdentified: ['rf-legal-scare'],
          },
        ],
      },
    },
    learningPoints: [
      'Surat hukum atau somasi resmi dikirim secara fisik bertandatangan basah, bukan file aplikasi Android.',
      'Pelaku sering memicu kepanikan hukum agar korban tidak sempat memeriksa ekstensi file.',
    ],
  },
];

