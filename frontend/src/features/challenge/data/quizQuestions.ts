export type QuizDifficulty = 'pemula' | 'menengah' | 'sulit';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  reason: string;
}

export interface QuizQuestion {
  id: string;
  difficulty: QuizDifficulty;
  category: string;
  scenario: string;
  question: string;
  options: QuizOption[];
}

export const TIERED_QUIZ_QUESTIONS: Record<QuizDifficulty, QuizQuestion[]> = {
  // ==========================================
  // LEVEL 1: PEMULA (DASAR / FOUNDATIONAL)
  // Fokus: Ciri-ciri mencolok yang mudah dikenali masyarakat awam.
  // ==========================================
  pemula: [
    {
      id: 'p-01',
      difficulty: 'pemula',
      category: 'Undian Palsu (Advance Fee)',
      scenario: 'Anda menerima pesan WhatsApp dari nomor asing: "Selamat siang! Anda terpilih sebagai pemenang undian belanja Rp 100 Juta. Silakan transfer biaya pajak pemenang sebesar Rp 500.000 ke rekening bendahara kami agar uang langsung dicairkan."',
      question: 'Tindakan apa yang paling tepat untuk Anda lakukan?',
      options: [
        {
          text: 'Langsung mentransfer dana agar hadiah tidak hangus.',
          isCorrect: false,
          reason: 'Salah! Penyelenggara undian resmi tidak pernah membebankan pajak hadiah melalui transfer uang muka ke rekening pribadi.',
        },
        {
          text: 'Abaikan, blokir nomor pengirim, dan laporkan pesan sebagai spam/penipuan.',
          isCorrect: true,
          reason: 'Tepat! Ini adalah modus klasik Advance Fee Fraud (biaya di muka). Setiap undian resmi memotong pajak langsung dari hadiah.',
        },
        {
          text: 'Membalas pesan untuk menawar biaya pajak agar lebih murah.',
          isCorrect: false,
          reason: 'Berbahaya! Membalas pesan mengonfirmasi bahwa nomor telepon Anda aktif dan akan menjadi target spam berikutnya.',
        },
      ],
    },
    {
      id: 'p-02',
      difficulty: 'pemula',
      category: 'Malware Kurir APK',
      scenario: 'Seseorang yang mengaku kurir paket mengirimkan file bernama "Lihat_Foto_Resi_Paket_JNT.apk" di WhatsApp karena alamat pengantaran Anda kurang jelas.',
      question: 'Mengapa file ini berbahaya dan dilarang untuk diinstal?',
      options: [
        {
          text: 'Karena foto paket seharusnya berekstensi gambar (.jpg/.png), bukan aplikasi Android (.apk) pencuri SMS/OTP.',
          isCorrect: true,
          reason: 'Tepat sekali! Ekstensi .apk adalah program aplikasi Android yang dapat mengekstrak SMS perbankan Anda tanpa izin.',
        },
        {
          text: 'Karena paket tersebut sebenarnya sudah tiba di rumah tetangga.',
          isCorrect: false,
          reason: 'Salah. Pokok permasalahannya adalah manipulasi berkas eksekutabel malware .apk.',
        },
        {
          text: 'Karena file APK hanya boleh dibuka pada jaringan WiFi kantor.',
          isCorrect: false,
          reason: 'Sangat keliru! File APK berbahaya tetap akan mencuri data di jaringan apa pun.',
        },
      ],
    },
    {
      id: 'p-03',
      difficulty: 'pemula',
      category: 'Pencurian OTP Dasar',
      scenario: 'Seseorang menelpon mengaku petugas bank resmi dan meminta Anda menyebutkan 6 digit kode OTP yang baru saja masuk ke SMS HP Anda untuk keperluan "sinkronisasi sistem".',
      question: 'Apakah staf bank resmi berhak meminta kode OTP Anda?',
      options: [
        {
          text: 'Boleh, selama staf bank tersebut menyebutkan nama lengkap dan tanggal lahir kita dengan benar.',
          isCorrect: false,
          reason: 'Salah besar! Pelaku sering kali memiliki data pribadi yang bocor, namun mereka tetap butuh OTP Anda untuk eksekusi transaksi.',
        },
        {
          text: 'Tidak pernah! Bank dan institusi resmi mana pun TIDAK AKAN PERNAH meminta kode OTP atau PIN kepada nasabah.',
          isCorrect: true,
          reason: 'Tepat! OTP adalah One-Time Password rahasia pribadi yang berfungsi sebagai kunci otentikasi ganda Anda.',
        },
        {
          text: 'Boleh, asalkan kode tersebut dikirimkan via chat bukan lewat telepon.',
          isCorrect: false,
          reason: 'Salah total. Membagikan kode OTP lewat kanal mana pun akan membobol akun Anda.',
        },
      ],
    },
    {
      id: 'p-04',
      difficulty: 'pemula',
      category: 'Pembajakan Akun Teman',
      scenario: 'Akun Instagram teman akrab Anda tiba-tiba mengirim DM: "Bro, boleh pinjam 500rb dulu gak? M-banking gue lagi error, besok pagi langsung gue ganti."',
      question: 'Langkah verifikasi awal apa yang wajib Anda lakukan sebelum mentransfer uang?',
      options: [
        {
          text: 'Segera transfer karena dia adalah sahabat karib Anda.',
          isCorrect: false,
          reason: 'Berbahaya! Akun teman Anda sangat mungkin telah diretas (social media hijacking).',
        },
        {
          text: 'Telepon suara atau video call teman Anda secara langsung lewat nomor telepon/WhatsApp pribadinya.',
          isCorrect: true,
          reason: 'Benar! Selalu lakukan verifikasi suara/video dua arah di luar platform media sosial untuk memastikan identitas aslinya.',
        },
        {
          text: 'Transfer setengahnya saja (250rb) untuk mengurangi risiko rugi.',
          isCorrect: false,
          reason: 'Keliru. Jika akun tersebut memang diretas, uang berapa pun yang Anda kirimkan akan hilang ke rekening penipu.',
        },
      ],
    },
    {
      id: 'p-05',
      difficulty: 'pemula',
      category: 'Penipuan Telepon (Vishing)',
      scenario: 'Anda menerima telepon dari nomor asing yang menyatakan bahwa anak atau adik Anda sedang ditahan di kantor polisi karena kasus narkoba dan meminta tebusan kilat.',
      question: 'Taktik manipulasi psikologis apa yang sedang digunakan pelaku?',
      options: [
        {
          text: 'Manipulasi kepanikan dan rasa takut agar korban terburu-buru bertindak tanpa berpikir jernih.',
          isCorrect: true,
          reason: 'Tepat! Modus ini memanfaatkan syok emosional agar korban tidak sempat memverifikasi kondisi anggota keluarganya.',
        },
        {
          text: 'Penawaran diskon denda tilang dari kepolisian resmi.',
          isCorrect: false,
          reason: 'Salah. Ini murni rekayasa sosial kriminal pemerasan.',
        },
        {
          text: 'Promosi produk asuransi kecelakaan lalu lintas.',
          isCorrect: false,
          reason: 'Bukan, ini modus kejahatan vishing penipuan telepon.',
        },
      ],
    },
    {
      id: 'p-06',
      difficulty: 'pemula',
      category: 'Task Scam Pemula',
      scenario: 'Pesan WhatsApp menawarkan kerja paruh waktu: "Hanya perlu like video TikTok dan follow akun, gaji Rp 1.000.000/hari langsung cair. Tidak perlu ijazah atau pengalaman."',
      question: 'Apa kejanggalan paling nyata dari tawaran tersebut?',
      options: [
        {
          text: 'Nilai komisi fantastis yang tidak sebanding dengan tingkat kesulitan pekerjaan yang sangat remeh.',
          isCorrect: true,
          reason: 'Tepat! Tidak ada bisnis resmi yang membayar jutaan rupiah per hari hanya untuk pekerjaan beberapa kali klik.',
        },
        {
          text: 'Tawaran tersebut tidak menyertakan link grup Telegram.',
          isCorrect: false,
          reason: 'Bukan, penipu biasanya justru akan mengarahkan korban ke grup Telegram setelah korban membalas.',
        },
        {
          text: 'Tugas tersebut mengharuskan pengguna memiliki ponsel keluaran terbaru.',
          isCorrect: false,
          reason: 'Salah. Modus ini sengaja menyasar siapa saja tanpa syarat teknologi khusus.',
        },
      ],
    },
  ],

  // ==========================================
  // LEVEL 2: MENENGAH (INTERMEDIATE)
  // Fokus: Modus lebih rapi, rekayasa sosial manipulatif, URL spoofing, dan taktik jebakan bertahap.
  // ==========================================
  menengah: [
    {
      id: 'm-01',
      difficulty: 'menengah',
      category: 'Domain Spoofing',
      scenario: 'Anda menerima SMS dari pihak bank dengan tautan: "http://bca-klik.com.tarif-update.xyz/batal-tarif".',
      question: 'Tanda bahaya apa yang paling mencolok pada alamat URL di atas?',
      options: [
        {
          text: 'Nama merek BCA ditaruh di subdomain, sedangkan domain induk aslinya adalah tarif-update.xyz dengan TLD murah berisiko.',
          isCorrect: true,
          reason: 'Benar! Penipu mengecoh korban dengan menempatkan nama institusi ternama di subdomain, padahal domain utama berada sebelum ekstensi akhir.',
        },
        {
          text: 'Tautan tersebut menggunakan format huruf kecil semua.',
          isCorrect: false,
          reason: 'Format huruf kecil adalah hal normal pada URL peramban internet.',
        },
        {
          text: 'Alamat tautan terlalu singkat untuk dibaca manusia.',
          isCorrect: false,
          reason: 'URL tersebut justru panjang dan memanipulasi hierarki subdomain.',
        },
      ],
    },
    {
      id: 'm-02',
      difficulty: 'menengah',
      category: 'Taktik Umpan (Baiting Scam)',
      scenario: 'Pada tugas freelance freelance like video hari pertama, Anda benar-benar menerima transfer komisi Rp 30.000 ke akun e-wallet Anda. Di hari kedua, admin meminta Anda deposit modal Rp 500.000 untuk "Tugas VIP komisi 150%".',
      question: 'Mengapa penipu rela mentransfer uang sungguhan Rp 30.000 di awal?',
      options: [
        {
          text: 'Sebagai umpan psikologis (baiting) untuk memupuk rasa percaya korban sebelum menjerat kerugian ratusan kali lipat.',
          isCorrect: true,
          reason: 'Tepat sekali! Ini adalah tahapan "pig butchering" mini di mana korban digemukkan dengan komisi kecil sebelum dikuras tabungannya.',
        },
        {
          text: 'Karena perusahaan tersebut memang resmi dan hanya membutuhkan modal tambahan operasional.',
          isCorrect: false,
          reason: 'Salah fatal! Perusahaan resmi tidak pernah memungut setoran deposit modal dari tenaga lepas yang direkrut.',
        },
        {
          text: 'Karena bank mitra sedang melakukan uji coba transfer saldo otomatis.',
          isCorrect: false,
          reason: 'Bukan, uang tersebut sengaja dikirimkan oleh sindikat penipu dari dana korban sebelumnya.',
        },
      ],
    },
    {
      id: 'm-03',
      difficulty: 'menengah',
      category: 'Manipulasi Urgensi Waktu',
      scenario: 'Surat edaran bertanda tangan direksi dikirim via WhatsApp mengabarkan autodebet biaya transfer naik drastis jadi Rp 150.000/bulan, disertai peringatan: "Form pembatalan harus diisi dalam 30 menit atau sistem mengunci status setuju".',
      question: 'Apa fungsi utama batasan waktu 30 menit (Urgency Trigger) dalam skema penipuan ini?',
      options: [
        {
          text: 'Mematikan pemikiran kritis korban sehingga korban panik dan langsung mengisi kredensial tanpa sempat mengecek sumber resmi.',
          isCorrect: true,
          reason: 'Tepat! Batasan waktu buatan (artificial deadline) memicu respons Fight-or-Flight yang melumpuhkan akal sehat dan analisis fakta.',
        },
        {
          text: 'Menyesuaikan jadwal jam kerja server operasional perbankan Indonesia.',
          isCorrect: false,
          reason: 'Salah. Server perbankan beroperasi 24/7 dan kebijakan tarif tidak pernah diputuskan secara sepihak lewat chat 30 menit.',
        },
        {
          text: 'Memastikan kuota formulir Google Form tidak penuh oleh nasabah lain.',
          isCorrect: false,
          reason: 'Bukan, ini murni teknik rekayasa sosial manipulasi batas waktu.',
        },
      ],
    },
    {
      id: 'm-04',
      difficulty: 'menengah',
      category: 'QR Code Phishing (Quishing)',
      scenario: 'Saat hendak membayar makanan di restoran menggunakan QRIS di atas meja kasir, Anda melihat stiker QRIS tampak tertimpa stiker barcode lain yang mencurigakan.',
      question: 'Bahaya apa yang mengancam jika Anda sembarangan memindai stiker QR yang ditimpa tersebut?',
      options: [
        {
          text: 'Pembayaran teralihkan ke rekening penipu atau dialihkan ke tautan web phishing pencuri kredensial (Quishing).',
          isCorrect: true,
          reason: 'Benar! Modus QRIS palsu menempelkan kode QR pelaku di atas stiker resmi merchant untuk mengalihkan transaksi pembayaran.',
        },
        {
          text: 'Kamera ponsel Anda akan mengalami kerusakan optik permanen.',
          isCorrect: false,
          reason: 'Salah. Kamera hanya membaca pola matriks visual tanpa risiko kerusakan perangkat keras.',
        },
        {
          text: 'Koneksi bluetooth ponsel akan terputus dari printer kasir.',
          isCorrect: false,
          reason: 'Tidak ada hubungannya sama sekali.',
        },
      ],
    },
    {
      id: 'm-05',
      difficulty: 'menengah',
      category: 'Undangan Pernikahan APK',
      scenario: 'Di grup keluarga WhatsApp, sebuah nomor tidak dikenal mengirim file "Undangan_Pernikahan_Digital_Rina_Doni.apk" dengan foto sampul karangan bunga yang rapi.',
      question: 'Apa langkah paling bijak yang harus Anda ingatkan kepada anggota grup?',
      options: [
        {
          text: 'Peringatkan seluruh anggota keluarga agar JANGAN PERNAH mengeklik file tersebut karena undangan digital asli berbasis web link, bukan file aplikasi .apk.',
          isCorrect: true,
          reason: 'Tepat! Undangan pernikahan digital berbasis web (HTML/link), bukan berkas installer aplikasi Android yang mengeksploitasi izin perangkat.',
        },
        {
          text: 'Menyarankan anggota keluarga untuk membukanya lewat ponsel merek lain yang lebih murah.',
          isCorrect: false,
          reason: 'Salah. File malware APK tetap berbahaya dan dapat mencuri SMS di perangkat Android mana pun.',
        },
        {
          text: 'Menunggu ada kerabat yang berhasil membuka undangannya terlebih dahulu.',
          isCorrect: false,
          reason: 'Berbahaya! Menunggu bisa menyebabkan kerabat lain menjadi korban peretasan saldo rekening.',
        },
      ],
    },
    {
      id: 'm-06',
      difficulty: 'menengah',
      category: 'Penyingkat Tautan (URL Shortener)',
      scenario: 'Anda menerima tautan pendek "https://bit.ly/update-tarif-resmi-bank" melalui broadcast WhatsApp.',
      question: 'Mengapa penggunaan URL Shortener (seperti bit.ly, tinyurl, s.id) pada informasi perbankan patut dicurigai?',
      options: [
        {
          text: 'Karena shortener menyembunyikan domain tujuan akhir sebenarnya, sehingga pengguna tidak bisa memvalidasi keaslian website sebelum mengklik.',
          isCorrect: true,
          reason: 'Tepat! Lembaga keuangan resmi selalu menyertakan domain korporat mereka sendiri (misal: bca.co.id) tanpa menyamarkannya di shortener gratis.',
        },
        {
          text: 'Karena membuka shortlink akan menghabiskan kuota internet 100 kali lebih besar.',
          isCorrect: false,
          reason: 'Salah. Ukuran data redirect URL shortener sangat kecil.',
        },
        {
          text: 'Karena browser Chrome melarang seluruh jenis tautan pendek di internet.',
          isCorrect: false,
          reason: 'Tidak benar. Browser tetap mendukung shortlink secara normal.',
        },
      ],
    },
  ],

  // ==========================================
  // LEVEL 3: SULIT (MAHIR / ADVANCED FORENSICS)
  // Fokus: Analisis teknis mendalam, perizinan OS, SIM Swap, Deepfake, dan Incident Response.
  // ==========================================
  sulit: [
    {
      id: 's-01',
      difficulty: 'sulit',
      category: 'Abuse of Android Accessibility Service',
      scenario: 'Sebuah aplikasi APK yang tidak sengaja terpasang di Android meminta izin akses "Accessibility Service" (Layanan Aksesibilitas) atau izin membaca notifikasi sistem.',
      question: 'Secara teknis, mengapa izin Accessibility Service ini menjadi target utama trojan perbankan Android (seperti Anatsa/Godfather)?',
      options: [
        {
          text: 'Izin ini memungkinkan malware membaca isi layar (screen logging), mengklik tombol otomatis tanpa intervensi pengguna, dan mencegat notifikasi OTP SMS.',
          isCorrect: true,
          reason: 'Sangat tepat! Accessibility Service dirancang untuk difabel, sehingga memiliki hak istimewa membaca seluruh tampilan layar dan mengontrol input secara senyap.',
        },
        {
          text: 'Izin ini hanya digunakan untuk mengubah resolusi layar dan menghemat daya baterai.',
          isCorrect: false,
          reason: 'Salah total. Ini adalah fitur aksesibilitas tingkat sistem dengan privasi kritis.',
        },
        {
          text: 'Izin ini otomatis menghapus seluruh foto di galeri ponsel seketika.',
          isCorrect: false,
          reason: 'Kurang tepat. Tujuan utama malware finansial adalah pencurian data otentikasi perbankan, bukan sekadar menghapus media.',
        },
      ],
    },
    {
      id: 's-02',
      difficulty: 'sulit',
      category: 'Serangan SIM Swap Fraud',
      scenario: 'Ponsel Anda tiba-tiba kehilangan sinyal seluler secara total (No Service) di tengah kota tanpa kerusakan fisik pada kartu SIM. Selang 10 menit kemudian, Anda menerima notifikasi email bahwa ada pemindahan perangkat m-banking baru.',
      question: 'Indikasi serangan siber apa yang sedang terjadi dan tindakan darurat apa yang harus segera diambil?',
      options: [
        {
          text: 'Terjadi SIM Swap Fraud (duplikasi kartu SIM oleh pelaku). Segera hubungi Call Center Bank untuk memblokir akun rekening, lalu hubungi gerai operator seluler.',
          isCorrect: true,
          reason: 'Tepat sekali! Pelaku telah menduplikasi kartu SIM Anda di gerai operator dengan identitas palsu, sehingga seluruh SMS OTP beralih ke tangan pelaku.',
        },
        {
          text: 'Menyalakan ulang (restart) ponsel berkali-kali dan menunggu hingga sinyal seluler kembali stabil esok hari.',
          isCorrect: false,
          reason: 'Sangat fatal! Menunggu akan memberikan waktu leluasa bagi pelaku untuk menguras seluruh saldo tabungan dan limit pinjaman Anda.',
        },
        {
          text: 'Membeli paket data internet baru dari aplikasi marketplace.',
          isCorrect: false,
          reason: 'Tidak relevan karena kartu SIM fisik Anda sudah dinonaktifkan dari jaringan operator.',
        },
      ],
    },
    {
      id: 's-03',
      difficulty: 'sulit',
      category: 'AI Voice Cloning & Deepfake Vishing',
      scenario: 'Anda menerima panggilan telepon dengan suara yang 100% identik dengan Direktur atau anggota keluarga Anda, mendesak Anda segera mentransfer dana talangan mendesak ke nomor rekening pihak ketiga.',
      question: 'Bagaimana cara paling efektif untuk mematahkan serangan rekayasa audio generatif (Deepfake Voice) ini?',
      options: [
        {
          text: 'Minta kata sandi rahasia keluarga/kantor (Safe Word) yang telah disepakati sebelumnya, atau matikan telepon dan hubungi nomor telepon terpercaya beliau di perangkat lain.',
          isCorrect: true,
          reason: 'Luar biasa! Safe Word (kata sandi pribadi yang tidak pernah diunggah ke internet) dan out-of-band verification adalah benteng pertahanan terbaik melawan AI Voice Clone.',
        },
        {
          text: 'Mendengarkan dengan volume maksimal untuk mendeteksi apakah ada dengung suara robot.',
          isCorrect: false,
          reason: 'Tidak andal. Model AI Voice Clone modern mampu mereproduksi intonasi emosi, desah napas, dan suara latar dengan sangat mulus.',
        },
        {
          text: 'Meminta bukti foto selfie KTP melalui WhatsApp.',
          isCorrect: false,
          reason: 'Beresiko, karena foto KTP korban pembobolan data mudah dipalsukan atau didapat di pasar gelap siber.',
        },
      ],
    },
    {
      id: 's-04',
      difficulty: 'sulit',
      category: 'IDN Homograph Attack (Punycode)',
      scenario: 'Sebuah website memiliki ikon gembok hijau HTTPS yang valid dan tampak bertuliskan "apple.com", namun saat disalin ke teks mentah URL-nya berubah menjadi "xn--pple-43d.com".',
      question: 'Teknik penipuan apa yang digunakan dan mengapa sertifikat HTTPS tetap berstatus aman (valid)?',
      options: [
        {
          text: 'IDN Homograph Attack: Pelaku menggunakan karakter Cyrillic yang mirip secara visual. HTTPS hanya memvalidasi enkripsi koneksi ke domain tersebut, bukan keaslian bisnis pemiliknya.',
          isCorrect: true,
          reason: 'Analisis tingkat ahli! Sertifikat TLS/HTTPS hanya membuktikan bahwa komunikasi terenkripsi dengan pemilik domain terdaftar, bukan berarti domain itu bukan milik sindikat phishing.',
        },
        {
          text: 'Itu adalah tautan resmi Apple khusus untuk server kawasan Eropa Timur.',
          isCorrect: false,
          reason: 'Salah besar! Ini adalah manipulasi karakter alfabet Punycode untuk menipu mata manusia.',
        },
        {
          text: 'Browser mengalami bug render font saat memuat halaman.',
          isCorrect: false,
          reason: 'Bukan, Punycode adalah standar resmi penulisan domain internasional non-ASCII yang disalahgunakan penjahat siber.',
        },
      ],
    },
    {
      id: 's-05',
      difficulty: 'sulit',
      category: 'Session Hijacking / Infostealer Malware',
      scenario: 'Pengguna mengunduh software bajakan di PC. Beberapa jam kemudian, akun Google dan Telegram-nya dibobol tanpa ada SMS OTP masuk dan tanpa ada peringatan password salah.',
      question: 'Vektor serangan apa yang paling mungkin terjadi?',
      options: [
        {
          text: 'Infostealer mencuri file cookie sesi login (Session Cookies/Tokens) dari peramban, memungkinkan pelaku masuk tanpa perlu autentikasi password atau OTP.',
          isCorrect: true,
          reason: 'Tepat sekali! Cookie sesi yang dicuri (Session Hijacking) mengizinkan penyerang melakukan impersonasi sesi aktif tanpa memicu proses 2FA.',
        },
        {
          text: 'Pihak Google secara sepihak mematikan fitur 2FA pada akun tersebut.',
          isCorrect: false,
          reason: 'Tidak masuk akal. Google tidak pernah mematikan perlindungan keamanan pengguna secara sepihak.',
        },
        {
          text: 'Pelaku menebak password menggunakan kecerdasan buatan superkomputer.',
          isCorrect: false,
          reason: 'Salah. Walaupun password ditebak, sistem 2FA OTP tetap akan terpicu jika tidak membajak session cookie.',
        },
      ],
    },
    {
      id: 's-06',
      difficulty: 'sulit',
      category: 'Insiden Tanggap Darurat (Incident Response)',
      scenario: 'Seorang kerabat mengaku tidak sengaja menekan dan menginstal file APK kurir di ponselnya 2 menit yang lalu, dan ponselnya mulai menerima banyak SMS misterius.',
      question: 'Tindakan pertama dan paling krusial yang harus dilakukan dalam 30 detik pertama adalah:',
      options: [
        {
          text: 'Segera aktifkan Mode Pesawat (Airplane Mode) atau matikan koneksi internet (WiFi & Data Seluler) untuk memutus komunikasi malware ke server C2 penipu.',
          isCorrect: true,
          reason: 'Tindakan mitigasi sempurna! Memutus jaringan seketika mencegah malware mengirimkan isi SMS/OTP yang sedang disadap ke server penyerang di internet.',
        },
        {
          text: 'Membuka aplikasi perbankan satu per satu untuk mengecek sisa saldo tabungan.',
          isCorrect: false,
          reason: 'Sangat berbahaya! Membuka m-banking saat malware aktif justru memberikan kesempatan bagi malware merekam PIN atau kredensial yang Anda ketik.',
        },
        {
          text: 'Mencabut baterai ponsel secara paksa menggunakan obeng.',
          isCorrect: false,
          reason: 'Ponsel modern menggunakan baterai tanam dan tindakan ini memakan waktu lama serta membahayakan fisik perangkat.',
        },
      ],
    },
  ],
};

export const DIFFICULTY_METADATA = {
  pemula: {
    level: 1,
    title: 'Tingkat Pemula (Level 1)',
    badge: 'Cyber Aware Starter',
    description: 'Kenali indikator mencolok: penipuan undian, berkas APK dasar, phishing OTP, dan pembajakan akun sosial.',
    passScorePercentage: 65,
    accentColor: '#143826',
    tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  menengah: {
    level: 2,
    title: 'Tingkat Menengah (Level 2)',
    badge: 'Cyber Defender Specialist',
    description: 'Analisis rekayasa sosial rapi: domain spoofing, trik baiting task scam, QRIS palsu (Quishing), dan batas waktu buatan.',
    passScorePercentage: 70,
    accentColor: '#E86A33',
    tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  sulit: {
    level: 3,
    title: 'Tingkat Sulit / Mahir (Level 3)',
    badge: 'Elite Security Master',
    description: 'Investigasi tingkat lanjut: izin Accessibility Service, SIM Swap fraud, AI voice deepfake cloning, dan insiden response mitigasi.',
    passScorePercentage: 75,
    accentColor: '#7C2D12',
    tagColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
} as const;

